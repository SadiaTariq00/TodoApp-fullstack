# Data Model: FastAPI Backend

**Feature**: 002-fastapi-backend
**Date**: 2026-01-06
**Purpose**: Define entities, relationships, validation rules, and state transitions for the Todo backend

---

## Overview

The FastAPI backend manages a single primary entity (**Task**) with an implicit reference to **User Identity** managed by Better Auth on the frontend. The data model is intentionally minimal to align with the hackathon scope while ensuring complete data isolation between users.

---

## Entity: Task

### Description
Represents a single todo item belonging to a specific user. Tasks are scoped exclusively to their owner and cannot be shared or transferred between users.

### SQLModel Definition

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    """
    Database table for user tasks.

    Enforces:
    - FR-007: Title length constraint (1-200 chars)
    - FR-008: Description length constraint (0-1000 chars)
    - FR-009: Auto-incrementing integer ID
    - FR-010: Auto-populated created_at timestamp
    - FR-011: Auto-updated updated_at timestamp
    - FR-012: Default completed=False
    - FR-018: Indexed user_id for query performance
    """

    # Primary key - auto-incrementing integer
    id: Optional[int] = Field(default=None, primary_key=True)

    # Owner identifier - extracted from JWT token
    user_id: str = Field(index=True, nullable=False)

    # Task content - validated constraints
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)

    # Completion status - defaults to incomplete
    completed: bool = Field(default=False, nullable=False)

    # Timestamps - auto-managed
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

### Database Schema (Generated SQL)

```sql
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title VARCHAR(200) NOT NULL CHECK (char_length(title) >= 1),
    description VARCHAR(1000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX ix_task_user_id ON task(user_id);
```

### Field Specifications

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | Integer | Primary key, auto-increment | NULL (DB-generated) | Unique task identifier (FR-009) |
| `user_id` | String | NOT NULL, Indexed | Required | Owner's identity from JWT claim (FR-013, FR-018) |
| `title` | String | 1-200 chars, NOT NULL | Required | Task title (FR-007) |
| `description` | String | 0-1000 chars, Nullable | NULL | Optional task details (FR-008) |
| `completed` | Boolean | NOT NULL | FALSE | Task completion status (FR-012) |
| `created_at` | Timestamp | NOT NULL, UTC | Current UTC time | Task creation timestamp (FR-010) |
| `updated_at` | Timestamp | NOT NULL, UTC | Current UTC time | Last modification timestamp (FR-011) |

### Validation Rules

**Title Validation** (FR-007):
- ✅ Minimum length: 1 character
- ✅ Maximum length: 200 characters
- ✅ Required (cannot be null or empty string)
- ❌ Whitespace-only strings rejected by Pydantic `min_length=1`

**Description Validation** (FR-008):
- ✅ Optional (can be null or omitted)
- ✅ Maximum length: 1000 characters when provided
- ✅ Empty string allowed (different from null)

**Completed Validation** (FR-012):
- ✅ Boolean type enforced
- ✅ Defaults to False if not provided
- ✅ Only accepts `true` or `false` (no truthy values)

**User ID Validation** (FR-013):
- ✅ Always set from authenticated JWT user
- ✅ Never accepted from client request body
- ✅ Validated to match JWT claim before any operation

**Timestamp Validation** (FR-010, FR-011):
- ✅ Always stored in UTC timezone
- ✅ `created_at` set once on creation, never modified
- ✅ `updated_at` refreshed on every PUT/PATCH operation
- ✅ Returned in ISO 8601 format: `2026-01-06T17:30:00.000Z`

---

## Request/Response Models

### TaskCreate (POST /api/{user_id}/tasks)

```python
class TaskCreate(SQLModel):
    """Client request body for creating new task."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = False
```

**Validation**:
- Title required and within length limits
- Description optional and within length limits
- Completed defaults to False (user can override on creation)
- ❌ `user_id` not accepted (injected from JWT)
- ❌ `id`, `created_at`, `updated_at` not accepted (server-managed)

### TaskUpdate (PUT /api/{user_id}/tasks/{id})

```python
class TaskUpdate(SQLModel):
    """Client request body for updating existing task."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None
```

**Validation**:
- All fields optional (partial updates allowed)
- Only provided fields are updated
- `updated_at` automatically refreshed on any change
- ❌ Cannot change `user_id`, `id`, or `created_at`

