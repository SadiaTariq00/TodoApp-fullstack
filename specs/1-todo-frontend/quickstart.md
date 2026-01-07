# Quickstart: Next.js Todo Frontend

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Access to the backend API server

## Setup Instructions

### 1. Clone and Initialize
```bash
# If you have a repository:
git clone <repository-url>
cd frontend

# Or create a new Next.js project:
npx create-next-app@latest frontend --typescript --tailwind --eslint
cd frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Install Additional Dependencies
```bash
# For authentication
npm install better-auth react-hook-form zod @hookform/resolvers

# For HTTP requests
npm install axios

# For state management (if needed)
npm install @tanstack/react-query

# For development
npm install -D typescript @types/react @types/node
```

### 4. Environment Configuration
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret
```

### 5. Project Structure
After setup, your project should look like:
```
frontend/
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── tasks/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── api.ts
│   └── auth.ts
├── styles/
│   └── globals.css
├── types/
│   └── index.ts
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

### 6. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Your application will be available at `http://localhost:3000`

### 7. API Integration
The frontend will connect to the backend API at the URL specified in `NEXT_PUBLIC_API_BASE_URL`. Ensure your backend server is running before testing frontend functionality.

### 8. Authentication Flow
1. Users can access `/register` to create an account
2. Users can access `/login` to authenticate
3. Once authenticated, users can access `/tasks` to manage their tasks
4. All API requests will automatically include the JWT token in the Authorization header

### 9. Development Commands
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests (when implemented)
npm test
```