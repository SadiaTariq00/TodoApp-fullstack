# Research & Technical Decisions: FastAPI Backend

**Feature**: 002-fastapi-backend
**Date**: 2026-01-06
**Purpose**: Document technology choices, best practices, and architectural decisions for secure FastAPI backend with JWT auth and Neon PostgreSQL

---

## 1. JWT Authentication Library

### Decision: PyJWT with HS256 Algorithm

**Rationale**:
- PyJWT is the standard Python library for JWT handling with 50M+ monthly downloads
- HS256 (HMAC-SHA256) is appropriate for symmetric key scenarios where backend and frontend share BETTER_AUTH_SECRET
- Simpler than asymmetric RS256 since we don't need public/private key distribution
- Better Auth on frontend already uses symmetric signing, ensuring compatibility
- PyJWT provides automatic expiration checking and signature validation

**Alternatives Considered**:
- **python-jose**: More feature-rich but heavier dependency footprint; overkill for our needs
- **authlib**: Enterprise-grade but adds complexity for single-tenant JWT validation
- **RS256 with public/private keys**: Unnecessary complexity when frontend and backend are tightly coupled and share secret

**Implementation Notes**:
- Install: `pyjwt==2.8.0`
- Decode with `jwt.decode(token, secret, algorithms=["HS256"])`
- Extract user_id from claims (typically "sub" or "user_id" field)
- Handle jwt.ExpiredSignatureError → 401 Unauthorized
- Handle jwt.InvalidTokenError → 401 Unauthorized

**References**:
- PyJWT docs: https://pyjwt.readthedocs.io/
- JWT spec (RFC 7519): https://datatracker.ietf.org/doc/html/rfc7519
- Better Auth JWT format assumptions documented in spec.md

---

## 2. Database ORM and Async Driver

### Decision: SQLModel with asyncpg

**Rationale**:
- **SQLModel** mandated by constitution (§3: Backend - SQLModel ORM)
- SQLModel combines Pydantic validation with SQLAlchemy ORM - perfect for FastAPI type safety
- Built by same author as FastAPI (Sebastián Ramírez) - guaranteed compatibility
- **asyncpg** is fastest async PostgreSQL driver for Python (3-5x faster than psycopg3)
- Neon Serverless PostgreSQL fully supports asyncpg connection protocol
- Async/await everywhere aligns with FastAPI's async design for maximum concurrency

**Alternatives Considered**:
- **psycopg3 (async)**: Newer but slower than asyncpg; less community adoption
- **Tortoise ORM**: Not mandated by constitution; would violate §3
- **Raw SQL with asyncpg**: Loses type safety and validation benefits of SQLModel

**Implementation Notes**:
- Install: `sqlmodel==0.0.14`, `asyncpg==0.29.0`
- Create async engine: `create_async_engine(DATABASE_URL, echo=False)`
- Use async sessions with context manager pattern
- Define models inheriting from SQLModel with `table=True`
- Use `select()` with `session.exec()` for async queries

**Database Connection String Format**:
```python
# Neon provides standard PostgreSQL connection string
DATABASE_URL = os.getenv("NEON_DATABASE_URL")
# Example: postgresql+asyncpg://user:pass@ep-cool-name.us-east-2.aws.neon.tech/neondb
```

**References**:
- SQLModel docs: https://sqlmodel.tiangolo.com/
- asyncpg performance: https://github.com/MagicStack/asyncpg
- Neon async support: https://neon.tech/docs/guides/python

---

## 3. FastAPI Project Structure

### Decision: Modular router-based architecture with dependency injection

**Rationale**:
- Follows FastAPI best practices for medium-sized applications
- Constitution mandates specific file structure (§8: File Structure assumption in spec.md)
- Separation of concerns: auth, models, database, routes in distinct modules
- Dependency injection for database sessions and auth prevents tight coupling
- Easy to test individual components in isolation

**Project Structure**:
```
backend/
├── main.py              # FastAPI app initialization, CORS, routers
├── db.py                # Async engine, session factory, database utilities
├── models.py            # SQLModel table definitions (User, Task)
├── dependencies.py      # FastAPI dependencies (get_db, get_current_user)
├── auth/
│   └── jwt.py           # JWT decoding, validation, user extraction
├── routes/
│   └── tasks.py         # Task CRUD endpoints (/api/{user_id}/tasks)
├── .env                 # Environment variables (gitignored)
├── requirements.txt     # Python dependencies
└── README.md            # Setup and run instructions
```

**Alternatives Considered**:
- **Flat structure (all in main.py)**: Not scalable; violates constitution mandate
- **Domain-driven directory structure**: Overkill for single-entity CRUD API
- **Blueprint/factory pattern**: Unnecessary abstraction for single FastAPI instance

