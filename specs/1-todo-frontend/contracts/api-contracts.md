# API Contracts: Next.js Todo Frontend

## Authentication Endpoints

### POST /api/auth/register
**Description**: Register a new user account
**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token-string"
  },
  "status": 201
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "User already exists",
  "status": 409
}
```

### POST /api/auth/login
**Description**: Authenticate user and return JWT token
**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token-string"
  },
  "status": 200
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Invalid credentials",
  "status": 401
}
```

### POST /api/auth/logout
**Description**: Logout user and invalidate session
**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": { "message": "Successfully logged out" },
  "status": 200
}
```

## Task Endpoints

### GET /api/tasks
**Description**: Get all tasks for the authenticated user
**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-uuid",
        "userId": "user-uuid",
        "title": "Sample Task",
        "description": "Task description",
        "completed": false,
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z"
      }
    ]
  },
  "status": 200
}
```

### POST /api/tasks
**Description**: Create a new task for the authenticated user
**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request**:
```json
{
  "title": "New Task",
  "description": "Task description",
  "completed": false
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "userId": "user-uuid",
    "title": "New Task",
    "description": "Task description",
    "completed": false,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  },
  "status": 201
}
```

### PUT /api/tasks/{id}
**Description**: Update an existing task
**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request**:
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "completed": true
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "userId": "user-uuid",
    "title": "Updated Task Title",
    "description": "Updated description",
    "completed": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-02T00:00:00Z"
  },
  "status": 200
}
```

### PATCH /api/tasks/{id}/toggle
**Description**: Toggle task completion status
**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "completed": true
  },
  "status": 200
}
```

### DELETE /api/tasks/{id}
**Description**: Delete a task
**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": { "message": "Task deleted successfully" },
  "status": 200
}
```

## Error Handling

### 401 Unauthorized
When JWT token is missing, invalid, or expired:
```json
{
  "success": false,
  "error": "Unauthorized",
  "status": 401
}
```

### 403 Forbidden
When user tries to access resources they don't own:
```json
{
  "success": false,
  "error": "Forbidden",
  "status": 403
}
```

### 404 Not Found
When requested resource doesn't exist:
```json
{
  "success": false,
  "error": "Resource not found",
  "status": 404
}
```

### 500 Internal Server Error
When an unexpected error occurs:
```json
{
  "success": false,
  "error": "Internal server error",
  "status": 500
}
```