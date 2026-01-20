"""
Hugging Face Spaces deployment entry point.

This file serves as the main entry point for deployment on Hugging Face Spaces.
It initializes the FastAPI app and handles the application lifecycle.
"""

import os
import logging
from main import app  # Import the configured FastAPI app

# Configure logging for Hugging Face Spaces
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Application initialized successfully")
logger.info(f"Environment: {os.environ.get('ENVIRONMENT', 'development')}")

# The app object is what Hugging Face Spaces will look for
# This allows the space to properly serve the FastAPI application
application = app  # For compatibility with some deployment platforms

if __name__ == "__main__":
    # This section runs only when executed directly (for local development)
    import uvicorn

    # Get port from environment (Hugging Face sets PORT, others may use different vars)
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    # Set timeout values for the server
    timeout_keep_alive = int(os.environ.get("TIMEOUT_KEEP_ALIVE", "60"))
    timeout_graceful_shutdown = int(os.environ.get("TIMEOUT_GRACEFUL_SHUTDOWN", "30"))

    logger.info(f"Starting server on {host}:{port}")

    uvicorn.run(
        "app:app",  # Points to this file's app object
        host=host,
        port=port,
        reload=os.getenv("DEBUG", "false").lower() == "true",
        timeout_keep_alive=timeout_keep_alive,
        graceful_shutdown_timeout=timeout_graceful_shutdown
    )