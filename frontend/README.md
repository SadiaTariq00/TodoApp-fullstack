
# Todo Frontend

A beautiful and responsive todo application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- User authentication (sign up and sign in)
- Task management (create, read, update, delete)
- Task completion toggle
- Responsive design for desktop, tablet, and mobile
- Beautiful UI with consistent design system
- JWT-based authentication

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- React Hook Form
- Axios for API calls
- Better Auth (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root of the `frontend` directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-here
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: The base URL for the backend API
- `NEXT_PUBLIC_JWT_SECRET`: The secret used for JWT verification (for frontend validation)

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run the linter

## Project Structure

```
frontend/
├── app/                 # Next.js App Router pages
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── tasks/          # Tasks page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable React components
├── lib/               # Shared utilities and API client
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── public/            # Static assets
```

## API Integration

The frontend communicates with the backend API through the centralized API client in `lib/api.ts`. All authenticated requests automatically include the JWT token in the Authorization header.

## Authentication Flow

1. User registers or logs in via the auth forms
2. JWT token is stored in localStorage
3. Token is included in all authenticated API requests
4. Token is validated on each request
5. User is automatically logged out if token expires or is invalid

## GitHub Pages Deployment

To deploy this frontend application to GitHub Pages, follow these steps:

### 1. Prepare for Static Export

The application is configured for static export with these settings in `next.config.js`:
- `output: 'export'` - Enables static site generation
- `trailingSlash: true` - Adds trailing slashes to all routes for GitHub Pages compatibility

### 2. Update Environment Variables

Before deployment, you'll need to update the API base URL to point to your backend server:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com/api
```

### 3. Build the Static Site

Run the export script to build the static site:

```bash
npm run export
```

This will create an `out` directory with all the static files.

### 4. Deploy to GitHub Pages

1. Create a GitHub repository (if you haven't already)
2. Push your code to the repository
3. Go to your repository settings on GitHub
4. In the "Pages" section, select source as "GitHub Actions"
5. Create the following GitHub Actions workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install
        working-directory: frontend

      - name: Build static site
        run: npm run export
        working-directory: frontend

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/out
          publish_branch: gh-pages
```

### 5. Configure GitHub Pages

After pushing the workflow file:
1. Go to your repository's "Settings" tab
2. Click on "Pages" in the left sidebar
3. Select "Deploy from a branch"
4. Choose "gh-pages" as the branch and "/ (root)" as the folder
5. Click "Save"

Your site will be available at `https://yourusername.github.io/repository-name`

### Important Notes

- The backend must be deployed separately and accessible via a public URL
- Update the `NEXT_PUBLIC_API_BASE_URL` environment variable to point to your deployed backend
- GitHub Pages serves content from the root of your repository, so you may need to adjust API calls accordingly