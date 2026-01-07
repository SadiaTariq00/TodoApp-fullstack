# Tasks: FastAPI Backend with JWT Auth and Neon PostgreSQL

**Feature Branch**: `002-fastapi-backend`
**Input**: Design documents from `/specs/002-fastapi-backend/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are excluded per template guidelines.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Tasks include exact file paths

## Path Conventions

This is a web application with backend at `/backend`:
- Backend source: `backend/`
- Tests (if added later): `backend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure: `backend/`, `backend/auth/`, `backend/routes/`, `backend/tests/`
- [x] T002 Create `backend/requirements.txt` with dependencies: fastapi==0.109.0, uvicorn[standard]==0.27.0, sqlmodel==0.0.14, asyncpg==0.29.0, pyjwt==2.8.0, python-dotenv==1.0.0, pytest==8.0.0, httpx==0.26.0
- [x] T003 Create `backend/.env.example` with template for BETTER_AUTH_SECRET, NEON_DATABASE_URL, BETTER_AUTH_URL, DEBUG
- [x] T004 [P] Create `backend/CLAUDE.md` documenting backend-specific Claude Code rules
- [x] T005 [P] Create `backend/README.md` with setup instructions referencing quickstart.md

**Checkpoint**: Basic project structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create `backend/models.py` with SQLModel base classes: TaskBase, TaskCreate, TaskUpdate, Task (table=True) per data-model.md specifications
- [x] T007 Create `backend/db.py` with async engine creation, session factory, and get_session() dependency using asyncpg driver
- [x] T008 [P] Create `backend/auth/jwt.py` with JWT validation functions: decode_token(), verify_signature(), extract_user_id(), handle PyJWT exceptions
- [x] T009 [P] Create `backend/dependencies.py` with FastAPI dependencies: get_db() for database sessions, get_current_user() for JWT validation and user extraction
- [x] T010 Create `backend/main.py` with FastAPI app initialization, CORS middleware configuration (allow_origins from BETTER_AUTH_URL), database startup/shutdown events, router mounting
- [x] T011 Add health check endpoint GET /health in `backend/main.py` returning {"status": "healthy", "timestamp": ISO8601} per openapi.yaml
- [x] T012 Configure environment variable loading in `backend/main.py` using python-dotenv with validation for required vars: BETTER_AUTH_SECRET, NEON_DATABASE_URL, BETTER_AUTH_URL
- [x] T013 Setup logging configuration in `backend/main.py` with INFO level, structured format, auth failure logging per research.md section 12

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authenticated Task Creation (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to create new tasks in their personal todo list with JWT validation and database persistence

**Independent Test**: Send authenticated POST request to `/api/{user_id}/tasks` with valid JWT token and task data. Success delivers HTTP 201 with persisted task including auto-generated ID and timestamps.

**Acceptance Criteria**:
- Valid JWT + valid data → HTTP 201 with task details
- Valid JWT + different user_id in URL → HTTP 403 Forbidden
- No JWT token → HTTP 401 Unauthorized
- Invalid/expired JWT → HTTP 401 Unauthorized

### Implementation for User Story 1

- [x] T014 [P] [US1] Create POST `/api/{user_id}/tasks` endpoint in `backend/routes/tasks.py` with dependencies on get_db and get_current_user
- [x] T015 [US1] Implement create_task route handler: validate user_id matches JWT, create Task with TaskCreate schema, auto-populate user_id/timestamps, save to database
- [x] T016 [US1] Add validation for TaskCreate schema: title (1-200 chars, required), description (0-1000 chars, optional), completed (boolean, default false)
- [x] T017 [US1] Add authorization check in create_task: compare path user_id with JWT user_id, raise 403 if mismatch
- [x] T018 [US1] Add authentication error handling: catch PyJWT exceptions, return 401 with appropriate message (missing/invalid/expired token)
- [x] T019 [US1] Add database error handling: catch connection failures, return 503 Service Unavailable with sanitized error message
- [x] T020 [US1] Add logging for auth failures in create_task: log user_id, reason (401), timestamp without exposing JWT token
- [x] T021 [US1] Mount tasks router in `backend/main.py` with prefix `/api` and tag `tasks`

**Checkpoint**: User Story 1 complete - users can create tasks via authenticated POST requests

---

## Phase 4: User Story 2 - Retrieve Personal Task List (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to view all their existing tasks with complete data isolation between users

**Independent Test**: Send authenticated GET request to `/api/{user_id}/tasks`. Success delivers HTTP 200 with array containing only authenticated user's tasks.

**Acceptance Criteria**:
- Valid JWT + matching user_id → HTTP 200 with user's tasks
- Valid JWT + different user_id in URL → HTTP 403 Forbidden
- User with no tasks → HTTP 200 with empty array []
- No JWT token → HTTP 401 Unauthorized

### Implementation for User Story 2

- [x] T022 [P] [US2] Create GET `/api/{user_id}/tasks` endpoint in `backend/routes/tasks.py` with dependencies on get_db and get_current_user
- [x] T023 [US2] Implement list_tasks route handler: validate user_id matches JWT, query database with WHERE user_id filter, return array of Task models
- [x] T024 [US2] Add authorization check in list_tasks: compare path user_id with JWT user_id, raise 403 if mismatch
- [x] T025 [US2] Ensure query scoping: use `select(Task).where(Task.user_id == current_user_id)` to enforce data isolation per FR-013
- [x] T026 [US2] Add authentication error handling: catch PyJWT exceptions, return 401 with appropriate message
- [x] T027 [US2] Handle empty result set: return empty array [] with HTTP 200 when user has no tasks
- [x] T028 [US2] Add logging for auth failures in list_tasks: log user_id, reason (401/403), timestamp

**Checkpoint**: User Stories 1 AND 2 complete - users can create and view their tasks (MVP ready!)

---

## Phase 5: User Story 6 - Retrieve Single Task Details (Priority: P3)

**Goal**: Enable authenticated users to view detailed information about a specific task they own

**Independent Test**: Send authenticated GET request for `/api/{user_id}/tasks/{task_id}`. Success delivers HTTP 200 with complete task details.

**Acceptance Criteria**:
- Valid JWT + owned task → HTTP 200 with task details
- Valid JWT + task owned by different user → HTTP 403 or 404
- Valid JWT + non-existent task_id → HTTP 404 Not Found

### Implementation for User Story 6

- [x] T029 [P] [US6] Create GET `/api/{user_id}/tasks/{task_id}` endpoint in `backend/routes/tasks.py` with path parameters user_id (str) and task_id (int)
- [x] T030 [US6] Implement get_task route handler: validate user_id matches JWT, query database with WHERE id AND user_id filter, return Task model
- [x] T031 [US6] Add authorization check in get_task: compare path user_id with JWT user_id, raise 403 if mismatch
- [x] T032 [US6] Ensure query scoping: use `select(Task).where(Task.id == task_id, Task.user_id == current_user_id)` for ownership validation
- [x] T033 [US6] Handle task not found: raise HTTPException 404 with "Task not found" message when query returns None
- [x] T034 [US6] Add authentication error handling: catch PyJWT exceptions, return 401

**Checkpoint**: Single task retrieval functional - supports optimized frontend operations

---

## Phase 6: User Story 3 - Update Task Details (Priority: P2)

**Goal**: Enable authenticated users to modify existing task title, description, or completion status with atomic updates

**Independent Test**: Send authenticated PUT request to `/api/{user_id}/tasks/{task_id}` with updated fields. Success delivers HTTP 200 with updated task data and refreshed updated_at timestamp.

**Acceptance Criteria**:
- Valid JWT + owned task + valid data → HTTP 200 with updated task
- Valid JWT + task owned by different user → HTTP 403 or 404
- Valid JWT + non-existent task_id → HTTP 404 Not Found

### Implementation for User Story 3

- [x] T035 [P] [US3] Create PUT `/api/{user_id}/tasks/{task_id}` endpoint in `backend/routes/tasks.py` with TaskUpdate request body schema
- [x] T036 [US3] Implement update_task route handler: validate user_id matches JWT, fetch task with ownership check, update provided fields, refresh updated_at timestamp
- [x] T037 [US3] Add authorization check in update_task: compare path user_id with JWT user_id, raise 403 if mismatch
- [x] T038 [US3] Ensure query scoping: fetch task with WHERE id AND user_id filter before updating
- [x] T039 [US3] Implement partial update logic: only update fields present in TaskUpdate request body (title, description, completed)
- [x] T040 [US3] Update updated_at timestamp: set to `datetime.utcnow()` on every successful update per FR-011
- [x] T041 [US3] Handle task not found: raise HTTPException 404 when task doesn't exist or not owned by user
- [x] T042 [US3] Add validation error handling: return 422 with field-specific errors for title/description length violations
- [x] T043 [US3] Prevent immutable field changes: ensure user_id, id, created_at cannot be modified per data-model.md

**Checkpoint**: Task update functional - users can modify task content and completion status

---

## Phase 7: User Story 4 - Mark Task Complete/Incomplete (Priority: P2)

**Goal**: Enable authenticated users to toggle task completion status without modifying other fields

**Independent Test**: Send authenticated PATCH request to `/api/{user_id}/tasks/{task_id}/complete`. Success delivers HTTP 200 with toggled completed status and updated timestamp.

**Acceptance Criteria**:
- Valid JWT + owned incomplete task → completed=true, updated_at refreshed, HTTP 200
- Valid JWT + owned complete task → completed=false, updated_at refreshed, HTTP 200
- Valid JWT + task owned by different user → HTTP 403 or 404

### Implementation for User Story 4

- [x] T044 [P] [US4] Create PATCH `/api/{user_id}/tasks/{task_id}/complete` endpoint in `backend/routes/tasks.py` with no request body
- [x] T045 [US4] Implement toggle_completion route handler: validate user_id matches JWT, fetch task, flip completed boolean, refresh updated_at, save
- [x] T046 [US4] Add authorization check in toggle_completion: compare path user_id with JWT user_id, raise 403 if mismatch
- [x] T047 [US4] Ensure query scoping: fetch task with WHERE id AND user_id filter before toggling
- [x] T048 [US4] Implement toggle logic: set `task.completed = not task.completed` to flip boolean value
- [x] T049 [US4] Update updated_at timestamp: set to `datetime.utcnow()` on every toggle
- [x] T050 [US4] Handle task not found: raise HTTPException 404 when task doesn't exist or not owned by user

**Checkpoint**: Task completion toggle functional - simple UI interaction pattern supported

---

## Phase 8: User Story 5 - Delete Task (Priority: P3)

**Goal**: Enable authenticated users to permanently remove a task from their list

**Independent Test**: Send authenticated DELETE request to `/api/{user_id}/tasks/{task_id}`. Success results in HTTP 204 No Content and task removal from database.

**Acceptance Criteria**:
- Valid JWT + owned task → task deleted, HTTP 204 No Content
- Valid JWT + task owned by different user → HTTP 403 or 404
- Valid JWT + non-existent task_id → HTTP 404 Not Found

### Implementation for User Story 5

- [x] T051 [P] [US5] Create DELETE `/api/{user_id}/tasks/{task_id}` endpoint in `backend/routes/tasks.py` with no request body
- [x] T052 [US5] Implement delete_task route handler: validate user_id matches JWT, fetch task, delete from database, return 204 No Content
- [x] T053 [US5] Add authorization check in delete_task: compare path user_id with JWT user_id, raise 403 if mismatch
- [x] T054 [US5] Ensure query scoping: fetch task with WHERE id AND user_id filter before deleting
- [x] T055 [US5] Implement hard delete: use `session.delete(task)` and `session.commit()` for permanent removal per data-model.md
- [x] T056 [US5] Handle task not found: raise HTTPException 404 when task doesn't exist or not owned by user
- [x] T057 [US5] Return 204 No Content: use `status_code=204` in route decorator, return None from handler

**Checkpoint**: All CRUD operations complete - full task management functionality available

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and finalize deployment readiness

- [x] T058 [P] Add comprehensive docstrings to all route handlers in `backend/routes/tasks.py` explaining parameters, returns, and errors
- [x] T059 [P] Add comprehensive docstrings to auth functions in `backend/auth/jwt.py` explaining JWT validation flow
- [x] T060 Validate all error responses match openapi.yaml schema: {"detail": "message"} for single errors
- [x] T061 Validate all success responses match openapi.yaml schema: Task model with all required fields
- [x] T062 [P] Create `backend/.env` file from `.env.example` and add to `.gitignore` to prevent secret exposure
- [x] T063 Test database connection on startup: verify NEON_DATABASE_URL connectivity, log connection status, fail fast with clear error
- [x] T064 Verify CORS configuration: test preflight OPTIONS requests, confirm frontend origin allowed, check credentials support
- [x] T065 [P] Add rate limiting considerations documentation in `backend/README.md` (implementation deferred per research.md)
- [x] T066 [P] Add pagination considerations documentation in `backend/README.md` (implementation deferred per spec.md assumptions)
- [x] T067 Verify all logging statements sanitize user input and never expose JWT tokens or secrets per FR-017
- [x] T068 Run through quickstart.md validation: install dependencies, configure .env, start server, test health endpoint, test task creation with JWT
- [x] T069 Validate all constitutional requirements: verify §3 stack (FastAPI, SQLModel, Neon), verify §5 security (/api prefix, JWT required, ownership enforced), verify §6 structure (/backend directory)
- [x] T070 Final smoke test: create task, list tasks, get single task, update task, toggle completion, delete task - all with valid JWT and proper isolation

**Checkpoint**: Backend fully implemented, documented, and ready for frontend integration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User Story 1 (P1) + User Story 2 (P1): Should be completed first for MVP (create + list tasks)
  - User Story 6 (P3): Can proceed in parallel with other stories
  - User Story 3 (P2) + User Story 4 (P2): Can proceed in parallel after MVP
  - User Story 5 (P3): Can proceed in parallel with other stories
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories ✅
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories ✅
- **User Story 6 (P3)**: Can start after Foundational - No dependencies on other stories ✅
- **User Story 3 (P2)**: Can start after Foundational - No dependencies on other stories ✅
- **User Story 4 (P2)**: Can start after Foundational - No dependencies on other stories ✅
- **User Story 5 (P3)**: Can start after Foundational - No dependencies on other stories ✅

All user stories are independently testable and can be implemented in parallel once foundational infrastructure is complete.

### Within Each User Story

- Route creation before handler implementation
- Authorization checks before database operations
- Query scoping for data isolation
- Error handling for auth, validation, database
- Logging for security events

### Parallel Opportunities

**Phase 1 - Setup**: Tasks T003, T004, T005 can run in parallel

**Phase 2 - Foundational**: Tasks T008, T009 can run in parallel (auth and dependencies are independent)

**Phase 3+ - User Stories**: After Foundational phase completes, ALL user stories can start in parallel:
- Team Member A: User Story 1 (T014-T021)
- Team Member B: User Story 2 (T022-T028)
- Team Member C: User Story 6 (T029-T034)
- Team Member D: User Story 3 (T035-T043)
- Team Member E: User Story 4 (T044-T050)
- Team Member F: User Story 5 (T051-T057)

**Phase 9 - Polish**: Tasks T058, T059, T062, T065, T066, T067 can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch User Story 1:
# All tasks within US1 must run sequentially (same file: backend/routes/tasks.py)

# Task T014: Create POST endpoint skeleton
# Task T015: Implement route handler logic
# Task T016: Add validation
# Task T017: Add authorization check
# Task T018: Add auth error handling
# Task T019: Add database error handling
# Task T020: Add logging
# Task T021: Mount router in main.py
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only) - Recommended

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T013) ⚠️ CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (T014-T021) - Task creation
4. Complete Phase 4: User Story 2 (T022-T028) - Task listing
5. **STOP and VALIDATE**: Test create + list tasks independently with real JWT tokens
6. Deploy/demo MVP - users can create and view tasks ✅