**Implementation Notes**:
- `main.py` mounts task router with prefix `/api`
- Each route uses `Depends()` for database session and current user
- Auth dependency raises HTTPException(401/403) on validation failures
- Models inherit from SQLModel with Pydantic validation

**References**:
- FastAPI bigger applications: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- Dependency injection: https://fastapi.tiangolo.com/tutorial/dependencies/

---

## 4. Environment Configuration Management

### Decision: python-dotenv with strict validation

**Rationale**:
- python-dotenv is industry standard for loading .env files in Python (30M+ monthly downloads)
- Constitution mandates environment variable configuration (FR-020, SC-010)
- Validation at startup prevents runtime failures from missing/invalid config
- No secrets in code or version control - all via .env (FR-017)

**Required Environment Variables**:
```env
# Required for JWT validation
BETTER_AUTH_SECRET=PU0Tdg9Y0rvcqOFEPtwYhWwDdyPIp20g

# Required for database connection
NEON_DATABASE_URL=postgresql+asyncpg://user:pass@host/db

# Required for CORS configuration
BETTER_AUTH_URL=http://localhost:3000

# Optional: Development mode
DEBUG=false
```

**Alternatives Considered**:
- **Pydantic Settings**: More structured but heavier; overkill for 3 variables
- **dynaconf**: Too enterprise-focused for hackathon scope
- **os.environ direct access**: No validation or type safety

**Implementation Notes**:
- Load with `from dotenv import load_dotenv; load_dotenv()`
- Validate required vars at startup in main.py
- Raise clear error if any required var missing
- Never log or expose secret values (FR-017)

**References**:
- python-dotenv: https://github.com/theskumar/python-dotenv
- 12-Factor App config: https://12factor.net/config

---

## 5. CORS Configuration for Frontend Integration

### Decision: FastAPI CORSMiddleware with single origin allowlist

**Rationale**:
- FR-019 mandates CORS support for frontend at BETTER_AUTH_URL
- Frontend runs on localhost:3000 during development
- Single-origin restriction enhances security (no wildcard)
- FastAPI built-in middleware handles preflight OPTIONS requests correctly

**Configuration**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("BETTER_AUTH_URL")],  # ["http://localhost:3000"]
    allow_credentials=True,  # Required for JWT cookies if used
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Alternatives Considered**:
- **allow_origins=["*"]**: Security violation; allows any origin
- **No CORS middleware**: Would block all frontend requests
- **Manual CORS headers**: Error-prone; middleware is battle-tested

**Implementation Notes**:
- Add middleware before mounting routers
- Include OPTIONS in allowed methods (automatic with middleware)
- Allow Authorization header for Bearer tokens
- Test with actual frontend origin

**References**:
- FastAPI CORS: https://fastapi.tiangolo.com/tutorial/cors/
- MDN CORS guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

## 6. HTTP Status Code Strategy

### Decision: FastAPI HTTPException with RFC-compliant status codes

**Rationale**:
- FR-015 mandates specific status codes for different scenarios
- HTTPException provides clean way to raise errors from any layer
- Consistent error response format: `{"detail": "message"}`
- FastAPI automatically converts HTTPException to proper JSON response

**Status Code Mapping**:
```python
200 OK              # Successful GET, PUT, PATCH
201 Created         # Successful POST
204 No Content      # Successful DELETE
400 Bad Request     # Malformed JSON payload
401 Unauthorized    # Missing/invalid/expired JWT
403 Forbidden       # Valid JWT but accessing different user's resource
404 Not Found       # Resource doesn't exist
422 Unprocessable   # Validation error (Pydantic auto-generates)
503 Service Unavail # Database connection failure
```

**Alternatives Considered**:
- **Custom exception classes**: Adds complexity without benefit
- **Plain dict responses**: Loses FastAPI exception handling benefits
- **Different error format**: Violates user's core decision for standard FastAPI responses

**Implementation Notes**:
```python
from fastapi import HTTPException

# Example usage
if not token:
    raise HTTPException(status_code=401, detail="Missing authorization token")

if jwt_user_id != path_user_id:
    raise HTTPException(status_code=403, detail="Access forbidden")

if not task:
    raise HTTPException(status_code=404, detail="Task not found")
```

**Error Response Format** (automatic):
```json
{
  "detail": "Human-readable error message"
}
```

**References**:
- HTTPException docs: https://fastapi.tiangolo.com/tutorial/handling-errors/
- HTTP status codes: https://httpstatuses.com/

---

## 7. Database Session Management Pattern

### Decision: Async session per request via dependency injection

