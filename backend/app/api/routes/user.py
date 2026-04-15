from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.core.security import decode_access_token
from app.services.github_service import GitHubService

router = APIRouter()


@router.get("/user/repos")
async def get_current_user_repos(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1].strip()

    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(models.User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return await GitHubService.fetch_user_repos(user.access_token)


@router.get("/user/{user_id}/repos")
async def get_user_repos(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(id=user_id).first()

    if not user:
        return {"error": "User not found"}

    repos = await GitHubService.fetch_user_repos(user.access_token)

    return {"repos": repos}