# Feature Specification: FastAPI Backend with JWT Auth and Neon PostgreSQL

**Feature Branch**: `002-fastapi-backend`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "Project: Hackathon II – Todo Full-Stack Web Application, Phase: Phase II (Backend Only), Scope: FastAPI Backend + Neon DB + JWT Auth Integration - Build a secure, production-grade FastAPI backend that integrates seamlessly with the completed Next.js frontend, using JWT authentication from Better Auth and persistent storage via Neon PostgreSQL"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated Task Creation (Priority: P1)

An authenticated user needs to create a new task in their personal todo list. The backend must verify the user's identity through JWT token validation, ensure they can only create tasks under their own account, and persist the task data to the database.

**Why this priority**: This is the core value proposition - enabling users to create and store their tasks. Without this, the entire application is non-functional. This represents the minimum viable backend feature.

**Independent Test**: Can be fully tested by sending an authenticated POST request to the task creation endpoint with valid JWT token and task data. Success delivers a persisted task visible in subsequent GET requests.

**Acceptance Scenarios**:

1. **Given** a valid JWT token for user "user123", **When** the user submits a POST request to create a task with title "Buy groceries", **Then** the system creates the task, assigns it to user123, returns HTTP 201 with task details including auto-generated ID and timestamps
2. **Given** a valid JWT token for user "user123", **When** the user attempts to create a task under a different user_id in the URL path, **Then** the system rejects the request with HTTP 403 Forbidden
3. **Given** no JWT token in the Authorization header, **When** attempting to create a task, **Then** the system rejects the request with HTTP 401 Unauthorized
4. **Given** an expired or invalid JWT token, **When** attempting to create a task, **Then** the system rejects the request with HTTP 401 Unauthorized

---

### User Story 2 - Retrieve Personal Task List (Priority: P1)

An authenticated user wants to view all their existing tasks. The backend must verify the user's identity and return only tasks belonging to that specific user, ensuring complete data isolation between users.

**Why this priority**: Viewing existing tasks is equally critical as creating them - users need to see what they've created. This completes the minimum read-write cycle for an MVP.

**Independent Test**: Can be fully tested by sending an authenticated GET request to the task list endpoint. Success delivers a filtered list containing only the authenticated user's tasks.

**Acceptance Scenarios**:

1. **Given** a valid JWT token for user "user123" who has 3 tasks, **When** the user requests GET /api/user123/tasks, **Then** the system returns HTTP 200 with an array of 3 tasks, all belonging to user123
2. **Given** a valid JWT token for user "user123", **When** the user attempts to request GET /api/user456/tasks, **Then** the system rejects the request with HTTP 403 Forbidden
3. **Given** a valid JWT token for a user with no tasks, **When** requesting their task list, **Then** the system returns HTTP 200 with an empty array
4. **Given** no JWT token, **When** requesting a task list, **Then** the system rejects the request with HTTP 401 Unauthorized

---

### User Story 3 - Update Task Details (Priority: P2)

An authenticated user needs to modify an existing task's title or description. The backend must verify ownership of the specific task and apply the updates atomically.

**Why this priority**: While not critical for MVP, updating task content is a standard expectation for task management. Users frequently need to correct or refine task details.

**Independent Test**: Can be fully tested by sending an authenticated PUT request to update a specific task. Success delivers updated task data with modified fields and updated timestamp.

**Acceptance Scenarios**:

1. **Given** a valid JWT token for user "user123" who owns task ID 42, **When** the user sends PUT /api/user123/tasks/42 with updated title "Buy organic groceries", **Then** the system updates the task, increments updated_at timestamp, and returns HTTP 200 with updated task details
2. **Given** a valid JWT token for user "user123", **When** attempting to update a task owned by user456, **Then** the system rejects the request with HTTP 403 Forbidden or HTTP 404 Not Found
3. **Given** a valid JWT token, **When** attempting to update a non-existent task ID, **Then** the system returns HTTP 404 Not Found

---

### User Story 4 - Mark Task Complete/Incomplete (Priority: P2)

An authenticated user wants to toggle the completion status of a task without modifying other fields. This specialized update operation provides a quick way to track task progress.

**Why this priority**: Task completion is a core interaction pattern in todo applications. Separating this from general updates provides better UX and simpler API semantics.

**Independent Test**: Can be fully tested by sending an authenticated PATCH request to the completion toggle endpoint. Success delivers updated task with toggled completed status.

