# """
# Authentication endpoints for user registration, login, and token management.

# Implements:
# - User registration and login
# - JWT token generation and validation
# - User session management
# """

# from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlmodel import select
# import jwt
# import os
# from datetime import datetime, timedelta
# from typing import Optional
# from passlib.context import CryptContext

# from models import User, UserCreate, UserLogin, UserResponse, RegisterRequest, LoginRequest, TokenResponse
# from models import AuthResponse  # Import separately to avoid circular issues
# from dependencies import get_db
# from auth.jwt import JWT_SECRET

# # Password hashing context
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

# router = APIRouter()
# security = HTTPBearer()

# # JWT token expiration time (24 hours)
# ACCESS_TOKEN_EXPIRE_MINUTES = 1440

# def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
#     """Create a new JWT access token."""
#     to_encode = data.copy()
#     if expires_delta:
#         expire = datetime.utcnow() + expires_delta
#     else:
#         expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
#     return encoded_jwt


# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     """Verify a plain password against a hashed password."""
#     try:
#         # Truncate plain password to 72 characters to match hashing
#         truncated_password = plain_password[:72] if len(plain_password) > 72 else plain_password
#         result = pwd_context.verify(truncated_password, hashed_password)
#         print(f"Password verification result: {result}")
#         return result
#     except Exception as e:
#         print(f"Password verification error: {e}")
#         return False


# def get_password_hash(password: str) -> str:
#     """Hash a plain password."""
#     # Truncate password to 72 characters to comply with bcrypt limit
#     truncated_password = password[:72] if len(password) > 72 else password
#     # Ensure password is a string and meets minimum requirements
#     if not truncated_password or len(truncated_password) < 1:
#         raise ValueError("Password must not be empty")
#     return pwd_context.hash(truncated_password)


# @router.post("/auth/register", summary="Register a new user", response_model=AuthResponse)
# async def register_user(
#     user_data: RegisterRequest,
#     session: AsyncSession = Depends(get_db)
# ):
#     """
#     Register a new user account.

#     Creates a new user in the database and returns JWT token for authentication.
#     """
#     try:
#         # Check if user already exists
#         result = await session.execute(
#             select(User).where(User.email == user_data.email)
#         )
#         existing_user = result.first()
#         if existing_user:
#             return AuthResponse(
#                 success=False,
#                 error="User with this email already exists",
#                 status=400
#             )

#         # Hash the password
#         hashed_password = get_password_hash(user_data.password)

#         # Create new user
#         user = User(
#             email=user_data.email,
#             username=user_data.username,
#             password=hashed_password,
#         )

#         session.add(user)
#         await session.commit()
#         await session.refresh(user)

#         # Generate JWT token
#         token_data = {
#             "sub": str(user.id),  # Using user ID as subject
#             "user_id": str(user.id),
#             "email": user.email,
#             "username": user.username
#         }
#         access_token = create_access_token(data=token_data)

#         user_response = UserResponse(
#             id=user.id,
#             email=user.email,
#             username=user.username
#         )

#         token_response = TokenResponse(
#             user=user_response,
#             token=access_token
#         )

#         return AuthResponse(
#             success=True,
#             data={"user": user_response.dict(), "token": access_token},
#             status=200
#         )
#     except Exception as e:
#         return AuthResponse(
#             success=False,
#             error=str(e),
#             status=500
#         )


# @router.post("/auth/login", summary="Login existing user", response_model=AuthResponse)
# async def login_user(
#     user_data: LoginRequest,
#     session: AsyncSession = Depends(get_db)
# ):
#     """
#     Authenticate user and return JWT token.

#     Validates user credentials and returns JWT token for subsequent API calls.
#     """
#     try:
#         # Find user by email
#         result = await session.execute(
#             select(User).where(User.email == user_data.email)
#         )
#         user = result.first()

#         if not user:
#             return AuthResponse(
#                 success=False,
#                 error="Invalid credentials",
#                 status=401
#             )

#         # Verify the hashed password
#         if not verify_password(user_data.password, user.password):
#             return AuthResponse(
#                 success=False,
#                 error="Invalid credentials",
#                 status=401
#             )

#         # Generate JWT token
#         token_data = {
#             "sub": str(user.id),
#             "user_id": str(user.id),
#             "email": user.email,
#             "username": user.username
#         }
#         access_token = create_access_token(data=token_data)

#         user_response = UserResponse(
#             id=user.id,
#             email=user.email,
#             username=user.username
#         )

#         return AuthResponse(
#             success=True,
#             data={"user": user_response.dict(), "token": access_token},
#             status=200
#         )
#     except Exception as e:
#         return AuthResponse(
#             success=False,
#             error=str(e),
#             status=500
#         )


# @router.post("/auth/verify", summary="Verify JWT token", response_model=AuthResponse)
# async def verify_token(
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """
#     Verify JWT token and return user information.

#     This endpoint can be used by the frontend to verify if a token is still valid.
#     """
#     token = credentials.credentials
#     try:
#         payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
#         user_id = payload.get("user_id")
#         if not user_id:
#             return AuthResponse(
#                 success=False,
#                 error="Invalid token",
#                 status=401
#             )

