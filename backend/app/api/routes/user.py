from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.services.github_service import GitHubService

router = APIRouter()


@router.get("/user/{user_id}/repos")
async def get_user_repos(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(id=user_id).first()

    if not user:
        return {"error": "User not found"}

    repos = await GitHubService.fetch_user_repos(user.access_token)

    return {"repos": repos}