"""
Database engine and session management.

Uses asyncpg driver for Neon PostgreSQL with SQLModel async engine.
Implements dependency injection pattern for FastAPI.
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
import logging
from dotenv import load_dotenv

# Import models to register them with SQLModel metadata
from models import User, Task  # Import all models to register with metadata

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Get database URL from environment
DATABASE_URL = os.getenv("NEON_DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("NEON_DATABASE_URL environment variable is required")

# Create async engine with asyncpg driver
# echo=False for production (set to True for SQL query logging during development)
# Configure for serverless deployment with appropriate pooling and timeout settings
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    # Pool settings optimized for serverless environments
    pool_size=2,         # Reduced for serverless
    max_overflow=5,      # Reduced for serverless
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
    pool_timeout=30,     # Timeout for getting connection from pool
    pool_reset_on_return="commit",  # Reset connection when returned to pool
    # Connection timeout settings
    connect_args={
        "server_settings": {
            "statement_timeout": "30000",  # 30 seconds statement timeout
        }
    }
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_session():
    """
    FastAPI dependency for database sessions.

    Provides async session with automatic lifecycle management.
    Use with Depends(get_session) in route handlers.

    Yields:
        AsyncSession: Database session for queries and transactions
    """
    async with async_session() as session:
        yield session


async def init_db():
    """
    Initialize database schema.

    Creates all tables defined in SQLModel models if they don't exist.
    Idempotent - safe to call multiple times.

    Called during application startup event in main.py
    """
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        # Don't raise the exception to allow the app to start even if DB is temporarily unavailable
        logger.warning("Continuing without database initialization. Some features may not work.")


async def close_db():
    """
    Close database connections.

    Disposes of connection pool.
    Called during application shutdown event in main.py
    """
    await engine.dispose()
    logger.info("Database connections closed")