**Rationale**:
- Follows FastAPI dependency pattern - clean and testable
- Async context manager ensures proper session cleanup
- No session leaks or connection pool exhaustion
- Easy to mock session in tests

**Implementation Pattern**:
```python
# In db.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_session():
    async with async_session() as session:
        yield session

# In routes/tasks.py
@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    # Use session here
```

**Alternatives Considered**:
- **Global session**: Not thread-safe in async context
- **Session per module**: Harder to test and manage lifecycle
- **Manual session creation**: Verbose and error-prone

**References**:
- SQLAlchemy async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- FastAPI dependencies: https://fastapi.tiangolo.com/tutorial/dependencies/

---

## 8. Request Validation Strategy

### Decision: Pydantic models with SQLModel integration

**Rationale**:
- SQLModel inherits from Pydantic BaseModel - automatic validation
- FastAPI auto-generates 422 responses with validation details (FR-015)
- Type hints provide IDE autocomplete and static analysis
- Constitution emphasizes type-hinted code (§9: Quality)

**Validation Models**:
```python
# In models.py
from sqlmodel import SQLModel, Field
from datetime import datetime

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)  # FR-007
    description: str | None = Field(default=None, max_length=1000)  # FR-008
    completed: bool = False  # FR-012

class TaskCreate(TaskBase):
    pass  # Only title, description, completed from user

class Task(TaskBase, table=True):
    id: int | None = Field(default=None, primary_key=True)  # FR-009
    user_id: str = Field(index=True)  # FR-018
    created_at: datetime = Field(default_factory=datetime.utcnow)  # FR-010
    updated_at: datetime = Field(default_factory=datetime.utcnow)  # FR-011

class TaskUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
```

**Alternatives Considered**:
- **Manual validation**: Error-prone and verbose
- **Separate Pydantic and SQLAlchemy models**: Code duplication
- **No validation**: Violates FR-007, FR-008

**References**:
- SQLModel validation: https://sqlmodel.tiangolo.com/tutorial/fastapi/simple-hero-api/
- Pydantic field validation: https://docs.pydantic.dev/latest/api/fields/

---

## 9. Security Best Practices

### Decision: Defense-in-depth with multiple validation layers

**Security Layers**:

1. **JWT Validation (FR-001 to FR-005)**:
   - Signature verification with BETTER_AUTH_SECRET
   - Expiration checking (automatic in PyJWT)
   - User ID extraction from claims
   - 401 on any JWT failure

2. **Authorization Enforcement (FR-003, FR-005)**:
   - Extract user_id from validated JWT
   - Compare with user_id in URL path
   - Raise 403 if mismatch (before DB query)

3. **Query Scoping (FR-013)**:
   - All queries filtered by authenticated user_id
   - Double-check: even if authorization passes, DB query includes user_id filter
   - Prevents accidental cross-user data leaks

4. **Error Message Sanitization (FR-016, FR-017)**:
   - Never expose stack traces to API clients
   - Generic messages for internal errors ("Service unavailable")
   - No database schema details in error responses
   - Log detailed errors server-side only

5. **Input Validation**:
   - Pydantic validates all request bodies
   - SQLModel constraints prevent invalid data persistence
   - 422 responses include field-specific errors (safe to expose)

**Implementation Checklist**:
- [ ] JWT dependency validates and extracts user before route handler
- [ ] Authorization dependency compares JWT user with path user
- [ ] All DB queries include `.where(Task.user_id == current_user)`
- [ ] HTTPException messages are user-safe (no internal details)
- [ ] Logging captures auth failures without exposing secrets

**References**:
- OWASP API Security: https://owasp.org/www-project-api-security/
- FastAPI security: https://fastapi.tiangolo.com/tutorial/security/

---

## 10. Testing Strategy

### Decision: Pytest with httpx async client

**Rationale**:
- pytest is Python standard for testing (mandated by Technical Context)
- httpx AsyncClient allows testing async FastAPI endpoints
- TestClient from fastapi.testclient works but doesn't support true async
- Constitution emphasizes quality (§9) - comprehensive tests required

**Test Structure**:
```
backend/tests/
├── conftest.py          # Fixtures: test DB, test client, auth tokens
├── test_auth.py         # JWT validation, 401/403 scenarios
├── test_tasks_crud.py   # Happy path CRUD operations
├── test_isolation.py    # Cross-user access prevention
├── test_validation.py   # Input validation, 422 errors
└── test_edge_cases.py   # Database failures, concurrent updates
```

**Key Test Scenarios** (from spec edge cases):
- Missing/invalid/expired JWT → 401
- Cross-user access attempts → 403
- Missing required fields → 422
- Oversized input → 422
- Task persistence across "restarts" (session isolation)
- Concurrent update handling

