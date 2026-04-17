import os
import subprocess
import random
from datetime import datetime, timedelta

# -----------------------------
# CONFIG
# -----------------------------
START_DATE = datetime(2026, 3, 20, 10, 0)
END_DATE = datetime(2026, 4, 15, 20, 0)

FILES = [
    "README.md",
    "backend/app/main.py",
    "backend/app/services/github_service.py",
    "backend/app/services/feature_service.py",
    "backend/app/services/ai_service.py",
    "backend/app/services/hybrid_service.py",
    "backend/app/api/routes/analyze.py",
    "backend/app/api/routes/auth.py",
    "backend/app/db/models.py",
    "frontend/src/App.tsx",
    "frontend/src/pages/Dashboard.tsx",
    "frontend/src/components/ScoreCard.tsx",
    "frontend/src/components/Charts.tsx",
    "frontend/src/components/RadarChart.tsx",
    "frontend/src/components/ContributionGraph.tsx",
    "frontend/src/components/RepoSelector.tsx",
]

COMMIT_TYPES = ["feat", "fix", "refactor", "ui", "perf", "docs"]

MESSAGES = [
    "initialize project structure",
    "setup FastAPI backend",
    "add GitHub API integration",
    "implement commit analysis",
    "add contributor metrics",
    "implement PR & issue scoring",
    "add README parsing",
    "integrate Gemini AI analysis",
    "fix API response bug",
    "refactor feature extraction",
    "add hybrid scoring logic",
    "improve scoring weights",
    "add authentication via GitHub OAuth",
    "fix token handling",
    "setup React frontend",
    "build dashboard UI",
    "add charts visualization",
    "implement radar chart",
    "add contribution graph",
    "connect frontend with backend",
    "improve UI styling",
    "fix frontend bugs",
    "optimize API calls",
    "final polishing and cleanup",
]

# -----------------------------
# HELPERS
# -----------------------------
def random_time_on_day(base_date):
    """Random realistic working hour"""
    hour = random.randint(10, 22)
    minute = random.randint(0, 59)
    return base_date.replace(hour=hour, minute=minute)

def make_commit(message, date):
    env = os.environ.copy()
    formatted = date.strftime("%Y-%m-%dT%H:%M:%S")

    env["GIT_AUTHOR_DATE"] = formatted
    env["GIT_COMMITTER_DATE"] = formatted

    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "-m", message], env=env, check=True)

    print(f"✅ {message} → {formatted}")

def touch_file(file, content):
    dir_name = os.path.dirname(file)

    if dir_name:
        os.makedirs(dir_name, exist_ok=True)

    with open(file, "a", encoding="utf-8") as f:
        f.write(content + "\n")

# -----------------------------
# GENERATE COMMITS
# -----------------------------
current_date = START_DATE

while current_date <= END_DATE:

    # Skip some days (simulate inactivity)
    if random.random() < 0.25:
        current_date += timedelta(days=1)
        continue

    # Number of commits in a day (1–4)
    commits_today = random.randint(1, 4)

    for _ in range(commits_today):

        commit_time = random_time_on_day(current_date)

        file = random.choice(FILES)
        commit_type = random.choice(COMMIT_TYPES)
        message = random.choice(MESSAGES)

        full_message = f"{commit_type}: {message}"

        content = f"# {full_message} at {commit_time}"

        touch_file(file, content)
        make_commit(full_message, commit_time)

    current_date += timedelta(days=1)

print("\n🎉 Ultra-realistic commit history generated!")