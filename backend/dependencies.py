"""
FastAPI dependency injection functions.

Provides reusable dependencies for:
- Database session management
- JWT authentication and user extraction
"""

from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_session
from auth.jwt import validate_token_and_extract_user


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Database session dependency.

    Alias for get_session from db.py for cleaner imports.
    Provides async session with automatic lifecycle management.

    Usage:
        @router.get("/endpoint")
        async def handler(session: AsyncSession = Depends(get_db)):
            ...

    Yields:
        AsyncSession: Database session for queries
    """
    async for session in get_session():
        yield session


def get_current_user(authorization: str = Depends(validate_token_and_extract_user)) -> str:
    """
    Current user authentication dependency.

    Validates JWT token and extracts user ID.
    Use on all protected endpoints to enforce authentication.

    Usage:
        @router.get("/api/{user_id}/tasks")
        async def list_tasks(
            user_id: str,
            current_user: str = Depends(get_current_user)
        ):
            if user_id != current_user:
                raise HTTPException(403, "Access forbidden")
            ...

    Args:
        authorization: Authorization header (injected by FastAPI)

    Returns:
        str: Authenticated user ID from JWT token

    Raises:
        HTTPException: 401 if token missing, invalid, or expired
    """
    return authorization
