---
id: 1
title: Next.js Todo Frontend Spec
stage: spec
date: 2026-01-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-frontend
branch: 1-todo-frontend
user: unknown
command: /sp.specify
labels: ["spec", "frontend", "todo", "authentication"]
links:
  spec: specs/1-todo-frontend/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/1-todo-frontend/spec.md
 - specs/1-todo-frontend/checklists/requirements.md
tests:
 - none
---

## Prompt

/sp.specify

Project: Hackathon II – Todo Full-Stack Web Application
Phase: Phase II (Frontend Only)
Scope: Next.js Frontend Implementation

---

## Target Audience
- Hackathon judges reviewing spec-driven and agentic frontend development
- Evaluators validating modern React + Next.js architecture

---

## Objective
Build a **responsive, authenticated Todo frontend** using **Next.js App Router** that communicates with a REST API via JWT-secured requests, following **Spec-Kit Plus and Claude Code workflows**.

---

## In Scope (Frontend Only)

### Authentication (UI Level)
- User signup
- User signin
- Session handling via Better Auth
- JWT token retrieval and storage (client-side only)

### Task Management UI
- Create task (title, description)
- View list of tasks
- View task status (completed / pending)
- Update task
- Delete task
- Toggle task completion

### UI/UX
- Responsive layout (desktop + mobile)
- Clear task status indicators
- Loading and error states
- Protected routes (authenticated users only)

---

## Out of Scope
- Backend implementation
- Database schema or queries
- AI agents or chatbot
- Authorization logic inside backend
- Role-based access
- Notifications or reminders

---

## Technology Constraints (Locked)

- Framework: **Next.js 16+ (App Router)**
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- Auth Library: **Better Auth**
- API Communication: REST + JWT
- Spec System: **Spec-Kit Plus**
- Code Generation: **Claude Code only**
- Manual coding is strictly forbidden

---

## Folder Structure (Frontend Only)

```text
frontend/
├── app/
│   ├── login/
│   ├── register/
│   ├── tasks/
│   └── layout.tsx
├── components/
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   └── Navbar.tsx
├── lib/
│   ├── api.ts        # API client
│   └── auth.ts       # Better Auth helpers
├── styles/
└── CLAUDE.md
API Interaction Rules

All API calls must go through a centralized API client

JWT token must be attached in:
Authorization: Bearer <token>

Frontend must assume:

401 → user is logged out

403 → access denied

Frontend must never trust unauthenticated state

Success Criteria

User can sign up and log in successfully

Authenticated user can perform all task CRUD operations

Tasks shown belong only to the logged-in user

UI works across screen sizes

All implementation strictly follows this spec

Acceptance Validation

Reviewer can trace:
Spec → Plan → Tasks → Claude Code output

No frontend feature exists without being specified here

Any deviation invalidates the frontend phase

## Response snapshot

Updated the comprehensive specification for the Next.js Todo Frontend Implementation to include additional UI/UX excellence requirements, advanced UI states, backend as source of truth requirements, and all other requirements specified in the updated user requirements. The specification now covers authentication flows, task management features, responsive UI requirements, and high-quality UI/UX standards.

## Outcome

- ✅ Impact: Complete feature specification updated for Next.js Todo frontend with authentication, task management, and UI/UX excellence requirements
- 🧪 Tests: none
- 📁 Files: specs/1-todo-frontend/spec.md, specs/1-todo-frontend/checklists/requirements.md
- 🔁 Next prompts: /sp.plan to create implementation plan
- 🧠 Reflection: Specification successfully captures all required functionality including the non-negotiable UI/UX excellence requirements while maintaining focus on user value

## Evaluation notes (flywheel)

- Failure modes observed: None - all required components created successfully
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A