### TaskResponse (All GET endpoints)

```python
class TaskResponse(SQLModel):
    """Server response for task data (matches DB model)."""
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime
```

**Serialization**:
- Datetimes serialized to ISO 8601 format
- All fields included (no field hiding)
- Direct mapping from database model

---

## Entity: User Identity (Implicit)

### Description
Users are **not** stored in the backend database. User management (registration, authentication, profile) is handled entirely by Better Auth on the frontend. The backend only references user identity via `user_id` extracted from validated JWT tokens.

### Representation

```python
# User is NOT a database model - only a type hint
UserID = str  # e.g., "user123" or UUID string from Better Auth
```

### Integration Points

**JWT Claim Format** (Assumption from research.md):
```json
{
  "sub": "user123",          // User identifier (standard JWT claim)
  "iat": 1704582000,          // Issued at timestamp
  "exp": 1704585600,          // Expiration timestamp
  "email": "user@example.com" // Optional: user email
}
```

**Backend Usage**:
- Extract `user_id` from JWT `sub` claim
- Use as foreign key in `Task.user_id` field
- Never store user profile data in backend
- Never validate user existence (trust JWT issuer)

---

## Relationships

### Task → User Identity (One-to-Many)

**Nature**: Each task belongs to exactly one user (identified by `user_id` string)

**Cardinality**:
- One user can have zero or many tasks
- One task belongs to exactly one user

**Implementation**:
- No foreign key constraint (user not in database)
- `user_id` stored as indexed string column
- Queries always filter by `user_id` (FR-013)

**Example Query**:
```python
# Get all tasks for authenticated user
statement = select(Task).where(Task.user_id == current_user_id)
tasks = await session.exec(statement)
```

**Integrity**:
- Orphaned tasks possible if user deleted from Better Auth (acceptable trade-off)
- Future: Could implement cleanup job if user deletion events exposed
- No cascading deletes (user deletion outside backend scope)

---

## State Transitions

### Task Lifecycle

```
┌─────────────┐
│   Created   │ (POST /api/{user_id}/tasks)
│ completed=  │
│   false     │
└──────┬──────┘
       │
       ├──────> (PATCH /complete) ──────> ┌──────────────┐
       │                                   │  Completed   │
       │                                   │ completed=   │
       │                                   │    true      │
       │                                   └──────┬───────┘
       │                                          │
       │                                          │
       │<─────────── (PATCH /complete) <─────────┤
       │
       ├──────> (PUT /{id}) ────────────> ┌──────────────┐
       │                                   │   Modified   │
       │                                   │  (title/desc │
       │                                   │   updated)   │
       │                                   └──────┬───────┘
       │                                          │
       │<─────────────────────────────────────────┤
       │
       └──────> (DELETE /{id}) ──────────> [DELETED]
```

### State Transition Rules

**Creation → Incomplete** (Initial State):
- Triggered by: `POST /api/{user_id}/tasks`
- Default: `completed = false`
- Optional: Client can set `completed = true` on creation

**Incomplete ↔ Complete** (Toggle):
- Triggered by: `PATCH /api/{user_id}/tasks/{id}/complete`
- Action: Flip boolean value: `completed = !completed`
- Side effect: `updated_at` timestamp refreshed

**Any State → Modified** (Content Update):
- Triggered by: `PUT /api/{user_id}/tasks/{id}`
- Allowed fields: `title`, `description`, `completed`
- Side effect: `updated_at` timestamp refreshed
- Immutable fields: `id`, `user_id`, `created_at`

**Any State → Deleted** (Permanent Removal):
- Triggered by: `DELETE /api/{user_id}/tasks/{id}`
- Action: Hard delete from database (no soft delete)
- Result: Task no longer exists (404 on subsequent requests)
- Irreversible: No undo/restore functionality

### Concurrent Update Handling

**Scenario**: Two requests attempt to update the same task simultaneously

**Strategy**: Last-write-wins (Optimistic Concurrency)
- No row-level locking implemented initially
- Database ACID properties ensure data consistency
- Later request overwrites earlier request's changes
- Future enhancement: Add `version` field for optimistic locking

