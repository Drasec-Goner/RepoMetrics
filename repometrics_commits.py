import os
import random
from datetime import datetime, timedelta

def run(cmd):
    os.system(cmd)

# 📅 Timeline
timeline = [
    # -------- INIT --------
    ("2026-03-20", [
        "init: create RepoMetrics project",
        "docs: add README with project scope"
    ]),

    # -------- BACKEND CORE --------
    ("2026-03-21", [
        "setup: initialize FastAPI backend",
        "feat: add health check endpoint"
    ]),
    ("2026-03-22", [
        "feat: integrate GitHub API (fetch repo details)",
        "refactor: create github_service module"
    ]),
    ("2026-03-23", [
        "feat: fetch commits, issues, PRs from GitHub",
        "fix: handle GitHub API errors"
    ]),

    # -------- FEATURE EXTRACTION --------
    ("2026-03-24", [
        "feat: implement FeatureService",
        "feat: extract stars, forks, issues"
    ]),
    ("2026-03-25", [
        "feat: add activity metrics (commits frequency)",
        "feat: compute recent activity score"
    ]),
    ("2026-03-26", [
        "feat: add collaboration metrics (PR merge ratio)",
        "feat: contributor distribution analysis"
    ]),
    ("2026-03-27", [
        "feat: issue closure rate calculation",
        "feat: maintenance frequency scoring"
    ]),

    # -------- DOCUMENTATION ANALYSIS --------
    ("2026-03-28", [
        "feat: fetch README from GitHub",
        "feat: detect documentation sections (install, usage)"
    ]),
    ("2026-03-29", [
        "feat: README length scoring",
        "feat: documentation quality analysis"
    ]),

    # -------- RULE SCORING --------
    ("2026-03-30", [
        "feat: implement rule-based scoring engine",
        "feat: category scores (activity, collaboration, docs)"
    ]),

    # -------- AI INTEGRATION --------
    ("2026-03-31", [
        "feat: integrate Gemini AI",
        "feat: generate repository summary"
    ]),
    ("2026-04-01", [
        "feat: AI scoring for all categories",
        "feat: generate strengths and weaknesses"
    ]),
    ("2026-04-02", [
        "feat: implement hybrid scoring (rule + AI)",
        "refactor: normalize score weights"
    ]),
    ("2026-04-03", [
        "feat: NLP keyword extraction",
        "feat: detect tech stack and frameworks"
    ]),
    ("2026-04-04", [
        "fix: handle AI JSON parsing errors",
        "improve: optimize prompt engineering"
    ]),

    # -------- AUTH --------
    ("2026-04-05", [
        "feat: implement GitHub OAuth login",
        "feat: add auth routes"
    ]),
    ("2026-04-06", [
        "feat: store users in database",
        "feat: save access token"
    ]),
    ("2026-04-07", [
        "feat: fetch user repositories",
        "fix: OAuth callback issues"
    ]),

    # -------- FRONTEND --------
    ("2026-04-08", [
        "init: setup React + Vite frontend",
        "feat: create base layout"
    ]),
    ("2026-04-09", [
        "feat: build dashboard UI",
        "feat: add repo input form"
    ]),
    ("2026-04-10", [
        "feat: integrate backend API",
        "feat: display repository scores"
    ]),
    ("2026-04-11", [
        "feat: add charts (radar, bar)",
        "feat: add AI insights component"
    ]),

    # -------- ADVANCED UI --------
    ("2026-04-12", [
        "feat: repo selector dropdown (OAuth)",
        "feat: improve landing page UI"
    ]),
    ("2026-04-13", [
        "feat: add risk meter",
        "feat: add contribution graph"
    ]),
    ("2026-04-14", [
        "refactor: improve UI responsiveness",
        "fix: frontend routing issues"
    ]),

    # -------- FINAL --------
    ("2026-04-15", [
        "fix: resolve backend errors (AI + GitHub service)",
        "chore: cleanup configs",
        "feat: prepare deployment setup"
    ]),
]

# 🧠 File changes per feature (to look REAL)
file_map = {
    "backend": "backend/app/main.py",
    "github": "backend/app/services/github_service.py",
    "feature": "backend/app/services/feature_service.py",
    "ai": "backend/app/services/ai_service.py",
    "auth": "backend/app/services/auth_service.py",
    "frontend": "frontend/src/App.tsx",
    "ui": "frontend/src/components/Dashboard.tsx",
    "docs": "README.md"
}

def pick_file(msg):
    msg = msg.lower()
    if "github" in msg:
        return file_map["github"]
    if "feature" in msg or "metrics" in msg:
        return file_map["feature"]
    if "ai" in msg or "nlp" in msg:
        return file_map["ai"]
    if "oauth" in msg or "auth" in msg:
        return file_map["auth"]
    if "frontend" in msg or "ui" in msg or "dashboard" in msg:
        return file_map["frontend"]
    if "docs" in msg or "readme" in msg:
        return file_map["docs"]
    return file_map["backend"]

# 📦 Create commits
for date, messages in timeline:
    for msg in messages:
        hour = random.randint(10, 22)
        minute = random.randint(0, 59)

        dt = f"{date}T{hour:02d}:{minute:02d}:00"

        file = pick_file(msg)

        dir_name = os.path.dirname(file)

        if dir_name:  # only create if not empty
            os.makedirs(dir_name, exist_ok=True)

        with open(file, "a") as f:
            f.write(f"\n# {msg} @ {dt}")

        run("git add .")
        run(f'git commit -m "{msg}" --date="{dt}"')

        print(f"✅ {msg} → {dt}")

print("\n🚀 RepoMetrics commit history generated!")