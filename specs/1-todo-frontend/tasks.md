---
description: "Task list for Next.js Todo Frontend implementation"
---

# Tasks: Next.js Todo Frontend

**Input**: Design documents from `/specs/1-todo-frontend/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend app**: `frontend/` at repository root
- Paths shown below follow the plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan in frontend/
- [x] T002 Initialize Next.js project with TypeScript, Tailwind CSS, and required dependencies
- [x] T003 [P] Configure linting and formatting tools (ESLint, Prettier) in frontend/
- [x] T004 Create initial configuration files (next.config.js, tailwind.config.js, tsconfig.json) in frontend/
- [x] T005 [P] Set up environment configuration in frontend/.env.local

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create centralized API client in frontend/lib/api.ts
- [x] T007 [P] Implement JWT token handling and attachment mechanism in frontend/lib/api.ts
- [x] T008 [P] Create auth helpers in frontend/lib/auth.ts
- [x] T009 Create TypeScript types in frontend/types/index.ts (if not already created)
- [x] T010 Set up global styles in frontend/styles/globals.css
- [x] T011 Create ProtectedRoute component in frontend/components/ProtectedRoute.tsx
- [x] T012 [P] Set up shared context providers in frontend/app/layout.tsx
- [x] T013 Configure error handling strategy for API responses in frontend/lib/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication Flow (Priority: P1) 🎯 MVP

**Goal**: Enable new users to sign up for an account and handle JWT token securely

**Independent Test**: Can be fully tested by accessing the registration page, providing valid user details, and successfully creating an account with proper JWT token handling.

### Implementation for User Story 1

- [x] T014 [P] [US1] Create AuthForm component in frontend/components/AuthForm.tsx
- [x] T015 [P] [US1] Create registration page in frontend/app/register/page.tsx
- [x] T016 [US1] Implement registration form validation in frontend/components/AuthForm.tsx
- [x] T017 [US1] Implement registration API call in frontend/components/AuthForm.tsx
- [x] T018 [US1] Handle JWT token storage and redirect after successful registration
- [x] T019 [US1] Add registration error handling and user feedback
- [x] T020 [US1] Add loading states for registration process

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Task Management (Priority: P1)

**Goal**: Allow authenticated users to create, view, update, and delete tasks

**Independent Test**: Can be fully tested by creating tasks, viewing them in a list, updating their status, and deleting them, all while maintaining proper authentication state.

### Implementation for User Story 2

- [x] T021 [P] [US2] Create TaskCard component in frontend/components/TaskCard.tsx
- [x] T022 [P] [US2] Create TaskForm component in frontend/components/TaskForm.tsx
- [x] T023 [P] [US2] Create tasks page in frontend/app/tasks/page.tsx
- [x] T024 [US2] Implement task creation functionality in frontend/components/TaskForm.tsx
- [x] T025 [US2] Implement task list display in frontend/app/tasks/page.tsx
- [x] T026 [US2] Implement task update functionality in frontend/components/TaskForm.tsx
- [x] T027 [US2] Implement task deletion functionality in frontend/components/TaskCard.tsx
- [x] T028 [US2] Implement task completion toggle in frontend/components/TaskCard.tsx
- [x] T029 [US2] Add API calls for task operations using centralized API client
- [x] T030 [US2] Add loading and error states for task operations

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - User Login and Session Management (Priority: P2)

**Goal**: Enable existing users to sign in to their account and maintain their session across browser sessions

**Independent Test**: Can be fully tested by logging in with valid credentials, maintaining session state, and automatically logging out when JWT token expires.

### Implementation for User Story 3

- [x] T031 [P] [US3] Create login page in frontend/app/login/page.tsx
- [x] T032 [US3] Update AuthForm component to handle login functionality in frontend/components/AuthForm.tsx
- [x] T033 [US3] Implement JWT token validation and session management in frontend/lib/auth.ts
- [x] T034 [US3] Implement logout functionality in frontend/components/Navbar.tsx
- [x] T035 [US3] Implement automatic logout when JWT token expires
- [x] T036 [US3] Handle session persistence across browser sessions
- [x] T037 [US3] Add login error handling and user feedback
- [x] T038 [US3] Add loading states for login process

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Responsive UI/UX Excellence (Priority: P2)

**Goal**: Create a beautiful, professional, and advanced UI that works across desktop, tablet, and mobile devices with consistent design system

**Independent Test**: Can be fully tested by accessing the application on different screen sizes and verifying that UI elements are properly responsive, visually appealing, and include proper hover states, focus states, disabled states, and feedback mechanisms.

### Implementation for User Story 4

- [x] T039 [P] [US4] Create Navbar component in frontend/components/Navbar.tsx
- [x] T040 [P] [US4] Create responsive layout in frontend/app/layout.tsx
- [x] T041 [US4] Implement consistent typography system in frontend/styles/globals.css
- [x] T042 [US4] Implement consistent spacing system using Tailwind in frontend/styles/globals.css
- [x] T043 [US4] Implement consistent color palette in frontend/tailwind.config.js
- [x] T044 [US4] Add clear visual hierarchy for actions and content in all components
- [x] T045 [US4] Make all pages responsive for mobile, tablet, and desktop
- [x] T046 [US4] Add proper touch targets for mobile interactions
- [x] T047 [US4] Ensure no layout breaking, overflow, or misalignment across devices

**Checkpoint**: All UI elements now meet SaaS-grade quality standards

---

## Phase 7: User Story 5 - Advanced UI/UX Components (Priority: P2)

**Goal**: Ensure all UI components include proper states (hover, focus, disabled) and provide immediate visual feedback

**Independent Test**: Can be fully tested by interacting with all UI components and verifying proper states and feedback mechanisms.

### Implementation for User Story 5

- [x] T048 [P] [US5] Add hover states for all interactive elements in all components
- [x] T049 [P] [US5] Add focus states for all form elements in all components
- [x] T050 [P] [US5] Add disabled states for all components in all components
- [x] T051 [US5] Add proper success feedback for all user actions
- [x] T052 [US5] Add proper error feedback for all user actions
- [x] T053 [US5] Add proper loading feedback for all API operations
- [x] T054 [US5] Ensure immediate visual feedback for all user interactions
- [x] T055 [US5] Implement intuitive UI flows with minimal unnecessary clicks
- [x] T056 [US5] Add accessibility attributes for keyboard navigation

**Checkpoint**: All user stories now have advanced UI/UX with proper states and feedback

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T057 [P] Add documentation updates in README.md
- [x] T058 [P] Add CLAUDE.md file in frontend/ directory
- [x] T059 Update API error handling to handle 401 (logout) and 403 (access error) responses
- [x] T060 Add empty state handling for task list in frontend/app/tasks/page.tsx
- [x] T061 Add proper loading states that rely only on JWT presence
- [x] T062 Ensure backend is treated as single source of truth for all data
- [x] T063 Add validation to ensure only logged-in user's tasks are displayed
- [x] T064 Run quickstart.md validation to ensure setup instructions work
- [x] T065 Final UI polish to ensure visually polished without weakness or inconsistency

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May use components from US1 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May use components from other stories but should be independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Will enhance all existing components

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 4

```bash
# Launch all UI components for User Story 4 together:
Task: "Create Navbar component in frontend/components/Navbar.tsx"
Task: "Create responsive layout in frontend/app/layout.tsx"

# Launch all styling tasks together:
Task: "Implement consistent typography system in frontend/styles/globals.css"
Task: "Implement consistent spacing system using Tailwind in frontend/styles/globals.css"
Task: "Implement consistent color palette in frontend/tailwind.config.js"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Registration)
4. Complete Phase 4: User Story 2 (Task Management)
5. **STOP and VALIDATE**: Test User Stories 1 and 2 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Registration MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Task Management MVP!)
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add Polish → Final product → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Stories 4 & 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence