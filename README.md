# RepoMetrics

RepoMetrics is an AI-powered GitHub repository analyzer that turns repo signals into clear quality insights.

It helps you answer: Is this repo active, stable, documented, and trustworthy?

## What You Get

- Hybrid scoring: rule-based metrics + AI interpretation
- 5 category scores: Activity, Collaboration, Documentation, Stability, Popularity
- Historical trend view with momentum-aware projected score
- Risk level and top risk drivers
- Improvement guide with prioritized actions
- PDF report export

## Why It Is Useful

When evaluating repositories, stars alone are not enough.
RepoMetrics combines engineering signals and contextual analysis so you can quickly judge repository health and maturity.

## Quick Demo Flow

1. Sign in with GitHub
2. Select one of your repositories (or enter a public owner/repo)
3. Run analysis
4. Review scores, risk, trend, and recommendations
5. Export PDF if needed

## Tech Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL, Gemini API
- Frontend: React, TypeScript, Vite, Tailwind, Recharts

## Quick Start

### 1) Clone

```bash
git clone https://github.com/Drasec-Goner/RepoMetrics.git
cd RepoMetrics
```

### 2) Run Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Backend:
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

### 3) Run Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend:
- http://localhost:5173

## Environment Setup

### backend/.env

```dotenv
APP_NAME=RepoMetrics
ENVIRONMENT=development
DEBUG=False
PORT=8000
FRONTEND_URL=http://localhost:5173

GITHUB_API_BASE=https://api.github.com
GITHUB_TOKEN=

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/callback

GEMINI_API_KEY=your_gemini_api_key

DATABASE_URL=postgresql://postgres:password@localhost:5432/repometrics
SECRET_KEY=replace_with_a_long_random_secret
```

### frontend/.env

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

## Main API Endpoints

- GET /api/health
- GET /auth/login
- GET /auth/callback
- GET /api/user/repos
- GET /api/analyze/{owner}/{repo}

## Documentation

- Backend details: [backend/README.md](backend/README.md)
- Frontend details: [frontend/README.md](frontend/README.md)

## Security Note

Do not commit real secrets or tokens.
If any token or key is exposed, rotate it immediately.

## License

MIT
