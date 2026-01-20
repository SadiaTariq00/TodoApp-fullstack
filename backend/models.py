
"""
SQLModel data models for Task and User entities.

Implements:
- FR-007: Title length constraint (1-200 chars)
- FR-008: Description length constraint (0-1000 chars)
- FR-009: Auto-incrementing integer ID
- FR-010: Auto-populated created_at timestamp
- FR-011: Auto-updated updated_at timestamp
- FR-012: Default completed=False
- FR-018: Indexed user_id for query performance
"""

from sqlmodel import SQLModel, Field
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any


class TaskBase(SQLModel):
    """Base task fields shared between create/update schemas."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = False


class TaskCreate(TaskBase):
    """
    Client request body for creating new task.

    User ID is NOT accepted (injected from JWT).
    ID, timestamps are server-managed.
    """
    pass


class TaskUpdate(SQLModel):
    """
    Client request body for updating existing task.

    All fields optional (partial updates allowed).
    Only provided fields are updated.
    """
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None


class Task(TaskBase, table=True):
    """
    Database table for user tasks.

    Enforces complete data isolation between users via user_id field.
    Timestamps auto-managed on creation and updates.
    """

    # Primary key - auto-incrementing integer (FR-009)
    id: Optional[int] = Field(default=None, primary_key=True)

    # Owner identifier - extracted from JWT token (FR-013, FR-018)
    user_id: str = Field(index=True, nullable=False)

    # Timestamps - auto-managed (FR-010, FR-011)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    def update_timestamp(self):
        """Refresh updated_at timestamp. Call before commit on updates."""
        self.updated_at = datetime.utcnow()

    model_config = {"arbitrary_types_allowed": True}


class TaskRead(TaskBase):
    """Response model for tasks - excludes SQLAlchemy table metadata."""

    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_task(cls, task: 'Task') -> 'TaskRead':
        """Convert Task object to TaskRead response model."""
        return cls(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at,
            updated_at=task.updated_at
        )


class UserBase(SQLModel):
    """Base user fields shared between create/update schemas."""
    email: str = Field(unique=True, nullable=False)
    username: str = Field(max_length=100, nullable=False)


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(min_length=6, max_length=72)  # bcrypt limit


class UserLogin(SQLModel):
    """Schema for user login."""
    email: str = Field(nullable=False)
    password: str = Field(min_length=6, max_length=72)  # bcrypt limit


class User(UserBase, table=True):
    """
    Database table for users.
    """

    # Primary key - auto-incrementing integer
    id: Optional[int] = Field(default=None, primary_key=True)

    # Password field (hashed)
    password: str = Field(nullable=False)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class UserResponse(BaseModel):
    """Response model for user data without sensitive information."""
    id: int
    email: str
    username: str


class AuthResponse(BaseModel):
    """Standard response format for authentication endpoints."""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    status: int


class RegisterRequest(SQLModel):
    """Request model for user registration."""
    email: str
    username: str
    password: str = Field(min_length=6, max_length=72)  # bcrypt limit


class LoginRequest(SQLModel):
    """Request model for user login."""
    email: str
    password: str = Field(min_length=6, max_length=72)  # bcrypt limit


class TokenResponse(BaseModel):
    """Response model for token-related operations."""
    user: UserResponse
    token: str