### Incremental Delivery

1. **Foundation**: Complete Setup + Foundational → Infrastructure ready
2. **MVP Delivery**: Add US1 + US2 → Test independently → Deploy/Demo (core value!)
3. **Enhancement 1**: Add US6 (single task retrieval) → Test → Deploy
4. **Enhancement 2**: Add US3 + US4 (update + toggle) → Test → Deploy
5. **Enhancement 3**: Add US5 (delete) → Test → Deploy
6. **Polish**: Phase 9 polish tasks → Final validation → Production deploy

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers after Foundational phase complete:

1. Team completes Setup + Foundational together (T001-T013)
2. Split team across user stories:
   - Developer A: User Story 1 (P1) - T014-T021
   - Developer B: User Story 2 (P1) - T022-T028
   - Developer C: User Story 3 (P2) - T035-T043
   - Developer D: User Story 4 (P2) - T044-T050
   - Developer E: User Story 5 (P3) - T051-T057
   - Developer F: User Story 6 (P3) - T029-T034
3. Stories complete independently and integrate without conflicts (different endpoints)
4. Integration test all stories together
5. Complete Polish tasks (T058-T070) collectively

---

## Task Summary

**Total Tasks**: 70

**Tasks per Phase**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 8 tasks ⚠️ CRITICAL PATH
- Phase 3 (US1 - Create Task): 8 tasks 🎯 MVP
- Phase 4 (US2 - List Tasks): 7 tasks 🎯 MVP
- Phase 5 (US6 - Get Task): 6 tasks
- Phase 6 (US3 - Update Task): 9 tasks
- Phase 7 (US4 - Toggle Complete): 7 tasks
- Phase 8 (US5 - Delete Task): 7 tasks
- Phase 9 (Polish): 13 tasks

