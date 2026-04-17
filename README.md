# RepoMetrics

AI-powered GitHub repository analysis platform.

RepoMetrics combines deterministic engineering metrics with AI interpretation to score repository health and explain where quality improves or degrades.

## Why RepoMetrics

Choosing a repository is usually manual and subjective. RepoMetrics gives you:

- A consistent scoring framework across key categories.
- AI-assisted context on strengths, weaknesses, and practical actions.
- Visual explanations (charts, risk, historical trend).
- Exportable report output for sharing.

## Key Features

- Hybrid scoring engine (rule-based + AI blend).
- Category scores for:
  - Activity
  - Collaboration
  - Documentation
  - Stability
  - Popularity
- Historical analysis with trend graph and projected score.
- Improvement Guide with impact tiers and actionable suggestions.
- GitHub OAuth login and repository listing.
- Analyze owned repositories and public repositories.
- PDF export for analysis reports.

## Architecture

- Backend: FastAPI + SQLAlchemy + PostgreSQL + Gemini
- Frontend: React + TypeScript + Vite + Tailwind + Recharts

High-level flow:

1. User authenticates via GitHub OAuth.
2. Frontend calls backend APIs with JWT.
3. Backend fetches GitHub repository signals.
4. Feature extraction and rule scoring run.
5. AI analysis is generated and validated.
6. Hybrid scoring combines rule and AI signals.
7. Frontend renders insights and visualizations.

## Repository Structure

RepoMetrics/

- backend/
  - FastAPI service, scoring pipeline, auth, data layer
- frontend/
  - React dashboard, charts, insight cards, PDF export
- README.md

## Quick Start

### 1) Clone and open

1. git clone https://github.com/Drasec-Goner/RepoMetrics.git
2. cd RepoMetrics

### 2) Backend setup

1. cd backend
2. python -m venv .venv
3. .venv\Scripts\activate
4. pip install -r requirements.txt
5. Create .env using Backend Environment section below
6. python run.py

Backend URLs:

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

### 3) Frontend setup

1. cd ../frontend
2. npm install
3. Create .env with VITE_API_BASE_URL=http://localhost:8000/api
4. npm run dev

Frontend URL:

- http://localhost:5173

## Backend Environment

Create backend/.env:

```dotenv
# App Configuration
APP_NAME=RepoMetrics
ENVIRONMENT=development
DEBUG=False
PORT=8000
FRONTEND_URL=http://localhost:5173

# GitHub API
GITHUB_API_BASE=https://api.github.com
GITHUB_TOKEN=

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/callback

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/repometrics

# Security
SECRET_KEY=replace_with_a_long_random_secret
```

Security note:
- Never commit real credentials/tokens to git.
- If any key/token was exposed, rotate it immediately.

## Frontend Environment

Create frontend/.env:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

## API Endpoints (Main)

- GET /api/health
- GET /auth/login
- GET /auth/callback
- GET /api/user/repos
- GET /api/analyze/{owner}/{repo}

## Understanding the Output

- Rule Score:
  - Derived from measurable repository signals (commits, issues, docs, popularity, etc.).

- AI Score:
  - Contextual interpretation from repository features and documentation language.

- Final Score:
  - Weighted blend of rule + AI with confidence-aware balancing.

- Projected Score (Historical):
  - Momentum-oriented estimate combining current score and recent activity trend.
  - Useful for direction; not a guaranteed future score.

## Troubleshooting

- Backend does not start:
  - Check DATABASE_URL and that PostgreSQL is running.

- Login callback fails:
  - Ensure GITHUB_REDIRECT_URI in .env matches your GitHub OAuth app callback exactly.

- CORS/auth problems:
  - Verify FRONTEND_URL matches your actual frontend origin.

- Frontend cannot reach backend:
  - Check VITE_API_BASE_URL value and backend availability.

## Documentation Index

- Backend setup and internals: backend/README.md
- Frontend setup and UI flow: frontend/README.md

## Contributing

1. Create a branch.
2. Make focused changes.
3. Run backend and frontend locally.
4. Open a pull request with a clear summary.

## License

MIT
