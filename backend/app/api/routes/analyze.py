from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.services.github_service import GitHubService
from app.services.feature_service import FeatureService
from app.services.ai_service import AIService
from app.services.hybrid_service import HybridService

from app.db.database import get_db
from app.db import models

router = APIRouter()

ai_service = AIService()


@router.get("/analyze/{owner}/{repo}")
async def analyze_repo(
    owner: str,
    repo: str,
    user_id: int | None = None,
    db: Session = Depends(get_db)
):
    try:
        # -------------------------
        # USER TOKEN
        # -------------------------
        token = None

        if user_id:
            user = db.query(models.User).filter_by(id=user_id).first()

            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            token = user.access_token

        # -------------------------
        # FETCH DATA
        # -------------------------
        repo_data = await GitHubService.fetch_repo(owner, repo, token)
        commits = await GitHubService.fetch_commits(owner, repo, token)
        contributors = await GitHubService.fetch_contributors(owner, repo, token)
        pulls = await GitHubService.fetch_pulls(owner, repo, token)
        issues = await GitHubService.fetch_issues(owner, repo, token)
        readme = await GitHubService.fetch_readme(owner, repo, token)

        # -------------------------
        # FEATURE EXTRACTION
        # -------------------------
        features = FeatureService.extract_features(
            repo_data,
            commits or [],
            contributors or [],
            pulls or [],
            issues or [],
            readme or ""
        )

        # -------------------------
        # RULE SCORING
        # -------------------------
        rule_scores = {
            "activity": min(features.get("recent_commits", 0), 100),
            "collaboration": round(features.get("pr_merged_ratio", 0) * 100, 2),
            "documentation": min(round(features.get("readme_length", 0) / 50, 2), 100),
            "stability": round(features.get("issue_closure_rate", 0) * 100, 2),
            "popularity": min(round(features.get("stars", 0) / 1000, 2), 100),
        }

        # -------------------------
        # AI SCORING
        # -------------------------
        try:
            ai_result = ai_service.analyze_repository(features)
        except Exception:
            ai_result = {"error": "AI failed"}

        # -------------------------
        # HYBRID SCORING
        # -------------------------
        hybrid = HybridService.combine_scores(
            rule_scores,
            ai_result.get("scores", {})
        )

        return {
            "success": True,
            "repository": {
                "name": repo_data.get("name"),
                "full_name": repo_data.get("full_name"),
                "description": repo_data.get("description"),
                "stars": repo_data.get("stargazers_count", 0),
                "forks": repo_data.get("forks_count", 0),
                "open_issues": repo_data.get("open_issues_count", 0),
            },
            "features": features,
            "rule_scores": rule_scores,
            "ai_analysis": ai_result,
            "final": hybrid,
        }

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))# docs: final polishing and cleanup at 2026-03-20 18:16:00
# ui: add README parsing at 2026-03-20 11:47:00
# feat: implement radar chart at 2026-03-21 21:29:00
# docs: implement PR & issue scoring at 2026-03-25 13:54:00
# feat: optimize API calls at 2026-04-05 16:58:00