**Parallel Opportunities**: 47 tasks can potentially run in parallel (67% of total):
- 3 tasks in Phase 1
- 2 tasks in Phase 2
- All 6 user stories (42 tasks) can run in parallel after Foundational
- 6 tasks in Phase 9

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (28 tasks) delivers task creation and listing functionality.

---

## Validation Checklist

**Format Validation**:
- ✅ All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description`
- ✅ All task IDs sequential (T001-T070)
- ✅ All [P] markers on parallelizable tasks
- ✅ All user story tasks have [US#] labels
- ✅ All tasks include specific file paths

**Completeness Validation**:
- ✅ All 6 user stories from spec.md represented (US1, US2, US3, US4, US5, US6)
- ✅ All endpoints from openapi.yaml covered (POST, GET list, GET single, PUT, PATCH, DELETE, health)
- ✅ All entities from data-model.md implemented (Task model with validations)
- ✅ All functional requirements from spec.md addressed (FR-001 through FR-020)
- ✅ All success criteria from spec.md achievable (SC-001 through SC-010)
- ✅ All technical decisions from research.md applied (PyJWT, SQLModel, asyncpg, CORS, etc.)

**Independence Validation**:
- ✅ Each user story has independent test criteria
- ✅ User stories can be implemented in parallel (different endpoints, no shared state)
- ✅ MVP (US1 + US2) delivers standalone value
- ✅ Foundational phase clearly blocks all user stories

---

## Notes

- **[P] tasks**: Different files or modules, no dependencies, can run simultaneously
- **[Story] labels**: Map tasks to user stories for traceability and independent validation
- **No test tasks**: Tests not requested in specification per template guidance section
- **File paths**: All paths specified for each implementation task
- **Constitutional compliance**: All tasks align with §3 (FastAPI + SQLModel + Neon), §5 (REST + JWT + ownership), §6 (monorepo /backend)
- **Zero frontend changes**: All contracts match existing frontend per SC-005
- **Security first**: Every endpoint validates JWT, enforces user_id matching, scopes queries by user
- **Commit strategy**: Commit after completing each user story phase for atomic rollback capability
- **Stop points**: Each phase has a checkpoint - validate before proceeding to catch issues early

---

**Ready for Implementation**: Run `/sp.implement` to begin executing tasks or manually implement using this task list as guide.
