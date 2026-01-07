# Quick Start Guide: FastAPI Backend

**Feature**: 002-fastapi-backend
**Date**: 2026-01-06
**Purpose**: Get the FastAPI backend running locally in under 5 minutes

---

## Prerequisites

- Python 3.11 or higher installed
- pip package manager
- Access to Neon PostgreSQL database
- Better Auth JWT secret from frontend

---

## 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Key Dependencies**:
- `fastapi==0.109.0` - Web framework
- `uvicorn[standard]==0.27.0` - ASGI server
- `sqlmodel==0.0.14` - ORM with Pydantic validation
- `asyncpg==0.29.0` - Async PostgreSQL driver
- `pyjwt==2.8.0` - JWT token handling
- `python-dotenv==1.0.0` - Environment variable loading

---

## 2. Configure Environment Variables

Create `.env` file in `/backend` directory:

```env
# JWT Authentication (get from frontend .env)
BETTER_AUTH_SECRET=PU0Tdg9Y0rvcqOFEPtwYhWwDdyPIp20g

# Neon Database Connection
NEON_DATABASE_URL=postgresql+asyncpg://user:password@ep-name.region.aws.neon.tech/neondb

# Frontend Origin for CORS
BETTER_AUTH_URL=http://localhost:3000

# Optional: Development Mode
DEBUG=true
```

**How to Get These Values**:

1. **BETTER_AUTH_SECRET**:
   - Copy from frontend `.env` file
   - Must match exactly for JWT validation to work

2. **NEON_DATABASE_URL**:
   - Log into Neon dashboard: https://console.neon.tech
   - Select your project
   - Go to "Connection Details"
   - Choose "asyncpg" from driver dropdown
   - Copy connection string
   - Example format: `postgresql+asyncpg://user:pass@host.region.aws.neon.tech/db`

3. **BETTER_AUTH_URL**:
   - Use `http://localhost:3000` for local frontend
   - Update to production URL when deploying

---

## 3. Start the Server

### Development Mode (with auto-reload)
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 4. Verify Installation

### Check Health Endpoint
```bash
curl http://localhost:8000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-06T15:30:00Z"
}
```

### View Interactive API Docs
Open browser: http://localhost:8000/docs

You should see Swagger UI with all endpoints documented.

---

## 5. Test with JWT Token

### Get JWT Token from Frontend
1. Start frontend application
2. Log in with test user
3. Open browser DevTools → Network tab
4. Find any API request
5. Copy `Authorization: Bearer <token>` value

### Test Task Creation
```bash
curl -X POST http://localhost:8000/api/user123/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "completed": false}'
```

**Expected Response (201)**:
```json
{
  "id": 1,
  "user_id": "user123",
  "title": "Test Task",
  "description": null,
  "completed": false,
  "created_at": "2026-01-06T15:35:00Z",
  "updated_at": "2026-01-06T15:35:00Z"
}
```

---

## 6. Common Issues & Solutions

### Issue: "Missing authorization token" (401)

**Cause**: No JWT token in request header

**Solution**:
```bash
# Add Authorization header with Bearer token
curl -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Issue: "Access forbidden: user_id mismatch" (403)

**Cause**: URL user_id doesn't match JWT user_id

**Solution**:
- Extract user_id from JWT token (decode at jwt.io)
- Use that user_id in URL path
- Example: JWT has `sub: "abc123"` → use `/api/abc123/tasks`

---

### Issue: "Invalid or malformed token" (401)

**Cause**: JWT signature verification failed

**Solution**:
- Verify BETTER_AUTH_SECRET matches frontend exactly
- Check token hasn't expired (decode at jwt.io)
- Ensure token is copied completely (no truncation)

---

### Issue: Database connection error (503)

**Cause**: Cannot connect to Neon PostgreSQL

**Solution**:
1. Check NEON_DATABASE_URL format:
   - Must start with `postgresql+asyncpg://`
   - Must include valid credentials
2. Verify Neon project is active (not paused)
3. Check network connectivity to Neon
4. Test connection with psql:
   ```bash
   psql "postgresql://user:pass@host.region.aws.neon.tech/db"
   ```

---

### Issue: CORS errors from frontend

**Cause**: Frontend origin not in CORS allowlist

**Solution**:
- Verify BETTER_AUTH_URL in .env matches frontend origin exactly
- Check browser console for actual frontend URL
- Ensure no trailing slash: `http://localhost:3000` (not `http://localhost:3000/`)

---

### Issue: "ensure this value has at most 200 characters" (422)

**Cause**: Task title exceeds 200 character limit

**Solution**:
- Shorten title to 200 characters or less
- Move excess content to description field

---

## 7. Development Workflow

### Make Code Changes
1. Edit files in `/backend`
2. Save file
3. Uvicorn auto-reloads (if using `--reload` flag)
4. Test changes immediately

### View Logs
```bash
# Logs appear in terminal where uvicorn is running
# Look for INFO, WARNING, ERROR messages
```

### Check Database State
```bash
# Connect to Neon database
psql "YOUR_NEON_DATABASE_URL"

# View tasks table
SELECT * FROM task;

# Check table structure
\d task
```

---

## 8. Integration with Frontend

### Update Frontend API URL
In frontend `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Test Full Flow
1. Start backend: `uvicorn main:app --reload`
2. Start frontend: `npm run dev`
3. Open frontend: http://localhost:3000
4. Log in with test user
5. Create a task in UI
6. Verify task appears in list
7. Toggle task completion
8. Delete task

---

## 9. Testing Checklist

- [ ] Backend starts without errors
- [ ] Health endpoint returns 200
- [ ] Swagger UI loads at /docs
- [ ] Can create task with valid JWT
- [ ] Can list tasks for authenticated user
- [ ] Can update task title
- [ ] Can toggle task completion
- [ ] Can delete task
- [ ] 401 returned for missing JWT
- [ ] 403 returned for user_id mismatch
- [ ] 422 returned for invalid input
- [ ] Frontend can connect without CORS errors

---

## 10. Next Steps

**After Quickstart**:
1. Read `data-model.md` to understand database schema
2. Read `contracts/openapi.yaml` for complete API spec
3. Read `research.md` for technical decisions and rationale
4. Implement features according to `tasks.md` (generated by `/sp.tasks`)
5. Run tests: `pytest backend/tests`

**Production Deployment**:
1. Set DEBUG=false in .env
2. Use production Neon database URL
3. Update BETTER_AUTH_URL to production frontend domain
4. Run with multiple workers: `--workers 4`
5. Use process manager (systemd, Docker, etc.)
6. Set up reverse proxy (Nginx, Traefik, etc.)
7. Enable HTTPS with SSL certificate

---

## Useful Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run in development
uvicorn main:app --reload

# Run in production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Run tests
pytest backend/tests -v

# Check code style
black backend/ --check
mypy backend/ --ignore-missing-imports

# View API documentation
# Browser: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc

# Connect to database
psql "$NEON_DATABASE_URL"

# Decode JWT token (online)
# Visit: https://jwt.io
# Paste token to view claims
```

---

## Support Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLModel Docs**: https://sqlmodel.tiangolo.com
- **Neon Docs**: https://neon.tech/docs
- **PyJWT Docs**: https://pyjwt.readthedocs.io
- **OpenAPI Spec**: `contracts/openapi.yaml`
- **Technical Research**: `research.md`
- **Data Model**: `data-model.md`

---

**You're ready to start implementing!** 🚀

Proceed to `/sp.tasks` to generate implementation tasks, then begin coding with Claude Code.
