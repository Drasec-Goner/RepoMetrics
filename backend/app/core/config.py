import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # App
    APP_NAME: str = os.getenv("APP_NAME", "RepoMetrics")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    PORT: int = int(os.getenv("PORT", 8000))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://repometrics-ai.vercel.app")
    FRONTEND_URLS: str = os.getenv("FRONTEND_URLS", "")
    SECRET_KEY: str | None = os.getenv("SECRET_KEY")

    # GitHub API
    GITHUB_API_BASE: str = os.getenv("GITHUB_API_BASE", "https://api.github.com")
    GITHUB_TOKEN: str | None = os.getenv("GITHUB_TOKEN")

    # GitHub OAuth
    GITHUB_CLIENT_ID: str | None = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: str | None = os.getenv("GITHUB_CLIENT_SECRET")
    GITHUB_REDIRECT_URI: str = os.getenv(
        "GITHUB_REDIRECT_URI", "https://repometrics.onrender.com/auth/callback"
    )

    # Gemini AI
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")

    @property
    def frontend_origins(self) -> list[str]:
        configured = [
            origin.strip().rstrip("/")
            for origin in self.FRONTEND_URLS.split(",")
            if origin.strip()
        ]
        primary = self.FRONTEND_URL.strip().rstrip("/")

        if primary and primary not in configured:
            configured.insert(0, primary)

        if not configured:
            configured = ["http://localhost:5173"]

        return configured

    @property
    def frontend_redirect_url(self) -> str:
        return self.frontend_origins[0]

settings = Settings()