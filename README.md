<div align="center">

# RepoMetrics

<img src="frontend/src/assets/icon.png" alt="RepoMetrics logo" width="170" />

[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](#-tech-stack)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=0b1020)](#-tech-stack)
[![Language](https://img.shields.io/badge/Language-TypeScript%20%26%20Python-3b82f6)](#-tech-stack)
[![License](https://img.shields.io/badge/License-MIT-22c55e)](#-license)

AI-powered GitHub repository analysis platform for quick, explainable quality evaluation.

</div>

> RepoMetrics helps answer: Is this repository active, stable, well documented, and safe to adopt?

---

## Table of Contents

- [Highlights](#-highlights)
- [Screenshots](#-screenshots)
- [How It Works](#-how-it-works)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [API Surface](#-api-surface)
- [Project Docs](#-project-docs)
- [Security Note](#-security-note)
- [License](#-license)

## Highlights

- Hybrid scoring: rule-based signals + AI interpretation
- Category coverage: Activity, Collaboration, Documentation, Stability, Popularity
- Historical trend analysis with momentum-aware projected score
- Risk level and top risk drivers
- Improvement guide with prioritized actions
- PDF export for sharing analysis reports

## Screenshots

<table>
  <tr>
    <td width="70%">
      <img src="frontend/src/assets/hero.png" alt="RepoMetrics dashboard preview" />
    </td>
    <td width="30%" align="center">
      <img src="frontend/src/assets/icon.png" alt="RepoMetrics icon" width="140" />
      <br />
      <sub>App icon</sub>
    </td>
  </tr>
</table>

<details>
  <summary><strong>Want to add more screenshots?</strong></summary>

Add images under `frontend/src/assets` or a top-level `docs/` folder, then link them in this section.

</details>

## How It Works

```mermaid
flowchart LR
  A[GitHub OAuth Login] --> B[Fetch Repo Signals]
  B --> C[Feature Extraction]
  C --> D[Rule Scoring]
  C --> E[AI Analysis]
  D --> F[Hybrid Blend]
  E --> F
  F --> G[Dashboard + PDF Report]
```

### Score Interpretation

- Rule score: measurable engineering signals (issues, commits, docs, popularity)
- AI score: contextual interpretation of quality and maintainability
- Final score: confidence-aware blend of rule + AI
- Projected score: direction-focused estimate based on current score + recent activity trend

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

Backend URLs:

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

### 3) Run Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend URL:

- http://localhost:5173

## Environment Setup

### backend/.env

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

### frontend/.env

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

## API Surface

- GET `/api/health`
- GET `/auth/login`
- GET `/auth/callback`
- GET `/api/user/repos`
- GET `/api/analyze/{owner}/{repo}`

## Project Docs

| Area                        | Guide                                    |
| --------------------------- | ---------------------------------------- |
| Backend setup and internals | [backend/README.md](backend/README.md)   |
| Frontend setup and UI flow  | [frontend/README.md](frontend/README.md) |

## Security Note

Do not commit real secrets or tokens.
If any token, OAuth secret, API key, or DB credential is exposed, rotate it immediately.

## License

MIT