**Acceptance Scenarios**:

1. **Given** a valid JWT token for user "user123" who owns incomplete task ID 42, **When** the user sends PATCH /api/user123/tasks/42/complete, **Then** the system sets completed=true, updates updated_at timestamp, and returns HTTP 200
2. **Given** a valid JWT token for user "user123" who owns completed task ID 42, **When** the user sends PATCH /api/user123/tasks/42/complete, **Then** the system sets completed=false, updates updated_at timestamp, and returns HTTP 200
3. **Given** a valid JWT token, **When** attempting to toggle completion for a task owned by another user, **Then** the system rejects the request with HTTP 403 Forbidden or HTTP 404 Not Found

---

### User Story 5 - Delete Task (Priority: P3)

An authenticated user needs to permanently remove a task from their list. The backend must verify ownership before allowing deletion.

**Why this priority**: Task deletion is expected functionality but less critical than CRUD operations. Users can work around missing deletion by ignoring unwanted tasks.

**Independent Test**: Can be fully tested by sending an authenticated DELETE request. Success results in task removal from database and subsequent GET requests no longer returning the deleted task.

**Acceptance Scenarios**:

1. **Given** a valid JWT token for user "user123" who owns task ID 42, **When** the user sends DELETE /api/user123/tasks/42, **Then** the system removes the task from the database and returns HTTP 204 No Content
2. **Given** a valid JWT token, **When** attempting to delete a task owned by another user, **Then** the system rejects the request with HTTP 403 Forbidden or HTTP 404 Not Found
3. **Given** a valid JWT token, **When** attempting to delete a non-existent task ID, **Then** the system returns HTTP 404 Not Found

---

### User Story 6 - Retrieve Single Task Details (Priority: P3)

An authenticated user wants to view detailed information about a specific task. While less common than listing all tasks, this supports frontend scenarios where individual task data needs refreshing.

**Why this priority**: Lower priority because the list endpoint provides all task data. This is primarily a convenience endpoint for optimized frontend operations.

**Independent Test**: Can be fully tested by sending an authenticated GET request for a specific task ID. Success delivers complete task details.

**Acceptance Scenarios**:

1. **Given** a valid JWT token for user "user123" who owns task ID 42, **When** the user sends GET /api/user123/tasks/42, **Then** the system returns HTTP 200 with complete task details
2. **Given** a valid JWT token, **When** attempting to retrieve a task owned by another user, **Then** the system rejects the request with HTTP 403 Forbidden or HTTP 404 Not Found
3. **Given** a valid JWT token, **When** requesting a non-existent task ID, **Then** the system returns HTTP 404 Not Found

---

### Edge Cases

