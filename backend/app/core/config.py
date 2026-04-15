import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # App
    APP_NAME: str = os.getenv("APP_NAME", "RepoMetrics")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    PORT: int = int(os.getenv("PORT", 8000))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    SECRET_KEY: str | None = os.getenv("SECRET_KEY")

    # GitHub API
    GITHUB_API_BASE: str = os.getenv("GITHUB_API_BASE", "https://api.github.com")
    GITHUB_TOKEN: str | None = os.getenv("GITHUB_TOKEN")

    # GitHub OAuth
    GITHUB_CLIENT_ID: str | None = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: str | None = os.getenv("GITHUB_CLIENT_SECRET")
    GITHUB_REDIRECT_URI: str | None = os.getenv("GITHUB_REDIRECT_URI")

    # Gemini AI
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")

settings = Settings()