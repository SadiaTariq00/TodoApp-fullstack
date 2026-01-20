# FastAPI Backend with JWT Auth and Neon PostgreSQL

Secure REST API backend for the Todo application with JWT authentication and per-user data isolation.

## Quick Start

For detailed setup instructions, see [quickstart.md](../specs/002-fastapi-backend/quickstart.md).

### Prerequisites

- Python 3.11 or higher
- pip package manager
- Neon PostgreSQL database
- Better Auth JWT secret from frontend

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your actual values
```

### Configuration

Required environment variables in `.env`:

```env
BETTER_AUTH_SECRET=your_jwt_secret_from_frontend
NEON_DATABASE_URL=postgresql+asyncpg://user:pass@host.region.aws.neon.tech/db
BETTER_AUTH_URL=http://localhost:3000
DEBUG=true
```

### Run Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server starts at: `http://localhost:8000`

### API Documentation

Interactive API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Verify Installation

```bash
# Check health endpoint
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-06T15:30:00Z"
}
```

## Architecture

### Tech Stack

- **Framework**: FastAPI 0.109+
- **ORM**: SQLModel 0.0.14
- **Database**: Neon Serverless PostgreSQL
- **Driver**: asyncpg 0.29.0
- **Auth**: PyJWT 2.8.0 (HS256)
- **Server**: Uvicorn (ASGI)

### Project Structure

```
backend/
├── main.py              # FastAPI app initialization
├── db.py                # Database engine and sessions
├── models.py            # SQLModel data models
├── dependencies.py      # FastAPI dependencies
├── auth/
│   └── jwt.py           # JWT validation logic
├── routes/
│   └── tasks.py         # Task CRUD endpoints
├── tests/               # pytest tests
├── .env                 # Environment config (gitignored)
├── .env.example         # Example configuration
├── requirements.txt     # Python dependencies
├── CLAUDE.md            # Claude Code rules
└── README.md            # This file
```

### API Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/health` | Health check | No |
| POST | `/api/{user_id}/tasks` | Create task | Required |
| GET | `/api/{user_id}/tasks` | List tasks | Required |
| GET | `/api/{user_id}/tasks/{id}` | Get task | Required |
| PUT | `/api/{user_id}/tasks/{id}` | Update task | Required |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion | Required |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task | Required |

## Security

### JWT Authentication

All `/api` endpoints require Bearer token:

```http
Authorization: Bearer <jwt_token>
```

Token validation:
- Signature verified with `BETTER_AUTH_SECRET`
- Expiration checked automatically
- User ID extracted from `sub` claim
- URL `user_id` must match JWT `user_id`

### Data Isolation

- Every query filtered by authenticated user's ID
- Cross-user access returns 403 Forbidden
- No shared or public tasks - strict per-user scoping

### Error Handling

- 401: Missing/invalid/expired JWT
- 403: Valid JWT but accessing different user's resources
- 404: Resource doesn't exist
- 422: Validation error (field constraints)
- 503: Database connection failure

## Testing

```bash
# Run tests (when implemented)
pytest backend/tests -v

# Run with coverage
pytest backend/tests --cov=backend --cov-report=html
```

## Development

### Making Changes

1. Edit source files in `backend/`
2. Save - uvicorn auto-reloads (with `--reload` flag)
3. Test changes via Swagger UI or curl
4. Check logs in terminal

### Adding New Endpoints

1. Define route in `backend/routes/tasks.py`
2. Use `Depends(get_current_user)` for auth
3. Use `Depends(get_session)` for database
4. Validate `user_id` matches JWT
5. Scope queries by `user_id`
6. Handle errors appropriately

### Database Changes

Database schema auto-created on startup via SQLModel. For migrations:

```python
# In main.py startup event
async with engine.begin() as conn:
    await conn.run_sync(SQLModel.metadata.create_all)
```

## Troubleshooting

### Common Issues

**"Missing authorization token" (401)**
- Add `Authorization: Bearer <token>` header
- Get token from frontend after login

**"Access forbidden: user_id mismatch" (403)**
- URL `user_id` must match JWT `user_id` claim
- Extract `user_id` from token at jwt.io

**"Invalid or malformed token" (401)**
- Verify `BETTER_AUTH_SECRET` matches frontend
- Check token hasn't expired
- Ensure complete token copied

**Database connection error (503)**
- Check `NEON_DATABASE_URL` format
- Verify Neon project is active
- Test connection with `psql`

**CORS errors from frontend**
- Verify `BETTER_AUTH_URL` matches frontend origin
- Check no trailing slash in URL

## Future Enhancements

### Rate Limiting (Deferred)

The initial implementation does not include rate limiting. This can be added in future iterations if abuse occurs. Consider using:

- **SlowAPI**: FastAPI integration for rate limiting
- **Redis**: For distributed rate limiting across multiple servers
- **Strategy**: Per-user limits (e.g., 100 requests/minute per authenticated user)

Implementation deferred per research.md section 13.

### Pagination (Deferred)

The initial implementation returns all tasks for a user without pagination. This is acceptable for the expected task counts (< 1000 per user). If pagination becomes necessary:

- Add query parameters: `?limit=50&offset=0`
- Return pagination metadata: `{ "tasks": [...], "total": 500, "limit": 50, "offset": 0 }`
- Consider cursor-based pagination for better performance

Implementation deferred per spec.md assumptions.

## Production Deployment

### Environment Configuration

```env
DEBUG=false
BETTER_AUTH_SECRET=<production_secret>
NEON_DATABASE_URL=<production_database>
BETTER_AUTH_URL=https://yourdomain.com
```

### Run Command

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Recommendations

- Use reverse proxy (Nginx, Traefik)
- Enable HTTPS with SSL certificate
- Use process manager (systemd, Docker, PM2)
- Configure log aggregation
- Set up monitoring and alerts
- Use production-grade database connection pooling

## Documentation

- **Specification**: `../specs/002-fastapi-backend/spec.md`
- **Architecture Plan**: `../specs/002-fastapi-backend/plan.md`
- **Data Model**: `../specs/002-fastapi-backend/data-model.md`
- **API Contracts**: `../specs/002-fastapi-backend/contracts/openapi.yaml`
- **Quick Start Guide**: `../specs/002-fastapi-backend/quickstart.md`
- **Implementation Tasks**: `../specs/002-fastapi-backend/tasks.md`

## Support

For issues or questions:
- Check [quickstart.md](../specs/002-fastapi-backend/quickstart.md) troubleshooting section
- Review [CLAUDE.md](./CLAUDE.md) for development guidelines
- Consult API contracts in `contracts/openapi.yaml`

## License

Part of Hackathon II - Todo Full-Stack Web Application project.
