# Phase 2 Todo Full-Stack Application

A modern, full-featured todo application built with a Next.js frontend and FastAPI backend, featuring secure authentication, real-time task management, and PostgreSQL database integration.

## 🚀 Features

- **Multi-user Support**: Each user has their own private task space
- **Full CRUD Operations**: Create, Read, Update, and Delete tasks
- **JWT Authentication**: Secure login and registration system
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live task management experience
- **Data Isolation**: Tasks are securely isolated between users
- **Filtering**: View all, active, or completed tasks
- **Modern Tech Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS |
- **Database**: Neon Serverless PostgreSQL |
- **Authentication**: JWT Tokens with Custom Implementation |
- **Styling**: Tailwind CSS |
- **Package Manager**: npm |

## 📁 Project Structure

```
Phase 2 Todo Full-Stack/
├── backend/
│   ├── auth/              # JWT validation and user extraction
│   ├── routes/            # API endpoints (auth, tasks)
│   ├── models.py          # SQLModel data models
│   ├── main.py            # FastAPI app entry point
│   ├── db.py              # Database configuration
│   ├── dependencies.py    # FastAPI dependencies
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── app/               # Next.js pages and layouts
│   ├── components/        # Reusable UI components
│   ├── lib/               # API and auth utility functions
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # Global styles
│   └── package.json       # Node.js dependencies
├── specs/                 # Project specifications
├── history/               # Prompt history records
├── .specify/              # SpecKit Plus templates
└── README.md              # This file
```

## 🏗️ Backend Architecture

### API Endpoints

#### Authentication (`/api/auth/`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /verify` - Token verification
- `POST /logout` - User logout

#### Tasks (`/api/{user_id}/tasks/`)
- `POST /` - Create a new task
- `GET /` - Get all user's tasks
- `GET /{task_id}` - Get a specific task
- `PUT /{task_id}` - Update a task
- `PATCH /{task_id}/complete` - Toggle task completion
- `DELETE /{task_id}` - Delete a task

### Database Models

#### User Model
- id (UUID)
- email (unique, validated)
- username (unique, validated)
- password_hash (encrypted with bcrypt)
- created_at, updated_at timestamps

#### Task Model
- id (UUID)
- user_id (foreign key to User)
- title (validated)
- description (optional)
- completed (boolean)
- created_at, updated_at timestamps

## 🎨 Frontend Features

### Pages
- **Home Page**: Welcome screen with app overview
- **Login/Register**: Secure authentication flow
- **Dashboard**: User profile and task statistics
- **Tasks Page**: Main task management interface with filtering options

### Components
- **AuthForm**: Unified login/register form with validation
- **TaskCard**: Individual task display with edit/delete functionality
- **TaskForm**: Task creation and editing form
- **Navbar**: Navigation with authentication-aware links
- **ProtectedRoute**: Authentication wrapper for protected pages

### API Integration
- Comprehensive API client with JWT token handling
- Automatic token refresh and validation
- Error handling and loading states
- Type-safe API calls with TypeScript

## 🔐 Security Features

- **JWT Token Authentication**: Secure, stateless authentication
- **Password Hashing**: bcrypt for secure password storage
- **User Data Isolation**: Tasks are accessible only by their owner
- **Input Validation**: Both frontend and backend validation
- **SQL Injection Prevention**: SQLModel ORM with parameterized queries
- **CORS Configuration**: Proper cross-origin resource sharing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- PostgreSQL (or Neon Serverless account)
- npm/yarn

### Installation

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_JWT_SECRET=your-super-secret-jwt-key-here
```

### Running the Application

#### Start Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

#### Start Frontend
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Database Schema

The application uses PostgreSQL with the following tables:

**users** table:
- id (UUID, Primary Key)
- email (VARCHAR, Unique, Not Null)
- username (VARCHAR, Unique, Not Null)
- password_hash (VARCHAR, Not Null)
- created_at (TIMESTAMP, Not Null)
- updated_at (TIMESTAMP, Not Null)

**tasks** table:
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to users.id)
- title (VARCHAR, Not Null)
- description (TEXT)
- completed (BOOLEAN, Default: False)
- created_at (TIMESTAMP, Not Null)
- updated_at (TIMESTAMP, Not Null)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

Developed as part of the Phase 2 Todo Full-Stack Hackathon project.

## 🐛 Bug Reports & Feature Requests

Please use the GitHub Issues section to report bugs or request features.

## 🔄 Changelog

### v1.0.0
- Initial release of full-stack todo application
- Implemented user authentication with JWT
- Added task CRUD operations
- Created responsive UI with Next.js
- Integrated PostgreSQL database

<!-- Triggering Vercel deployment -->