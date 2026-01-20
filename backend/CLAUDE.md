# Backend-Specific Claude Code Rules

This file contains Claude Code rules specific to the FastAPI backend.

## Project Context

- **Tech Stack**: FastAPI 0.109+, SQLModel 0.0.14, Neon PostgreSQL (asyncpg), PyJWT 2.8.0
- **Architecture**: Async REST API with JWT authentication and per-user data isolation
- **Entry Point**: `main.py` (run with `uvicorn main:app --reload`)
- **Database**: Neon Serverless PostgreSQL with async SQLModel ORM

## File Structure

```
backend/
├── main.py              # FastAPI app, CORS, router mounting, startup/shutdown
├── db.py                # Async SQLModel engine, session factory, database utilities
├── models.py            # SQLModel table definitions (Task), request/response schemas
├── dependencies.py      # FastAPI dependencies (get_db, get_current_user)
├── auth/
│   └── jwt.py           # JWT decoding, validation, user extraction, error handling
├── routes/
│   └── tasks.py         # Task CRUD endpoints (all 6 endpoints)
├── tests/               # pytest tests (if added later)
├── .env                 # Environment variables (gitignored)
├── .env.example         # Example environment config
└── requirements.txt     # Python dependencies
```

## Development Guidelines

### Security (CRITICAL)

- **JWT Validation**: EVERY endpoint MUST validate JWT token via `get_current_user()` dependency
- **User ID Matching**: ALWAYS compare path `user_id` with JWT `user_id` before any operation
- **Query Scoping**: ALL database queries MUST include `WHERE user_id = current_user_id` filter
- **Error Messages**: NEVER expose JWT tokens, secrets, database details, or stack traces to API clients
- **Logging**: Log authentication failures for security monitoring without exposing sensitive data

### Database Operations

- **Async Everywhere**: Use `async`/`await` with AsyncSession from SQLModel
- **Session Management**: Use `Depends(get_session)` for automatic session lifecycle
- **Timestamps**: `created_at` set once on creation, `updated_at` refreshed on every update
- **Validation**: Pydantic validates before database - trust validation errors (422)
- **Error Handling**: Catch connection failures → 503 Service Unavailable with sanitized message

### API Conventions

- **Status Codes**:
  - 200 OK (GET, PUT, PATCH successful)
  - 201 Created (POST successful)
  - 204 No Content (DELETE successful)
  - 401 Unauthorized (missing/invalid/expired JWT)
  - 403 Forbidden (valid JWT but user_id mismatch)
  - 404 Not Found (resource doesn't exist)
  - 422 Unprocessable Entity (validation errors)
  - 503 Service Unavailable (database errors)

- **Error Format**: `{"detail": "Human-readable message"}`
- **Validation Errors**: FastAPI auto-generates 422 with field details

### Code Quality

- **Type Hints**: Use Python 3.11+ type hints everywhere for IDE support
- **Docstrings**: Document route handlers with parameters, returns, errors
- **Imports**: Group by stdlib, third-party, local modules
- **Async Functions**: Prefix with `async def`, use `await` for I/O operations
- **Constants**: Environment variables loaded at startup, validated before app starts

### Testing (If Added Later)

- **Fixtures**: Use `conftest.py` for test database, auth tokens, test client
- **Async Tests**: Use `pytest-asyncio` for async test functions
- **Coverage**: Target auth validation, CRUD operations, data isolation, edge cases
- **Test Database**: Use separate test database, reset between tests

## Common Patterns

### Route Handler Template

```python
@router.post("/api/{user_id}/tasks", status_code=201)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    session: AsyncSession = Depends(get_session),
    current_user: str = Depends(get_current_user)
) -> Task:
    """Create new task for authenticated user."""
    # 1. Authorization check
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access forbidden: user_id mismatch")

    # 2. Business logic
    task = Task(**task_data.dict(), user_id=current_user)
    session.add(task)
    await session.commit()
    await session.refresh(task)

    # 3. Return response
    return task
```

### Database Query Pattern

```python
from sqlmodel import select

# Scoped query - ALWAYS filter by user_id
statement = select(Task).where(Task.user_id == current_user_id)
results = await session.exec(statement)
tasks = results.all()
```

### Error Handling Pattern

```python
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

try:
    # Database operation
    await session.commit()
except Exception as e:
    logger.error(f"Database error: {str(e)}")
    raise HTTPException(status_code=503, detail="Service temporarily unavailable")
```

## Environment Variables

Required variables (validated at startup):
- `BETTER_AUTH_SECRET`: JWT signing secret (must match frontend)
- `NEON_DATABASE_URL`: PostgreSQL connection string (asyncpg format)
- `BETTER_AUTH_URL`: Frontend origin for CORS

Optional variables:
- `DEBUG`: Enable Swagger docs and verbose logging (default: false)

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with actual values

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# View API docs
# Browser: http://localhost:8000/docs
```

## References

- **Specification**: `/specs/002-fastapi-backend/spec.md`
- **Architecture Plan**: `/specs/002-fastapi-backend/plan.md`
- **Data Model**: `/specs/002-fastapi-backend/data-model.md`
- **API Contracts**: `/specs/002-fastapi-backend/contracts/openapi.yaml`
- **Developer Guide**: `/specs/002-fastapi-backend/quickstart.md`

## Constitutional Compliance

This backend implementation follows all constitutional mandates:
- ✅ §3: FastAPI + SQLModel + Neon PostgreSQL stack
- ✅ §5: REST API at `/api`, JWT required, ownership enforced
- ✅ §6: Located in `/backend` directory per monorepo structure
- ✅ §7: All code generated by Claude Code
- ✅ §8: Documentation in place (this file + README.md)