**Alternatives Considered**:
- **unittest**: More verbose than pytest
- **Manual curl testing**: Not automated or repeatable
- **Postman collections**: Not version-controlled or CI-friendly

**References**:
- pytest-asyncio: https://pytest-asyncio.readthedocs.io/
- FastAPI testing: https://fastapi.tiangolo.com/tutorial/testing/

---

## 11. Database Schema Design

### Decision: Single tasks table with user_id index

**Rationale**:
- Simple schema aligns with application scope (no complex relationships)
- user_id index ensures fast query performance (FR-018)
- Auto-incrementing integer ID for tasks (FR-009)
- Timestamps managed by SQLModel defaults (FR-010, FR-011)

**Schema**:
```sql
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_task_user_id ON task(user_id);
```

**Design Notes**:
- No foreign key to users table (user management in frontend via Better Auth)
- user_id stored as string (JWT claim format unknown - assumption documented)
- Timestamps in UTC (assumption: frontend handles display timezone)
- No soft deletes (DELETE removes records permanently)

**Alternatives Considered**:
- **UUID for task ID**: More complex; integer sufficient for scope
- **Composite primary key (user_id, id)**: Unnecessary complexity
- **Separate users table**: User management handled by Better Auth (outside scope)

**Migration Strategy**:
- SQLModel `SQLModel.metadata.create_all(engine)` on startup
- Creates tables if not exist
- Idempotent for development/production

**References**:
- PostgreSQL indexes: https://www.postgresql.org/docs/current/indexes.html
- SQLModel table creation: https://sqlmodel.tiangolo.com/tutorial/create-db-and-table/

---

## 12. Logging and Observability

### Decision: Python logging with structured JSON format

**Rationale**:
- FR-009 mandates logging authentication failures
- Structured logs easier to parse and search in production
- Python logging module is standard library - no extra dependencies
- JSON format enables log aggregation tools (ELK, CloudWatch, etc.)

**Logging Configuration**:
```python
import logging
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # Console for development
        # logging.FileHandler('app.log')  # File for production
    ]
)

logger = logging.getLogger("fastapi-backend")
```

**What to Log**:
- ✅ Authentication failures (401) with reason (expired, invalid, missing)
- ✅ Authorization failures (403) with attempted user_id
- ✅ Database connection errors (503)
- ✅ Application startup/shutdown events
- ❌ Successful operations (too verbose for INFO level)
- ❌ JWT tokens or secrets (FR-017 violation)
- ❌ User passwords or sensitive data

**Log Security**:
- Sanitize user input before logging (prevent log injection)
- Never log BETTER_AUTH_SECRET or NEON_DATABASE_URL
- Redact JWT tokens (log only "Bearer [REDACTED]")

**References**:
- Python logging: https://docs.python.org/3/library/logging.html
- Logging best practices: https://www.loggly.com/ultimate-guide/python-logging-basics/

---

## 13. Deployment Considerations

### Decision: Uvicorn with production settings

**Rationale**:
- Uvicorn is recommended ASGI server for FastAPI
- Supports async workers for concurrency
- Constitution mandates deployment via environment variables (SC-010)

**Production Run Command**:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Environment-Specific Settings**:
```python
# main.py
import os

DEBUG = os.getenv("DEBUG", "false").lower() == "true"

app = FastAPI(
    title="Todo Backend API",
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,  # Disable Swagger in production
    redoc_url="/redoc" if DEBUG else None,
)
```

**Docker Considerations** (if using docker-compose.yml):
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**References**:
- Uvicorn deployment: https://www.uvicorn.org/deployment/
- FastAPI in containers: https://fastapi.tiangolo.com/deployment/docker/

---

## Summary of Technical Stack

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Framework** | FastAPI | 0.109+ | Mandated by constitution; async support; auto docs |
| **ORM** | SQLModel | 0.0.14 | Mandated by constitution; Pydantic integration |
| **Database** | Neon PostgreSQL | Serverless | Mandated by constitution; async support |
| **DB Driver** | asyncpg | 0.29.0 | Fastest async PostgreSQL driver |
| **JWT Library** | PyJWT | 2.8.0 | Standard Python JWT; HS256 support |
| **ASGI Server** | Uvicorn | 0.27+ | FastAPI recommended server |
| **Config** | python-dotenv | 1.0+ | Standard .env file loading |
| **Testing** | pytest + httpx | Latest | Async test support |
| **Python** | 3.11+ | Latest stable | Async syntax; type hints |

**All technical decisions documented. Ready for Phase 1: Data Model & Contracts.**
