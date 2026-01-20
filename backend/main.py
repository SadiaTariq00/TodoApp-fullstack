"""
FastAPI application entry point.

Implements:
- FastAPI app initialization
- CORS middleware configuration (FR-019)
- Environment variable loading and validation (FR-020)
- Database startup/shutdown events
- Router mounting
- Health check endpoint
- Logging configuration
"""

import os
import logging
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from dotenv import load_dotenv

from db import init_db, close_db

# Load environment variables from .env file
load_dotenv()

# Configure logging (FR-009: log auth failures)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Validate required environment variables
def validate_environment():
    """
    Validate required environment variables at startup.

    Raises:
        ValueError: If any required variable is missing
    """
    required_vars = [
        "BETTER_AUTH_SECRET",
        "NEON_DATABASE_URL",
        "BETTER_AUTH_URL"
    ]

    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing_vars)}"
        )

    logger.info("Environment variables validated successfully")


# Validate environment before creating app
validate_environment()

# Get configuration from environment
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
FRONTEND_URL = os.getenv("BETTER_AUTH_URL")

# Create FastAPI application
app = FastAPI(
    title="Todo Backend API",
    description="""
    Secure FastAPI backend with JWT authentication and per-user data isolation.

    ## Authentication
    All task endpoints require JWT Bearer token authentication.

    **How to authenticate:**
    1. Click the "Authorize" button (🔒) at the top right
    2. Enter your JWT token in the format: `Bearer <your_token>`
    3. Click "Authorize"
    4. Now you can test protected endpoints

    **Get JWT Token:**
    - Login via frontend at http://localhost:3000
    - Token is provided by Better Auth
    """,
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,  # Disable Swagger in production
    redoc_url="/redoc" if DEBUG else None
)


# Configure CORS middleware (FR-019)
# Allow multiple origins for flexibility in deployment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", FRONTEND_URL or "")
allow_origins_list = [origin.strip() for origin in ALLOWED_ORIGINS.split(",") if origin.strip()] if ALLOWED_ORIGINS else [FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins_list,  # Allow configured origins
    allow_credentials=True,  # Required for JWT cookies if used
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],  # Allow all headers for broader compatibility
)
logger.info(f"CORS configured for origins: {allow_origins_list}")


# Database lifecycle events
@app.on_event("startup")
async def startup_event():
    """
    Application startup event.

    Initializes database schema and logs startup.
    """
    logger.info("Starting Todo Backend API...")
    try:
        await init_db()
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event.

    Closes database connections and logs shutdown.
    """
    logger.info("Shutting down Todo Backend API...")
    await close_db()
    logger.info("Application shutdown complete")


# Root endpoint for Hugging Face Spaces health check
@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint for Hugging Face Spaces.

    Returns a simple message to indicate the application is running.
    """
    return {"message": "Todo Backend API is running", "status": "healthy"}

# Health check endpoint (no authentication required)
@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint.

    Returns service status and current timestamp.
    Does not require authentication.

    Returns:
        dict: Health status and ISO 8601 timestamp
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


# Define security scheme for OpenAPI/Swagger
security_scheme = HTTPBearer()

# Mount authentication router with /api prefix
from routes.auth import router as auth_router
app.include_router(
    auth_router,
    tags=["auth"],
    prefix="/api"
)

# Mount task router (no prefix needed since routes already include /api)
from routes.tasks import router as tasks_router
app.include_router(
    tasks_router,
    tags=["tasks"],
    dependencies=[]  # Security is handled per-endpoint via get_current_user dependency
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG
    )
