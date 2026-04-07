import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import models


class AuthService:

    @staticmethod
    async def exchange_code_for_token(code: str):
        url = "https://github.com/login/oauth/access_token"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.GITHUB_REDIRECT_URI
                }
            )

        return response.json()

    @staticmethod
    async def fetch_github_user(access_token: str):
        url = "https://api.github.com/user"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
            )

        return response.json()

    @staticmethod
    def create_or_update_user(db: Session, user_data: dict, token: str):
        github_id = str(user_data["id"])

        user = db.query(models.User).filter_by(github_id=github_id).first()

        if user:
            user.access_token = token
        else:
            user = models.User(
                github_id=github_id,
                username=user_data["login"],
                access_token=token,
                avatar_url=user_data.get("avatar_url")
            )
            db.add(user)

        db.commit()
        db.refresh(user)

        return user
# feat: add auth routes @ 2026-04-05T18:27:00
# fix: OAuth callback issues @ 2026-04-07T21:07:00