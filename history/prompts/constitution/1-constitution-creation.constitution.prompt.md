---
id: 1
title: constitution-creation
stage: constitution
date: 2026-01-04
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: default_user
command: sp.constitution
labels: [constitution,setup,initial]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

```text
You are Spec-Kit Plus operating in **Constitution Mode**.

Project Name: Todo Full-Stack Web Application
Hackathon: Hackathon II
Phase: Phase II – Full-Stack Web Application

Your task is to generate a **CONSTITUTION.md** file that strictly governs how this project must be designed, specified, and implemented using **Spec-Driven and Agentic Development**.

---

## 1. Development Methodology (Non-Negotiable)
- The project must strictly follow the **Agentic Dev Stack workflow**:
  Write tures allowed.

---

## 5. API & Security Rules
- All APIs under `/api/`
- All endpoints require JWT:
  Authorization: Bearer `<token>`
- Backend must:
  - Verify JWT
  - Extract authenticated user
  - Enforce task ownership
- Missing/invalid token → `401 Unauthorized`

---

## 6. Mandatory Monorepo Structure
```text
hackathon-todo/
├── .spec-kit/
│   └── config.yaml
├── specs/
│   ├── overview.mdSpecification → Generate Plan → Break into Tasks → Implement via Claude Code
- **Manual coding by humans is strictly forbidden**
- All code must be generated using **Claude Code**
- Judges will evaluate prompts, specs, plans, and iterations
- Any deviation invalidates Phase II

---

## 2. Specification Governance
- Every feature must originate from a written specification
- Specs must:
  - Be written in Markdown
  - Follow Spec-Kit Plus conventions
  - Live inside `/specs`
- Specs are the **single source of truth**
- No implementation without spec approval
- Specs must be referenced using `@specs/path/to/file.md`

---

## 3. Locked Technology Stack
**Frontend**
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS

**Backend**
- Python FastAPI
- SQLModel ORM

**Database**
- Neon Serverless PostgreSQL

**Authentication**
- Better Auth (Frontend)
- JWT-based auth shared with FastAPI backend

**Spec Tools**
- Claude Code
- Spec-Kit Plus

---

## 4. Feature Scope (Phase II Only)
Allowed features:
- Task CR
│   ├── architecture.md
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── CLAUDE.md
├── frontend/
│   ├── CLAUDE.md
│   └── Next.js app
├── backend/
│   ├── CLAUDE.md
│   └── FastAPI app
├── docker-compose.yml
└── README.md
```

You **MUST** consider the user input before proceeding (if not empty).
```

## Response snapshot

Constitution file created at `.specify/memory/constitution.md` with the following content:

# Todo Full-Stack Web Application Constitution

## Core Principles

### Agentic Dev Stack Workflow
The project must strictly follow the Agentic Dev Stack workflow: Specification → Generate Plan → Break into Tasks → Implement via Claude Code. Manual coding by humans is strictly forbidden. All code must be generated using Claude Code.

### Specification Governance
Every feature must originate from a written specification. Specs must be written in Markdown, follow Spec-Kit Plus conventions, and live inside `/specs`. Specs are the single source of truth. No implementation without spec approval. Specs must be referenced using `@specs/path/to/file.md`.

### Locked Technology Stack
Must use the locked technology stack: Frontend (Next.js 16+, TypeScript, Tailwind CSS), Backend (Python FastAPI, SQLModel ORM), Database (Neon Serverless PostgreSQL), Authentication (Better Auth with JWT-based auth shared with FastAPI backend), and Spec Tools (Claude Code, Spec-Kit Plus).

### Feature Scope Compliance
Only allowed features for Phase II: Task CRUD operations, API endpoints, security implementation, and authentication. All implementations must stay within the defined scope.

### API & Security Rules
All APIs must be under `/api/`, all endpoints require JWT Authorization: Bearer `<token>`, backend must verify JWT, extract authenticated user, enforce task ownership. Missing/invalid token returns `401 Unauthorized`.

### Mandatory Monorepo Structure
Must follow the mandatory monorepo structure with proper directory organization: `.specify/`, `specs/`, `frontend/`, `backend/`, and other specified directories.

## Development Constraints
Technology stack is locked and cannot be changed. Manual coding is forbidden - only Claude Code generation allowed. All development must follow Spec-Driven approach. Judges will evaluate prompts, specs, plans, and iterations. Any deviation invalidates Phase II.

## Development Workflow
Workflow must follow: Write Specification → Generate Plan → Break into Tasks → Implement via Claude Code. Each phase requires approval before proceeding to the next. All changes must be tracked with Prompt History Records (PHRs).

## Governance
This constitution supersedes all other practices. Amendments require formal documentation and approval process. All PRs and reviews must verify compliance with these principles. Development must follow the Agentic Dev Stack workflow. Violation of constitution rules invalidates Phase II participation.

**Version**: 1.0.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-04

## Outcome

- ✅ Impact: Constitution file created at `.specify/memory/constitution.md`
- 🧪 Tests: No tests required for this task
- 📁 Files: Updated `.specify/memory/constitution.md`
- 🔁 Next prompts: None
- 🧠 Reflection: Constitution successfully created based on user requirements with all specified principles and constraints

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): Not applicable
- Next experiment (smallest change to try): Not applicable