"""
Complete FastAPI Todo API backend with JWT authentication

Endpoints:
- GET /health → returns health status
- POST /api/{user_id}/tasks → create a new task
- GET /api/{user_id}/tasks → list all tasks for a user
- GET /api/{user_id}/tasks/{task_id} → get a single task
- PUT /api/{user_id}/tasks/{task_id} → update task
- DELETE /api/{user_id}/tasks/{task_id} → delete task
- PATCH /api/{user_id}/tasks/{task_id}/complete → toggle completion
"""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
from passlib.context import CryptContext
import uvicorn

# Security configuration
SECRET_KEY = "your-secret-key-here"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme for Swagger UI
security = HTTPBearer()

# In-memory storage (use a database in production)
tasks_db = {}
users_db = {}

# Pydantic models
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class Task(TaskBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime

class TokenData(BaseModel):
    user_id: str

# FastAPI app
app = FastAPI(
    title="Todo API",
    description="A complete Todo API with JWT authentication",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc"  # ReDoc UI
)

# JWT utility functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a new JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a plain password"""
    return pwd_context.hash(password)

def verify_token(token: str) -> TokenData:
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return TokenData(user_id=user_id)
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    """Dependency to get current user from JWT token"""
    token = credentials.credentials
    return verify_token(token)

# Health endpoint
@app.get("/health", response_model=HealthResponse, summary="Health Check")
async def health_check():
    """
    Health check endpoint.

    Returns service status and current timestamp.
    Does not require authentication.
    """
    return HealthResponse(status="healthy", timestamp=datetime.utcnow())

# Task endpoints (all require authentication)
@app.post("/api/{user_id}/tasks", response_model=Task, status_code=status.HTTP_201_CREATED, summary="Create Task")
async def create_task(
    user_id: str,
    task: TaskCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Create a new task for the authenticated user.

    The user_id in the path must match the user_id in the JWT token.
    """
    # Verify that the user_id in the path matches the authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    # Generate a unique task ID
    task_id = len([t for t in tasks_db.values() if t["user_id"] == user_id]) + 1

    # Create the task
    new_task = Task(
        id=task_id,
        user_id=user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Store the task
    task_key = f"{user_id}:{task_id}"
    tasks_db[task_key] = new_task.dict()

    return new_task

@app.get("/api/{user_id}/tasks", response_model=List[Task], summary="List User Tasks")
async def list_tasks(
    user_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    List all tasks for the authenticated user.

    The user_id in the path must match the user_id in the JWT token.
    """
    # Verify that the user_id in the path matches the authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    # Get tasks for the user
    user_tasks = []
    for task_data in tasks_db.values():
        if task_data["user_id"] == user_id:
            user_tasks.append(Task(**task_data))

    return user_tasks

@app.get("/api/{user_id}/tasks/{task_id}", response_model=Task, summary="Get Single Task")
async def get_task(
    user_id: str,
    task_id: int,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get a single task by ID.

    The user_id in the path must match the user_id in the JWT token.
    The task must belong to the authenticated user.
    """
    # Verify that the user_id in the path matches the authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    # Get the task
    task_key = f"{user_id}:{task_id}"
    if task_key not in tasks_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task_data = tasks_db[task_key]
    return Task(**task_data)

@app.put("/api/{user_id}/tasks/{task_id}", response_model=Task, summary="Update Task")
async def update_task(
    user_id: str,
    task_id: int,
    task_update: TaskUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Update a task by ID.

    The user_id in the path must match the user_id in the JWT token.
    The task must belong to the authenticated user.
    Only provided fields will be updated (partial update).
    """
    # Verify that the user_id in the path matches the authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    # Get the task
    task_key = f"{user_id}:{task_id}"
    if task_key not in tasks_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Get existing task data
    existing_task = tasks_db[task_key]

    # Update only the fields that were provided
    updated_data = existing_task.copy()
    for field, value in task_update.dict(exclude_unset=True).items():
        if value is not None:
            updated_data[field] = value

    # Update timestamp
    updated_data["updated_at"] = datetime.utcnow()

    # Save updated task
    tasks_db[task_key] = updated_data

    return Task(**updated_data)

@app.delete("/api/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Task")
async def delete_task(
    user_id: str,
    task_id: int,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Delete a task by ID.

    The user_id in the path must match the user_id in the JWT token.
    The task must belong to the authenticated user.
    """
    # Verify that the user_id in the path matches the authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    # Get the task
    task_key = f"{user_id}:{task_id}"
    if task_key not in tasks_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Delete the task
    del tasks_db[task_key]

    return

@app.patch("/api/{user_id}/tasks/{task_id}/complete", response_model=Task, summary="Toggle Task Completion")
async def toggle_task_completion(
    user_id: str,
    task_id: int,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Toggle the completion status of a task.

    The user_id in the path must match the user_id in the JWT token.
    The task must belong to the authenticated user.
    """
    # Verify that the user_id in the path matches the authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    # Get the task
    task_key = f"{user_id}:{task_id}"
    if task_key not in tasks_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completion status
    existing_task = tasks_db[task_key]
    updated_task = existing_task.copy()
    updated_task["completed"] = not updated_task["completed"]
    updated_task["updated_at"] = datetime.utcnow()

    # Save updated task
    tasks_db[task_key] = updated_task

    return Task(**updated_task)

if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "todo_backend:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )