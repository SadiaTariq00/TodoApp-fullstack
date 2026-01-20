"""
Task CRUD endpoints.

Implements all 6 task operations with JWT authentication and per-user data isolation:
- POST /api/{user_id}/tasks - Create task
- GET /api/{user_id}/tasks - List tasks
- GET /api/{user_id}/tasks/{id} - Get single task
- PUT /api/{user_id}/tasks/{id} - Update task
- PATCH /api/{user_id}/tasks/{id}/complete - Toggle completion
- DELETE /api/{user_id}/tasks/{id} - Delete task
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List
import logging

from models import Task, TaskCreate, TaskUpdate, TaskRead
from dependencies import get_db, get_current_user

logger = logging.getLogger(__name__)

# Define security scheme for Swagger UI
security = HTTPBearer()

router = APIRouter()


# ============================================================================
# User Story 1: Authenticated Task Creation (Priority: P1)
# ============================================================================

@router.post(
    "/api/{user_id}/tasks",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create new task",
    description="Creates a new task for authenticated user. User ID from JWT is auto-assigned."
)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    session: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
) -> TaskRead:
    """
    Create new task for authenticated user.

    Implements:
    - FR-003: URL user_id must match JWT user_id
    - FR-005: Return 403 on user_id mismatch
    - FR-007, FR-008: Title/description validation (handled by Pydantic)
    - FR-009: Auto-generate task ID
    - FR-010, FR-011: Auto-populate timestamps
    - FR-012: Default completed=False

    Args:
        user_id: User ID from URL path (must match JWT)
        task_data: Task creation data (title, description, completed)
        session: Database session (injected)
        current_user: Authenticated user ID from JWT (injected)

    Returns:
        Task: Created task with ID and timestamps

    Raises:
        HTTPException 401: Missing/invalid/expired JWT (handled by dependency)
        HTTPException 403: user_id doesn't match JWT user_id
        HTTPException 422: Validation error (title too long, etc.)
        HTTPException 503: Database connection failure
    """
    # T017: Authorization check - compare path user_id with JWT user_id
    if user_id != current_user:
        logger.warning(
            f"Authorization failed: URL user_id={user_id}, JWT user_id={current_user}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: user_id mismatch"
        )

    # T015: Create task with auto-populated fields
    try:
        task = Task(
            **task_data.model_dump(),
            user_id=current_user  # Inject from JWT, not from request body
        )

        # T015: Save to database
        session.add(task)
        await session.commit()
        await session.refresh(task)

        logger.info(f"Task {task.id} created successfully for user {current_user}")
        return task

    except Exception as e:
        # T019: Database error handling
        logger.error(f"Database error creating task: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable"
        )


# ============================================================================
# User Story 2: Retrieve Personal Task List (Priority: P1)
# ============================================================================

@router.get(
    "/api/{user_id}/tasks",
    response_model=List[TaskRead],
    summary="List all user tasks",
    description="Returns array of all tasks belonging to authenticated user."
)
async def list_tasks(
    user_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
) -> List[TaskRead]:
    """
    List all tasks for authenticated user.

    Implements:
    - FR-003: URL user_id must match JWT user_id
    - FR-013: Query scoped by user_id for data isolation
    - SC-002: 100% data isolation between users

    Args:
        user_id: User ID from URL path (must match JWT)
        session: Database session (injected)
        current_user: Authenticated user ID from JWT (injected)

    Returns:
        List[Task]: Array of user's tasks (empty array if no tasks)

    Raises:
        HTTPException 401: Missing/invalid/expired JWT
        HTTPException 403: user_id doesn't match JWT user_id
    """
    # T024: Authorization check
    if user_id != current_user:
        logger.warning(
            f"Authorization failed: URL user_id={user_id}, JWT user_id={current_user}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: user_id mismatch"
        )

    # T023, T025: Query database with user_id filter (data isolation)
    statement = select(Task).where(Task.user_id == current_user)
    results = await session.execute(statement)
    tasks = results.scalars().all()

    # Convert Task objects to TaskRead objects for response
    task_reads = [TaskRead.from_task(task) for task in tasks]

    logger.info(f"Retrieved {len(tasks)} tasks for user {current_user}")
    return task_reads


# ============================================================================
# User Story 6: Retrieve Single Task Details (Priority: P3)
# ============================================================================

@router.get(
    "/api/{user_id}/tasks/{task_id}",
    response_model=TaskRead,
    summary="Get single task",
    description="Returns detailed information for a specific task owned by authenticated user."
)
async def get_task(
    user_id: str,
    task_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
) -> TaskRead:
    """
    Get single task by ID.

    Implements:
    - FR-003: URL user_id must match JWT user_id
    - FR-013: Query scoped by both task ID and user_id
    - SC-002: Cannot access tasks belonging to other users

    Args:
        user_id: User ID from URL path (must match JWT)
        task_id: Task ID from URL path
        session: Database session (injected)
        current_user: Authenticated user ID from JWT (injected)

    Returns:
        Task: Task details

    Raises:
        HTTPException 401: Missing/invalid/expired JWT
        HTTPException 403: user_id doesn't match JWT user_id
        HTTPException 404: Task not found or not owned by user
    """
    # T031: Authorization check
    if user_id != current_user:
        logger.warning(
            f"Authorization failed: URL user_id={user_id}, JWT user_id={current_user}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: user_id mismatch"
        )

    # T030, T032: Query with ownership validation
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user
    )
    result = await session.execute(statement)
    task = result.scalar()

    # T033: Handle not found
    if not task:
        logger.warning(f"Task {task_id} not found for user {current_user}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    logger.info(f"Retrieved task {task_id} for user {current_user}")
    return TaskRead.from_task(task)


# ============================================================================
# User Story 3: Update Task Details (Priority: P2)
# ============================================================================

@router.put(
    "/api/{user_id}/tasks/{task_id}",
    response_model=TaskRead,
    summary="Update task details",
    description="Updates title, description, and/or completed status. Partial updates allowed."
)
async def update_task(
    user_id: str,
    task_id: int,
    task_update: TaskUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
) -> TaskRead:
    """
    Update task details.

    Implements:
    - FR-003: URL user_id must match JWT user_id
    - FR-011: Auto-update updated_at timestamp
    - FR-013: Query scoped by both task ID and user_id
    - SC-004: Atomic updates with data consistency

    Args:
        user_id: User ID from URL path (must match JWT)
        task_id: Task ID from URL path
        task_update: Updated fields (title, description, completed - all optional)
        session: Database session (injected)
        current_user: Authenticated user ID from JWT (injected)

    Returns:
        Task: Updated task with refreshed timestamp

    Raises:
        HTTPException 401: Missing/invalid/expired JWT
        HTTPException 403: user_id doesn't match JWT user_id
        HTTPException 404: Task not found or not owned by user
        HTTPException 422: Validation error (title too long, etc.)
    """
    # T037: Authorization check
    if user_id != current_user:
        logger.warning(
            f"Authorization failed: URL user_id={user_id}, JWT user_id={current_user}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: user_id mismatch"
        )

    # T036, T038: Fetch task with ownership check
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user
    )
    result = await session.execute(statement)
    task = result.scalar()

    # T041: Handle not found
    if not task:
        logger.warning(f"Task {task_id} not found for user {current_user}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # T039: Partial update - only update provided fields
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    # T040: Refresh updated_at timestamp
    task.update_timestamp()

    # T043: Commit changes (immutable fields protected by model)
    try:
        session.add(task)
        await session.commit()
        await session.refresh(task)

        logger.info(f"Task {task_id} updated successfully for user {current_user}")
        return TaskRead.from_task(task)

    except Exception as e:
        logger.error(f"Database error updating task: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable"
        )


# ============================================================================
# User Story 4: Mark Task Complete/Incomplete (Priority: P2)
# ============================================================================

@router.patch(
    "/api/{user_id}/tasks/{task_id}/complete",
    response_model=TaskRead,
    summary="Toggle task completion",
    description="Flips completed boolean: true → false or false → true."
)
async def toggle_task_completion(
    user_id: str,
    task_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
) -> TaskRead:
    """
    Toggle task completion status.

    Implements:
    - FR-003: URL user_id must match JWT user_id
    - FR-011: Auto-update updated_at timestamp
    - FR-013: Query scoped by both task ID and user_id
    - SC-004: Atomic toggle operation

    Args:
        user_id: User ID from URL path (must match JWT)
        task_id: Task ID from URL path
        session: Database session (injected)
        current_user: Authenticated user ID from JWT (injected)

    Returns:
        Task: Task with toggled completion status

    Raises:
        HTTPException 401: Missing/invalid/expired JWT
        HTTPException 403: user_id doesn't match JWT user_id
        HTTPException 404: Task not found or not owned by user
    """
    # T046: Authorization check
    if user_id != current_user:
        logger.warning(
            f"Authorization failed: URL user_id={user_id}, JWT user_id={current_user}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: user_id mismatch"
        )

    # T045, T047: Fetch task with ownership check
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user
    )
    result = await session.execute(statement)
    task = result.scalar()

    # T050: Handle not found
    if not task:
        logger.warning(f"Task {task_id} not found for user {current_user}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # T048: Toggle completed status
    task.completed = not task.completed

    # T049: Refresh updated_at timestamp
    task.update_timestamp()

    # Commit changes
    try:
        session.add(task)
        await session.commit()
        await session.refresh(task)

        logger.info(
            f"Task {task_id} completion toggled to {task.completed} for user {current_user}"
        )
        return TaskRead.from_task(task)

    except Exception as e:
        logger.error(f"Database error toggling task completion: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable"
        )


# ============================================================================
# User Story 5: Delete Task (Priority: P3)
# ============================================================================

@router.delete(
    "/api/{user_id}/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task",
    description="Permanently removes task from database (hard delete, not reversible)."
)
async def delete_task(
    user_id: str,
    task_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Delete task permanently.

    Implements:
    - FR-003: URL user_id must match JWT user_id
    - FR-013: Query scoped by both task ID and user_id
    - SC-004: Atomic delete operation

    Args:
        user_id: User ID from URL path (must match JWT)
        task_id: Task ID from URL path
        session: Database session (injected)
        current_user: Authenticated user ID from JWT (injected)

    Returns:
        None: 204 No Content on success

    Raises:
        HTTPException 401: Missing/invalid/expired JWT
        HTTPException 403: user_id doesn't match JWT user_id
        HTTPException 404: Task not found or not owned by user
    """
    # T053: Authorization check
    if user_id != current_user:
        logger.warning(
            f"Authorization failed: URL user_id={user_id}, JWT user_id={current_user}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: user_id mismatch"
        )

    # T052, T054: Fetch task with ownership check
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user
    )
    result = await session.execute(statement)
    task = result.scalar()

    # T056: Handle not found
    if not task:
        logger.warning(f"Task {task_id} not found for user {current_user}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # T055: Hard delete
    try:
        await session.delete(task)
        await session.commit()

        logger.info(f"Task {task_id} deleted successfully for user {current_user}")
        # T057: Return None for 204 No Content

    except Exception as e:
        logger.error(f"Database error deleting task: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable"
        )
