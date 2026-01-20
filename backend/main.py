"""
FastAPI application entry point.

Implements:
- FastAPI app initialization
- CORS middleware configuration
- Environment variable loading and validation
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

# --------------------------------------------------
# Load environment variables
# --------------------------------------------------
load_dotenv()

# --------------------------------------------------
# Logging configuration
# --------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --------------------------------------------------
# Validate required environment variables
# --------------------------------------------------
def validate_environment():
    required_vars = [
        "BETTER_AUTH_SECRET",
        "NEON_DATABASE_URL"
    ]

    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise ValueError(f"Missing environment variables: {', '.join(missing)}")

    logger.info("Environment variables validated successfully")

validate_environment()

# --------------------------------------------------
# App configuration
# --------------------------------------------------
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# Frontend URLs (IMPORTANT for CORS)
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://todo-app-fullstack-two.vercel.app"
)

allow_origins_list = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]

# --------------------------------------------------
# FastAPI app
# --------------------------------------------------
app = FastAPI(
    title="Todo Backend API",
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None
)

# --------------------------------------------------
# CORS Middleware (🔥 FIXED)
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"CORS enabled for origins: {allow_origins_list}")

# --------------------------------------------------
# Database lifecycle
# --------------------------------------------------
@app.on_event("startup")
async def startup_event():
    logger.info("Starting Todo Backend API...")
    await init_db()
    logger.info("Startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Todo Backend API...")
    await close_db()
    logger.info("Shutdown complete")

# --------------------------------------------------
# Health & Root endpoints
# --------------------------------------------------
@app.get("/")
async def root():
    return {
        "message": "Todo Backend API is running",
        "status": "healthy"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

# --------------------------------------------------
# Security scheme
# --------------------------------------------------
security_scheme = HTTPBearer()

# --------------------------------------------------
# Routers
# --------------------------------------------------
from routes.auth import router as auth_router
from routes.tasks import router as tasks_router

app.include_router(
    auth_router,
    prefix="/api",
    tags=["auth"]
)

app.include_router(
    tasks_router,
    tags=["tasks"]
)

# --------------------------------------------------
# Local run
# --------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG
    )