#         return AuthResponse(
#             success=True,
#             data={
#                 "user_id": user_id,
#                 "email": payload.get("email"),
#                 "username": payload.get("username")
#             },
#             status=200
#         )
#     except jwt.ExpiredSignatureError:
#         return AuthResponse(
#             success=False,
#             error="Token has expired",
#             status=401
#         )
#     except jwt.JWTError:
#         return AuthResponse(
#             success=False,
#             error="Invalid token",
#             status=401
#         )


# @router.post("/auth/refresh", summary="Refresh JWT token", response_model=AuthResponse)
# async def refresh_token():
#     """
#     Refresh an existing JWT token.

#     This endpoint would normally accept a refresh token and return a new access token.
#     For simplicity, this is a placeholder that would need to be implemented with refresh tokens.
#     """
#     return AuthResponse(
#         success=False,
#         error="Refresh token functionality not implemented in this version",
#         status=501
#     )


# @router.post("/auth/logout", summary="Logout user", response_model=AuthResponse)
# async def logout_user():
#     """
#     Logout user endpoint.

#     This endpoint is currently a placeholder. In a real implementation,
#     you might want to add the token to a blacklist/revocation list.
#     """
#     return AuthResponse(
#         success=True,
#         data={"message": "Successfully logged out"},
#         status=200
#     )


"""
Authentication endpoints for user registration, login, and token management.
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
import jwt
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext

from models import (
    User,
    UserResponse,
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    AuthResponse,
)
from dependencies import get_db
from auth.jwt import JWT_SECRET

router = APIRouter()
security = HTTPBearer()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours


# =========================
# JWT helpers
# =========================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")


def get_password_hash(password: str) -> str:
    # Ensure password is not empty and truncate to 72 characters for bcrypt
    if not password:
        raise ValueError("Password cannot be empty")
    truncated_password = password[:72] if len(password) > 72 else password
    return pwd_context.hash(truncated_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Truncate password to 72 characters for bcrypt compatibility
    truncated_password = plain_password[:72] if len(plain_password) > 72 else plain_password
    return pwd_context.verify(truncated_password, hashed_password)


# =========================
# Register
# =========================
@router.post("/auth/register", response_model=AuthResponse)
async def register_user(
    user_data: RegisterRequest,
    session: AsyncSession = Depends(get_db),
):
    try:
        result = await session.execute(
            select(User).where(User.email == user_data.email)
        )
        existing_user = result.scalars().first()

        if existing_user:
            return AuthResponse(
                success=False,
                error="User with this email already exists",
                status=400,
            )

        user = User(
            email=user_data.email,
            username=user_data.username,
            password=get_password_hash(user_data.password),
        )

        session.add(user)
        await session.commit()
        await session.refresh(user)

        token = create_access_token(
            {
                "sub": str(user.id),
                "user_id": str(user.id),
                "email": user.email,
                "username": user.username,
            }
        )

        return AuthResponse(
            success=True,
            data={
                "user": UserResponse(
                    id=user.id,
                    email=user.email,
                    username=user.username,
                ).dict(),
                "token": token,
            },
            status=200,
        )

    except Exception as e:
        return AuthResponse(success=False, error=str(e), status=500)


# =========================
# Login
# =========================
@router.post("/auth/login", response_model=AuthResponse)
async def login_user(
    user_data: LoginRequest,
    session: AsyncSession = Depends(get_db),
):
    try:
        result = await session.execute(
            select(User).where(User.email == user_data.email)
        )
        user = result.scalars().first()

        if not user or not verify_password(user_data.password, user.password):
            return AuthResponse(
                success=False,
                error="Invalid credentials",
                status=401,
            )

        token = create_access_token(
            {
                "sub": str(user.id),
                "user_id": str(user.id),
                "email": user.email,
                "username": user.username,
            }
        )

        return AuthResponse(
            success=True,
            data={
                "user": UserResponse(
                    id=user.id,
                    email=user.email,
                    username=user.username,
                ).dict(),
                "token": token,
            },
            status=200,
        )

    except Exception as e:
        return AuthResponse(success=False, error=str(e), status=500)


# =========================
# Verify Token
# =========================
@router.post("/auth/verify", response_model=AuthResponse)
async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        payload = jwt.decode(
            credentials.credentials, JWT_SECRET, algorithms=["HS256"]
        )

        return AuthResponse(
            success=True,
            data={
                "user_id": payload.get("user_id"),
                "email": payload.get("email"),
                "username": payload.get("username"),
            },
            status=200,
        )

    except jwt.ExpiredSignatureError:
        return AuthResponse(success=False, error="Token expired", status=401)
    except jwt.InvalidTokenError:
        return AuthResponse(success=False, error="Invalid token", status=401)


# =========================
# Logout (stateless)
# =========================
@router.post("/auth/logout", response_model=AuthResponse)
async def logout_user():
    return AuthResponse(
        success=True,
        data={"message": "Logged out successfully"},
        status=200,
    )
