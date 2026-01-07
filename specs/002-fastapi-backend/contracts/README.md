# API Contracts

**Feature**: 002-fastapi-backend
**Date**: 2026-01-06
**Purpose**: Define and document REST API contracts for FastAPI backend

---

## Overview

This directory contains the formal API contracts that define the interface between the Next.js frontend and FastAPI backend. All contracts are derived from functional requirements in `spec.md` and data models in `data-model.md`.

---

## Files

### openapi.yaml
**OpenAPI 3.1.0 specification** defining all REST endpoints, request/response schemas, error codes, and authentication requirements.

**Usage**:
- Import into Postman/Insomnia for testing
- Generate API documentation with Swagger UI (FastAPI automatic)
- Use as contract for frontend TypeScript client generation
- Reference during implementation for exact field names and types

**Key Sections**:
- **Paths**: All 6 task endpoints + health check
- **Schemas**: Task, TaskCreate, TaskUpdate, error responses
- **Security**: Bearer JWT authentication definition
- **Examples**: Real request/response samples for each endpoint

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth | Success | Errors |
|--------|----------|---------|------|---------|--------|
| GET | `/api/{user_id}/tasks` | List all user tasks | Required | 200 | 401, 403 |
| POST | `/api/{user_id}/tasks` | Create new task | Required | 201 | 401, 403, 422 |
| GET | `/api/{user_id}/tasks/{id}` | Get single task | Required | 200 | 401, 403, 404 |
| PUT | `/api/{user_id}/tasks/{id}` | Update task | Required | 200 | 401, 403, 404, 422 |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task | Required | 204 | 401, 403, 404 |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion | Required | 200 | 401, 403, 404 |
| GET | `/health` | Health check | None | 200 | - |

---

## Authentication Flow

```
Frontend                    Backend
   │                          │
   │  1. User logs in         │
   │     (Better Auth)        │
   │                          │
   │  2. GET /api/user123/tasks
   │     Authorization:       │
   │     Bearer <JWT>    ───>  │
   │                          │
   │                        3. Validate JWT
   │                           - Verify signature
   │                           - Check expiration
   │                           - Extract user_id
   │                          │
   │                        4. Compare user_ids
   │                           - JWT: "user123"
   │                           - URL: "user123"
   │                           - Match ✓
   │                          │
   │                        5. Query database
   │                           WHERE user_id='user123'
   │                          │
   │  6. 200 OK with tasks <── │
   │     [task1, task2, ...]   │
```

---

## Request/Response Examples

### Create Task (POST /api/{user_id}/tasks)

**Request**:
```http
POST /api/user123/tasks HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false
}
```

**Success Response (201)**:
```json
{
  "id": 42,
  "user_id": "user123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-06T15:30:00Z",
  "updated_at": "2026-01-06T15:30:00Z"
}
```

**Validation Error (422)**:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at most 200 characters",
      "type": "value_error.any_str.max_length"
    }
  ]
}
```

---

### List Tasks (GET /api/{user_id}/tasks)

**Request**:
```http
GET /api/user123/tasks HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGc...
```

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "user_id": "user123",
    "title": "Buy groceries",
    "description": null,
    "completed": false,
    "created_at": "2026-01-06T10:00:00Z",
    "updated_at": "2026-01-06T10:00:00Z"
  },
  {
    "id": 2,
    "user_id": "user123",
    "title": "Finish project",
    "description": "Complete by Friday",
    "completed": true,
    "created_at": "2026-01-05T14:30:00Z",
    "updated_at": "2026-01-06T09:15:00Z"
  }
]
```

**Empty List (200)**:
```json
[]
```

---

### Toggle Completion (PATCH /api/{user_id}/tasks/{id}/complete)

**Request**:
```http
PATCH /api/user123/tasks/42/complete HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGc...
```

**Success Response (200)**:
```json
{
  "id": 42,
  "user_id": "user123",
  "title": "Buy groceries",
  "description": null,
  "completed": true,  ← Toggled from false
  "created_at": "2026-01-06T10:00:00Z",
  "updated_at": "2026-01-06T15:45:00Z"  ← Updated
}
```

---

## Error Response Standards

All errors follow FastAPI standard format:

### Single Error
```json
{
  "detail": "Human-readable error message"
}
```

### Validation Errors (422)
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Validation error message",
      "type": "error_type"
    }
  ]
}
```

### Error Code Mapping

| Status | Meaning | When Used |
|--------|---------|-----------|
| 400 | Bad Request | Malformed JSON in request body |
| 401 | Unauthorized | Missing, invalid, or expired JWT |
| 403 | Forbidden | JWT valid but user_id mismatch |
| 404 | Not Found | Task doesn't exist or not owned by user |
| 422 | Unprocessable Entity | Validation failed (length, required fields) |
| 503 | Service Unavailable | Database connection failure |

---

## Field Validation Rules

### Task Title (required)
- ✅ Minimum: 1 character
- ✅ Maximum: 200 characters
- ❌ Cannot be null or empty string
- ❌ Whitespace-only rejected

### Task Description (optional)
- ✅ Can be null or omitted
- ✅ Maximum: 1000 characters when provided
- ✅ Empty string allowed

### Task Completed
- ✅ Boolean type only (`true` or `false`)
- ✅ Defaults to `false` on creation
- ❌ Strings like "true" rejected

---

## CORS Configuration

Frontend origin must be allowlisted:

```python
# Backend CORS configuration
allow_origins = [os.getenv("BETTER_AUTH_URL")]  # http://localhost:3000
allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]
allow_headers = ["Authorization", "Content-Type"]
allow_credentials = True
```

**Preflight Requests**:
- Frontend automatically sends OPTIONS request before POST/PUT/PATCH/DELETE
- Backend responds with CORS headers
- Actual request proceeds if allowed

---

## Frontend Integration Checklist

- [ ] Set `Authorization: Bearer {token}` header on every request
- [ ] Handle 401 by redirecting to login (token expired/invalid)
- [ ] Handle 403 by showing "Access denied" message
- [ ] Handle 404 by removing task from UI state
- [ ] Handle 422 by displaying field-specific validation errors
- [ ] Parse ISO 8601 timestamps for display in user's timezone
- [ ] Match exact field names from schemas (case-sensitive)
- [ ] Test with actual JWT tokens from Better Auth

---

## Testing with Swagger UI

FastAPI automatically generates interactive API documentation:

1. Start backend: `uvicorn main:app --reload`
2. Open browser: `http://localhost:8000/docs`
3. Click "Authorize" button
4. Enter JWT token: `Bearer <token>`
5. Try endpoints with example data
6. View response schemas and status codes

---

## Contract Validation

**Specification Requirements Met**:
- ✅ FR-014: REST API at /api/{user_id}/tasks
- ✅ FR-015: Proper HTTP status codes
- ✅ FR-007, FR-008: Field length validation
- ✅ FR-001-FR-005: JWT authentication enforced
- ✅ SC-005: Zero frontend code changes (contracts match existing frontend)

**Ready for Implementation**: All endpoints, schemas, and error handling defined.
