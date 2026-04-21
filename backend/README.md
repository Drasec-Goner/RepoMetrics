# RepoMetrics Backend

FastAPI backend for repository analysis, OAuth authentication, feature extraction, hybrid scoring, and AI insights.

## What This Service Does

- Handles GitHub OAuth login and callback.
- Fetches repository data from GitHub APIs.
- Extracts repository features (activity, documentation, stability, popularity, collaboration).
- Computes rule-based scores and combines them with AI outputs.
- Returns analysis payloads used by the frontend dashboard.

## Tech Stack

- FastAPI
- SQLAlchemy
- PostgreSQL
- Uvicorn
- Google Gemini API

## Prerequisites

- Python 3.11+ (3.13 also works)
- PostgreSQL database
- GitHub OAuth app credentials
- Gemini API key

## Environment Variables

Create a backend .env file with the following values:

```dotenv
# App Configuration
APP_NAME=RepoMetrics
ENVIRONMENT=development
DEBUG=False
PORT=8000
FRONTEND_URL=http://localhost:5173
FRONTEND_URLS=https://your-frontend-domain.com,http://localhost:5173

# GitHub API
GITHUB_API_BASE=https://api.github.com
GITHUB_TOKEN=

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=your_backend_auth_callback_url

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/repometrics

# Security
SECRET_KEY=replace_with_a_long_random_secret
```

Notes:

- DATABASE_URL is required. App startup will fail without it.
- FRONTEND_URL must match your frontend dev server URL for CORS and auth redirect.
- FRONTEND_URLS is optional and allows multiple CORS origins (comma-separated).
- FRONTEND_URL examples:
  - Local: http://localhost:5173
  - Deployed: https://your-frontend-domain.com
- GITHUB_REDIRECT_URI format:
  - Local: http://localhost:8000/auth/callback
  - Deployed: https://your-backend-domain.com/auth/callback
- GITHUB_TOKEN is optional:
  - Used as a fallback token for anonymous `/api/analyze/{owner}/{repo}` requests.
  - Helps avoid GitHub API rate-limit failures for public users who are not logged in.
  - Logged-in users still use their own OAuth access token first.
- SECRET_KEY is required for JWT token generation.
- Never commit real secrets in .env files.

## Installation

From repository root:

1. cd backend
2. python -m venv .venv
3. .venv\Scripts\activate
4. pip install -r requirements.txt

## Run Backend

From backend folder:

1. python run.py

The API starts at:

- http://localhost:8000

Swagger docs:

- http://localhost:8000/docs

## Core API Endpoints

- GET /api/health
  - Health check.

- GET /auth/login
  - Redirects to GitHub OAuth authorization.

- GET /auth/callback
  - Exchanges code for token, creates user/session JWT, redirects to frontend callback page.

- GET /api/user/repos
  - Returns repositories for the authenticated user.

- GET /api/analyze/{owner}/{repo}
  - Runs feature extraction, scoring, AI analysis, and returns final payload.

## Authentication Flow

1. Frontend opens /auth/login.
2. User authorizes through GitHub.
3. Backend receives code at /auth/callback.
4. Backend creates internal JWT and redirects to frontend callback route.
5. Frontend stores JWT and sends it as Authorization header for protected API calls.

## Typical Development Workflow

1. Start PostgreSQL.
2. Start backend.
3. Start frontend.
4. Sign in with GitHub.
5. Analyze repositories from dashboard.

## Troubleshooting

- 500 error on startup:
  - Check DATABASE_URL and database availability.

- OAuth redirect issues:
  - Ensure GITHUB_REDIRECT_URI and GitHub OAuth app callback URL are exactly the same.
  - Ensure FRONTEND_URL is correct.

- Gemini errors:
  - Verify GEMINI_API_KEY and quota.

- CORS errors:
  - FRONTEND_URL must match the exact origin running your frontend.

## Folder Highlights

- app/main.py
  - FastAPI app, CORS setup, and router registration.

- app/api/routes/auth.py
  - OAuth login/callback endpoints.

- app/api/routes/analyze.py
  - Main analysis pipeline endpoint.

- app/services/
  - Feature extraction, scoring, AI service, and hybrid blending.

- app/db/
  - SQLAlchemy engine/session/models.
