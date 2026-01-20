"""
JWT token validation and user extraction.

Implements:
- FR-001: JWT signature validation using BETTER_AUTH_SECRET
- FR-002: User identity extraction from JWT claims
- FR-004: Return 401 for missing/invalid/expired tokens
"""

import os
import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Get JWT secret from environment
JWT_SECRET = os.getenv("BETTER_AUTH_SECRET")

if not JWT_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable is required")

# Security scheme for Swagger UI
security = HTTPBearer()


def decode_token(token: str) -> dict:
    """
    Decode and validate JWT token.

    Args:
        token: Raw JWT token string

    Returns:
        dict: Decoded token claims

    Raises:
        HTTPException: 401 if token invalid, expired, or malformed
    """
    try:
        # Decode with signature verification and expiration check
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )
        return payload

    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )

    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT token: {type(e).__name__}")
        raise HTTPException(
            status_code=401,
            detail="Invalid or malformed token"
        )


def extract_user_id(payload: dict) -> str:
    """
    Extract user ID from JWT token claims.

    Args:
        payload: Decoded JWT token claims

    Returns:
        str: User identifier from token

    Raises:
        HTTPException: 401 if user_id claim missing
    """
    # Try standard JWT "sub" claim first, fallback to "user_id"
    user_id = payload.get("sub") or payload.get("user_id")

    if not user_id:
        logger.error("JWT token missing user identifier claim")
        raise HTTPException(
            status_code=401,
            detail="Token missing user identifier"
        )

    return user_id




def validate_token_and_extract_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Complete JWT validation pipeline.

    Combines token parsing, decoding, and user extraction.
    Use directly as FastAPI dependency for JWT-protected endpoints.

    This function is compatible with Swagger UI's "Authorize" button.

    Args:
        credentials: HTTP Bearer credentials (injected by FastAPI security)

    Returns:
        str: Authenticated user ID

    Raises:
        HTTPException: 401 if any validation step fails
    """
    # Extract token from credentials
    token = credentials.credentials

    # Decode and validate token
    payload = decode_token(token)

    # Extract user ID from claims
    user_id = extract_user_id(payload)

    logger.info(f"User {user_id} authenticated successfully")
    return user_id