- **Token expiration during request**: What happens when JWT expires between frontend obtaining token and backend receiving request? System must reject with HTTP 401 and clear error message indicating token expiration.
- **Missing required fields**: What happens when POST/PUT request omits mandatory title field? System must return HTTP 422 Unprocessable Entity with validation error details.
- **Oversized input**: How does system handle title exceeding 200 characters or description exceeding 1000 characters? System must return HTTP 422 with field-specific length validation errors.
- **Database connection failure**: What happens when Neon database is unreachable? System must return HTTP 503 Service Unavailable with generic error message (no internal details exposed).
- **Malformed JWT**: How does system handle corrupted or tampered JWT tokens? System must reject with HTTP 401 and log security event without exposing validation details to client.
- **Concurrent updates**: What happens when two requests attempt to update the same task simultaneously? System must handle with database-level locking or last-write-wins semantics, ensuring data consistency.
- **URL user_id mismatch with JWT subject**: What happens when URL contains /api/user123/tasks but JWT claims user456? System must reject with HTTP 403 Forbidden before processing request.
- **Empty task list pagination**: How does system handle requests for tasks when user has hundreds or thousands of tasks? Assumed pagination will be handled in future iteration; initial implementation returns all tasks (document this assumption).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST validate JWT token signature using BETTER_AUTH_SECRET environment variable on every incoming request
- **FR-002**: System MUST extract user identity (user_id) from verified JWT token claims
- **FR-003**: System MUST enforce that URL path user_id matches JWT token user_id on all endpoints
- **FR-004**: System MUST return HTTP 401 Unauthorized when JWT token is missing, expired, invalid, or malformed
- **FR-005**: System MUST return HTTP 403 Forbidden when authenticated user attempts to access resources belonging to different user
- **FR-006**: System MUST persist all task data to Neon PostgreSQL database using connection string from NEON_DATABASE_URL environment variable
- **FR-007**: System MUST validate task title is non-empty and does not exceed 200 characters
- **FR-008**: System MUST validate task description does not exceed 1000 characters when provided
- **FR-009**: System MUST auto-generate unique integer ID for each new task
- **FR-010**: System MUST auto-populate created_at timestamp when creating new task
- **FR-011**: System MUST auto-update updated_at timestamp when modifying existing task
- **FR-012**: System MUST set completed field to false by default when creating new task
- **FR-013**: System MUST scope all database queries by authenticated user_id to ensure complete data isolation
- **FR-014**: System MUST expose REST API endpoints at base path /api/{user_id}/tasks following the specified contract
- **FR-015**: System MUST return appropriate HTTP status codes: 200 OK for successful reads/updates, 201 Created for successful creates, 204 No Content for successful deletes, 400 Bad Request for malformed requests, 401 Unauthorized for auth failures, 403 Forbidden for authorization failures, 404 Not Found for missing resources, 422 Unprocessable Entity for validation failures, 503 Service Unavailable for infrastructure failures
- **FR-016**: System MUST never expose internal error details, stack traces, or database information to API clients
- **FR-017**: System MUST never log, store, or expose JWT secrets, database credentials, or other sensitive configuration
- **FR-018**: System MUST use indexed user_id column in database for efficient query performance
- **FR-019**: System MUST support CORS configuration to allow requests from frontend origin at BETTER_AUTH_URL
- **FR-020**: System MUST read all configuration from environment variables (.env file), never hardcoded values

### Key Entities

- **Task**: Represents a single todo item with unique identifier (id), owner identifier (user_id), title (required, max 200 chars), optional description (max 1000 chars), completion status (boolean), and automatic timestamps (created_at, updated_at). Tasks are always scoped to a single user and cannot be shared or transferred between users.

- **User Identity**: Implicitly represented through JWT token claims and user_id string. Backend does not store user profile data - it only validates tokens and enforces ownership. User data management is handled by Better Auth on the frontend.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any authenticated frontend user can create a task and immediately see it appear in their task list within 2 seconds
- **SC-002**: Users cannot view, modify, or delete tasks belonging to other users under any circumstances (100% data isolation)
- **SC-003**: All API endpoints reject requests with missing or invalid JWT tokens with appropriate error messages
- **SC-004**: System maintains data consistency - all task operations are atomic and tasks persist correctly across server restarts
- **SC-005**: Frontend integration requires zero frontend code changes - all existing API contracts are honored
- **SC-006**: API responds to typical CRUD operations (single task operations) in under 500ms at p95 latency
- **SC-007**: System handles at least 50 concurrent authenticated users performing task operations without errors or data corruption
- **SC-008**: All validation errors return structured, actionable error messages that frontend can display to users
- **SC-009**: System logs all authentication failures for security monitoring without exposing sensitive details to clients
- **SC-010**: Backend can be deployed and configured entirely through environment variables without code modifications

### Assumptions

- **Database Connection**: Neon PostgreSQL connection is stable and reliable - no automatic retry logic or connection pooling configuration required in initial implementation
- **JWT Token Format**: Better Auth generates standard JWT tokens with user identity in predictable claim field (e.g., "sub" or "user_id")
- **Pagination**: Initial implementation returns all tasks for a user - pagination will be added in future iteration if needed (assume reasonable task counts per user)
- **Task Ordering**: Tasks are returned in database default order (likely creation order) - explicit sorting will be added if frontend requires specific ordering
- **Timezone Handling**: Timestamps stored in UTC and returned in ISO 8601 format - frontend handles timezone conversion for display
- **CORS Configuration**: Frontend runs at BETTER_AUTH_URL and is the only allowed origin - no multi-origin support needed initially
- **Rate Limiting**: No rate limiting implemented initially - assume reasonable user behavior and add if abuse occurs
- **Data Retention**: Tasks persist indefinitely - no automatic cleanup or archival policies
- **File Structure**: Backend organized according to specified structure (main.py, db.py, models.py, auth/jwt.py, routes/tasks.py, dependencies.py) to maintain modularity and testability
