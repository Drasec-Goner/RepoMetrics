# RepoMetrics Frontend

React + TypeScript + Vite dashboard for visualizing repository health, scores, risk, and recommendations.

## What This App Does

- Provides GitHub login flow entry.
- Lets users analyze owned or public repositories.
- Renders hybrid score outputs (rule + AI).
- Displays insights, charts, historical trend graph, risk, and improvement guidance.
- Supports PDF export for report sharing.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Axios
- jsPDF + html2canvas

## Prerequisites

- Node.js 20+
- Backend running locally (or deployed API endpoint)

## Environment Variables

Create frontend .env with:

```dotenv
VITE_API_BASE_URL=your_backend_api_base_url
VITE_BACKEND_URL=your_backend_base_url
```

Notes:

- Set these to your backend deployment URL (or localhost during local development).
- VITE_BACKEND_URL is useful for backend-origin links and callback URL helpers.
- Keep trailing slash optional; app normalizes it.
- URL format examples:
  - VITE_API_BASE_URL:
    - Local: http://localhost:8000/api
    - Deployed: https://your-backend-domain.com/api
  - VITE_BACKEND_URL:
    - Local: http://localhost:8000
    - Deployed: https://your-backend-domain.com
  - Login redirect URL used by the button:
    - {VITE_BACKEND_URL}/api/auth/login
  - OAuth callback URL configured in GitHub app:
    - {backend-domain}/auth/callback

## Installation

From repository root:

1. cd frontend
2. npm install

## Run Frontend

From frontend folder:

1. npm run dev

Default app URL:

- http://localhost:5173

## Build and Preview

- npm run build
- npm run preview

## Main User Journey

1. Open landing page.
2. Login with GitHub.
3. Select My repos or enter a public owner/repo.
4. Click Analyze Repo.
5. Explore score cards, risk, charts, and insights.
6. Export analysis as PDF if needed.

## Project Structure

- src/pages/
  - Landing, Auth callback, Dashboard.

- src/components/
  - Dashboard widgets, charts, report export sheet, and UI primitives.

- src/api/
  - Axios client and API calls.

- src/types/
  - Shared response/type definitions.

## Troubleshooting

- App loads but API fails:
  - Confirm backend is running and VITE_API_BASE_URL is correct.

- OAuth callback shows error:
  - Verify backend FRONTEND_URL and GitHub OAuth callback configuration.

- PDF export appears empty or cut:
  - Wait until full analysis renders before exporting.

- Build warnings about large chunks:
  - Current warning is non-blocking for development.
  - Optional future optimization: route-level code splitting.
