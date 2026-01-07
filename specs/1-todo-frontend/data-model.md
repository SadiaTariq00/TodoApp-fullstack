# Data Model: Next.js Todo Frontend

## Entity: User
- **Fields**:
  - `id`: string - Unique identifier for the user
  - `email`: string - User's email address
  - `name`: string - User's name (optional)
  - `createdAt`: string - Account creation timestamp
  - `updatedAt`: string - Last update timestamp

- **Validation rules**:
  - Email must be valid email format
  - Email must be unique
  - Name (if provided) must be 1-50 characters

- **State transitions**: None (managed by backend)

## Entity: Task
- **Fields**:
  - `id`: string - Unique identifier for the task
  - `userId`: string - Foreign key to User
  - `title`: string - Task title
  - `description`: string - Task description (optional)
  - `completed`: boolean - Task completion status
  - `createdAt`: string - Task creation timestamp
  - `updatedAt`: string - Last update timestamp

- **Validation rules**:
  - Title must be 1-200 characters
  - Description (if provided) must be 0-1000 characters
  - Completed must be boolean
  - userId must reference existing user

- **State transitions**:
  - `pending` → `completed` (when task is marked as done)
  - `completed` → `pending` (when task is marked as undone)

## Entity: JWT Token
- **Fields**:
  - `token`: string - The JWT token string
  - `expiresAt`: number - Unix timestamp of expiration
  - `userId`: string - Associated user ID from token payload

- **Validation rules**:
  - Token must be properly formatted JWT
  - Token must not be expired
  - Token must have valid signature

- **State transitions**: None (treated as immutable, refresh when expired)

## Entity: API Response
- **Fields**:
  - `success`: boolean - Whether the request was successful
  - `data`: any - The response data (varies by endpoint)
  - `error`: string | null - Error message if request failed
  - `status`: number - HTTP status code

- **Validation rules**:
  - Success must be boolean
  - Data format depends on endpoint
  - Error must be string or null
  - Status must be valid HTTP status code

## Relationships
- User (1) → Task (Many): One user can have many tasks
- User (1) → JWT Token (1): One user has one active JWT token

## Frontend State Model
- `authState`: {
    - `user`: User | null,
    - `token`: JWT Token | null,
    - `isLoading`: boolean,
    - `error`: string | null
  }
- `tasksState`: {
    - `tasks`: Task[],
    - `isLoading`: boolean,
    - `error`: string | null,
    - `currentFilter`: 'all' | 'active' | 'completed'
  }