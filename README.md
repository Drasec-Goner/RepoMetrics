# 🚀 RepoMetrics – AI-Powered GitHub Repository Analyzer

RepoMetrics is an intelligent GitHub repository analysis platform that combines **rule-based scoring** with **AI-powered insights** to evaluate the quality, health, and maintainability of any repository.

It provides **data-driven metrics + LLM-based analysis** to help developers, recruiters, and teams make informed decisions.

---

## 🌟 Features

### 📊 Hybrid Scoring System

* Rule-based + AI scoring combined
* Accurate and explainable evaluation
* Final grade + score breakdown

### 📈 Metrics Analyzed

#### 🔹 Activity Metrics

* Commits per month
* Recent activity score
* Maintenance frequency
* Commit consistency

#### 🔹 Collaboration Metrics

* Contributor distribution
* PR merge ratio
* Issue closure rate
* Contributor continuity

#### 🔹 Popularity Metrics

* Stars count
* Fork ratio
* Community engagement

#### 🔹 Documentation Metrics

* README length
* Key section detection
* Documentation completeness

#### 🔹 Stability Metrics

* Issue resolution
* Maintenance trends
* Risk indicators

---

## 🤖 AI Analysis (Gemini)

RepoMetrics uses AI to perform:

* Advanced keyword extraction
* Technology stack detection
* Framework identification
* Documentation quality analysis

### 🧠 AI Outputs

* Professional summary
* Strength analysis
* Weakness identification
* Actionable recommendations

---

## 📊 Visualizations

* 📉 Score Breakdown Charts
* 📡 Radar Graph (5 categories)
* 📊 Metric Contribution Graph
* 📈 Contribution Activity Graph
* ⚠️ Risk Meter
* 🧪 Technology Confidence Bars

---

## 🔐 Authentication

* GitHub OAuth Login
* Fetch user repositories
* Analyze private repos (with token)

---

## 🏗️ Tech Stack

### Backend

* FastAPI
* PostgreSQL
* SQLAlchemy
* GitHub REST API
* Google Gemini API

### Frontend

* React (TypeScript)
* Vite
* Recharts
* Tailwind CSS

---

## 📂 Project Structure

```
RepoMetrics/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── db/
│   │   └── core/
│   ├── run.py
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   └── README.md
│
└── repometrics_commits.py
```

---

## ⚙️ Environment Variables

### Backend `.env`

```
GEMINI_API_KEY=your_key
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/callback

APP_NAME=RepoMetrics
ENVIRONMENT=development
DEBUG=True

GITHUB_API_BASE=https://api.github.com
PORT=8000
```

---

## 🚀 Running Locally

### 1️⃣ Backend

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Backend runs on:

```
http://localhost:8000
```

---

### 2️⃣ Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔄 Workflow

1. Login via GitHub OAuth
2. Select repository (or manually enter)
3. Fetch repo data via GitHub API
4. Extract features
5. Compute rule-based scores
6. Generate AI insights
7. Combine into hybrid score
8. Display analytics dashboard

---

## 🧠 Scoring System

### Categories

* Activity Score
* Collaboration Score
* Documentation Score
* Stability Score
* Popularity Score

### Final Score

```
Final Score = Hybrid (Rule Score + AI Score)
```

---

## 📅 Development Timeline

This project was developed incrementally:

* **Mar 20–25** → Backend setup + GitHub API integration
* **Mar 26–30** → Feature extraction & scoring engine
* **Apr 1–5** → AI integration (Gemini)
* **Apr 6–10** → Frontend dashboard & charts
* **Apr 11–15** → OAuth, polishing, deployment

---

## 🚀 Deployment

### Backend

* Render / Railway

### Frontend

* Vercel / Netlify

---

## 🎯 Future Improvements

* Repository comparison feature
* Resume integration (for recruiters)
* GitHub organization analytics
* ML-based anomaly detection
* Team performance dashboards

---

## 🤝 Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests.

---

## 📜 License

MIT License

---

## 👨‍💻 Author

**Soumya Manna**
Computer Science Engineer
AI + Full Stack Developer

---

⭐ If you like this project, give it a star!

# docs: add README with project scope @ 2026-03-20T17:05:00
# feat: README length scoring @ 2026-03-29T13:46:00
# feat: category scores (activity, collaboration, docs) @ 2026-03-30T11:15:00# fix: integrate Gemini AI analysis at 2026-03-20 16:26:00
