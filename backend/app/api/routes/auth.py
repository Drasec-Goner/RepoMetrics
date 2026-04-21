import json
import urllib.parse
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.services.auth_service import AuthService
from app.core.security import create_access_token

router = APIRouter()


@router.get("/auth/login")
def github_login():
    github_url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
        "&scope=repo user"
        "&prompt=select_account"
    )
    return RedirectResponse(github_url)


@router.get("/auth/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    # 1. Exchange code → GitHub token
    token_data = await AuthService.exchange_code_for_token(code)
    github_token = token_data.get("access_token")

    if token_data.get("error") or not github_token:
        raise HTTPException(
            status_code=502,
            detail=token_data.get("error_description") or "Failed to get access token from GitHub",
        )

    # 2. Fetch GitHub user
    user_data = await AuthService.fetch_github_user(github_token)

    if user_data.get("message") or not user_data.get("id"):
        raise HTTPException(
            status_code=502,
            detail=user_data.get("message") or "Failed to fetch GitHub user",
        )

    # 3. Save user
    user = AuthService.create_or_update_user(db, user_data, github_token)

    # 4. Create YOUR app JWT (NOT GitHub token)
    try:
        jwt_token = create_access_token(
            data={
                "user_id": user.id,
                "github_id": user.github_id,
            },
            expires_delta=timedelta(days=7)
        )
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    frontend_url = settings.FRONTEND_URL.rstrip("/")

    # Minimal user payload
    user_payload = {
        "id": user.id,
        "login": user.username,
        "avatar_url": user.avatar_url or ""
    }

    encoded_user = urllib.parse.quote(json.dumps(user_payload))
    encoded_token = urllib.parse.quote(jwt_token)

    # ✅ Send ONLY your JWT
    redirect_url = f"{frontend_url}/auth/callback?token={encoded_token}&user={encoded_user}"

    return RedirectResponse(url=redirect_url)