**Example Race Condition**:
```
Time | Request A               | Request B
-----|-------------------------|------------------------
T1   | PUT /tasks/42 (title)  |
T2   |                         | PUT /tasks/42 (description)
T3   | Commits: title changed  |
T4   |                         | Commits: description changed
T5   | Result: Only B's change persists (last-write-wins)
```

**Mitigation** (if needed in future):
- Add `version` integer field to Task model
- Increment version on every update
- Reject update if client's version doesn't match current version (409 Conflict)

---

## Indexes and Performance

### Primary Index
- **Column**: `id`
- **Type**: B-tree (default for primary key)
- **Purpose**: Fast lookups by task ID (single-task operations)

### User ID Index (FR-018)
- **Column**: `user_id`
- **Type**: B-tree
- **Purpose**: Fast filtering for user-scoped queries (list operations)
- **Query**: `SELECT * FROM task WHERE user_id = 'user123'`
- **Expected**: O(log N) lookup instead of O(N) table scan

### No Additional Indexes
- **Rationale**:
  - Only two query patterns: by ID or by user_id
  - Small dataset expected (< 10k tasks per user)
  - Additional indexes add write overhead
  - Can add later if profiling shows bottlenecks

### Performance Characteristics
- **Task creation**: O(1) insert
- **Task lookup by ID**: O(log N) with primary key
- **Task list by user**: O(log N + M) where M = user's task count
- **Task update**: O(log N) lookup + O(1) update
- **Task deletion**: O(log N) lookup + O(1) delete

---

## Data Constraints Summary

| Constraint Type | Implementation | Enforcement Layer |
|----------------|----------------|-------------------|
| **Required fields** | `nullable=False` in SQLModel | Pydantic + Database |
| **Field lengths** | `min_length`, `max_length` in Field | Pydantic (422 before DB) |
| **Default values** | `default=` or `default_factory=` | SQLModel ORM |
| **Data types** | Python type hints | Pydantic validation |
| **Unique IDs** | `SERIAL PRIMARY KEY` | PostgreSQL constraint |
| **User isolation** | `WHERE user_id = ?` in queries | Application logic |
| **Timestamp immutability** | `created_at` never updated | Application logic |

---

## Migration and Schema Evolution

### Initial Schema Creation
```python
# In db.py or main.py startup
from sqlmodel import SQLModel, create_engine

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
```

### Future Schema Changes
- Use Alembic for migrations (not in initial scope)
- Current approach: `create_all()` is idempotent (won't recreate existing tables)
- Schema changes require manual ALTER TABLE or recreation

### Data Retention
- Tasks persist indefinitely (no expiration)
- No automated cleanup or archival
- Users must manually delete unwanted tasks
- Future: Could add `deleted_at` column for soft deletes

---

## Security Considerations

### Data Isolation (FR-013)
- **Every query** MUST include `WHERE user_id = {authenticated_user_id}`
- Never trust `user_id` from request body or URL alone
- Always compare URL `user_id` with JWT claim `user_id`

### Sensitive Data
- ❌ No passwords stored (handled by Better Auth)
- ❌ No payment information
- ❌ No personal identifiable information beyond user_id
- ✅ Task content potentially sensitive (user's private todos)

### Data Protection
- Database connection uses TLS (Neon default)
- Environment variables never logged (FR-017)
- No SQL injection risk (parameterized queries via SQLModel)
- No NoSQL injection risk (not using NoSQL)

---

## Testing Checklist

**Data Model Tests**:
- [ ] Task creation with valid data succeeds
- [ ] Task creation with oversized title rejected (422)
- [ ] Task creation with empty title rejected (422)
- [ ] Task creation without title rejected (422)
- [ ] Description can be null or omitted
- [ ] Timestamps auto-populate on creation
- [ ] `user_id` index improves query performance
- [ ] Concurrent updates don't corrupt data
- [ ] Task deletion is permanent (404 after delete)

---

## Summary

**Entities**: 1 database table (Task) + 1 implicit reference (User Identity)

**Key Design Principles**:
1. **Simplicity**: Minimal schema for hackathon scope
2. **Security**: User isolation enforced at application layer
3. **Performance**: Strategic indexing for common queries
4. **Validation**: Pydantic catches errors before database
5. **Auditability**: Timestamps track creation and modifications

**Ready for Phase 1B: API Contract Generation**
