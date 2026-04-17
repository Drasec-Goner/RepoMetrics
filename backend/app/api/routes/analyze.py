from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.services.github_service import GitHubService
from app.services.feature_service import FeatureService
from app.services.ai_service import AIService
from app.services.hybrid_service import HybridService

from app.db.database import get_db
from app.db import models
from app.core.security import decode_access_token

router = APIRouter()

ai_service = AIService()
_ANALYSIS_CACHE: dict[str, tuple[datetime, dict]] = {}
_CACHE_TTL = timedelta(minutes=10)


def _clamp_score(value: float) -> float:
    return round(max(0.0, min(100.0, value)), 2)


def _dedupe_lines(items: list[str], limit: int = 6) -> list[str]:
    seen = set()
    deduped = []

    for item in items:
        text = str(item).strip()
        key = text.lower()
        if not text or key in seen:
            continue
        seen.add(key)
        deduped.append(text)

    return deduped[:limit]


def _grade_from_score(score: float) -> str:
    if score >= 85:
        return "A"
    if score >= 70:
        return "B"
    if score >= 50:
        return "C"
    return "D"


def _calculate_risk(final_score: float, rule_scores: dict, features: dict) -> dict:
    risk_points = 0
    reasons: list[str] = []

    if final_score < 45:
        risk_points += 30
        reasons.append("Overall repository quality is currently low.")
    elif final_score < 60:
        risk_points += 15
        reasons.append("Overall quality is moderate but below healthy baseline.")

    if rule_scores.get("activity", 0) < 45:
        risk_points += 20
        reasons.append("Low recent activity increases maintenance risk.")

    if rule_scores.get("stability", 0) < 45:
        risk_points += 20
        reasons.append("Issue resolution and stability indicators are weak.")

    if rule_scores.get("documentation", 0) < 45:
        risk_points += 15
        reasons.append("Documentation quality is insufficient for maintainability.")

    if features.get("is_archived"):
        risk_points += 15
        reasons.append("Repository is archived and may no longer be actively maintained.")

    if (features.get("language_count") or 0) <= 1:
        risk_points += 5
        reasons.append("Low language diversity may limit ecosystem flexibility.")

    risk_score = int(max(0, min(100, risk_points)))

    if risk_score >= 75:
        level = "Critical"
        meaning = "High probability of maintainability and delivery problems unless immediate improvements are made."
    elif risk_score >= 55:
        level = "High"
        meaning = "Significant quality gaps exist and should be addressed in the near term."
    elif risk_score >= 30:
        level = "Moderate"
        meaning = "Repository is usable but has notable risk factors that may affect reliability and velocity."
    else:
        level = "Low"
        meaning = "Current quality profile is relatively healthy with manageable risks."

    return {
        "score": risk_score,
        "level": level,
        "meaning": meaning,
        "reasons": _dedupe_lines(reasons, limit=6),
    }


def _rule_based_insights(features: dict, rule_scores: dict) -> dict:
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendations: list[str] = []

    if features.get("has_readme"):
        strengths.append("README is present, improving baseline project discoverability.")
    else:
        weaknesses.append("README is missing, which makes onboarding and understanding harder.")
        recommendations.append("Add a README with project overview, setup, usage, and contribution guidance.")

    if rule_scores.get("activity", 0) >= 60:
        strengths.append("Recent commit activity indicates ongoing development.")
    else:
        weaknesses.append("Recent development activity is low.")
        recommendations.append("Increase commit frequency and keep changes incremental to show active maintenance.")

    if rule_scores.get("collaboration", 0) >= 50:
        strengths.append("Collaboration signals are healthy based on contributor and PR metrics.")
    else:
        weaknesses.append("Collaboration signals are weak with low PR merge/contributor performance.")
        recommendations.append("Encourage PR reviews/merges and invite contributor participation through clear contribution docs.")

    if rule_scores.get("stability", 0) >= 50:
        strengths.append("Issue handling appears reasonably stable.")
    else:
        weaknesses.append("Issue closure performance is low relative to issue volume.")
        recommendations.append("Triage open issues and set a regular issue-resolution cadence.")

    if rule_scores.get("documentation", 0) >= 55:
        strengths.append("Documentation quality is above baseline based on README depth and structure.")
    else:
        weaknesses.append("Documentation depth is limited for current project complexity.")
        recommendations.append("Expand docs with setup examples, API details, architecture notes, and troubleshooting.")

    if (features.get("language_count") or 0) >= 3:
        strengths.append("Technology mix suggests broader capability across different parts of the stack.")
    elif (features.get("language_count") or 0) <= 1:
        weaknesses.append("Technology profile appears narrow from language distribution.")
        recommendations.append("Document architectural boundaries and, where applicable, separate concerns by module.")

    if features.get("license_present"):
        strengths.append("Repository includes a license, improving legal clarity for contributors/users.")
    else:
        weaknesses.append("No explicit license detected, which may limit safe adoption.")
        recommendations.append("Add an appropriate open-source license file to improve adoption confidence.")

    return {
        "strengths": _dedupe_lines(strengths),
        "weaknesses": _dedupe_lines(weaknesses),
        "recommendations": _dedupe_lines(recommendations, limit=8),
    }


@router.get("/analyze/{owner}/{repo}")
async def analyze_repo(
    owner: str,
    repo: str,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
):
    try:
        # -------------------------
        # USER TOKEN
        # -------------------------
        token = None

        if authorization:
            if not authorization.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Invalid Authorization header")

            raw_token = authorization.split(" ", 1)[1].strip()

            try:
                payload = decode_access_token(raw_token)
            except ValueError as exc:
                raise HTTPException(status_code=401, detail=str(exc)) from exc

            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token payload")

            user = db.query(models.User).filter_by(id=user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            token = user.access_token

        cache_identity = f"user:{user.id}" if authorization and 'user' in locals() else "public"
        cache_key = f"{cache_identity}:{owner}/{repo}".lower()
        cached = _ANALYSIS_CACHE.get(cache_key)
        now = datetime.utcnow()
        if cached:
            cached_at, payload = cached
            if now - cached_at <= _CACHE_TTL:
                return payload

        # -------------------------
        # FETCH DATA
        # -------------------------
        repo_data = await GitHubService.fetch_repo(owner, repo, token)
        commits = await GitHubService.fetch_commits(owner, repo, token)
        contributors = await GitHubService.fetch_contributors(owner, repo, token)
        pulls = await GitHubService.fetch_pulls(owner, repo, token)
        issues = await GitHubService.fetch_issues(owner, repo, token)
        readme = await GitHubService.fetch_readme(owner, repo, token)
        languages = await GitHubService.fetch_languages(owner, repo, token)

        # -------------------------
        # FEATURE EXTRACTION
        # -------------------------
        features = FeatureService.extract_features(
            repo_data,
            commits or [],
            contributors or [],
            pulls or [],
            issues or [],
            readme or "",
            languages or {},
        )

        # -------------------------
        # RULE SCORING
        # -------------------------
        commit_count = float(features.get("commit_count", 0) or 0)
        recent_activity = float(features.get("recent_commits", 0) or 0)
        contributors = float(features.get("contributors", 0) or 0)
        pr_merge_ratio = float(features.get("pr_merged_ratio", 0) or 0)
        issue_closure = float(features.get("issue_closure_rate", 0) or 0)
        stars = float(features.get("stars", 0) or 0)
        forks = float(features.get("forks", 0) or 0)
        readme_length = float(features.get("readme_length", 0) or 0)
        readme_keywords = float(features.get("readme_keyword_score", 0) or 0)
        readme_sections = float(features.get("readme_section_count", 0) or 0)
        has_readme_bonus = 20.0 if features.get("has_readme") else 0.0

        rule_scores = {
            "activity": _clamp_score(recent_activity * 0.7 + min(commit_count, 150) / 150 * 100 * 0.3),
            "collaboration": _clamp_score((pr_merge_ratio * 100) * 0.7 + min(contributors, 20) / 20 * 100 * 0.3),
            "documentation": _clamp_score(
                has_readme_bonus
                + min(readme_length, 5000) / 5000 * 35
                + readme_keywords * 0.25
                + min(readme_sections, 10) / 10 * 10
                + (10 if features.get("description_length", 0) > 40 else 0)
                + (5 if features.get("has_wiki") else 0)
            ),
            "stability": _clamp_score((issue_closure * 100) * 0.8 + (100 - min(float(features.get("open_issues_count", 0) or 0), 100)) * 0.2),
            "popularity": _clamp_score(
                min(stars, 10000) / 10000 * 55
                + min(forks, 2500) / 2500 * 20
                + min(float(features.get("subscribers_count", 0) or 0), 1500) / 1500 * 15
                + min(float(features.get("watchers_count", 0) or 0), 5000) / 5000 * 10
            ),
        }

        # -------------------------
        # AI SCORING
        # -------------------------
        try:
            ai_result = ai_service.analyze_repository(features, languages)
        except Exception:
            ai_result = {"error": "AI failed"}

        # Ensure AI scores are always present for charting and weighted merge.
        if not isinstance(ai_result.get("scores"), dict):
            ai_result["scores"] = {}
        for category, value in rule_scores.items():
            ai_score = ai_result["scores"].get(category)
            if not isinstance(ai_score, (int, float)):
                ai_result["scores"][category] = value

        # Merge deterministic rule-based insights to reduce hallucinations.
        if not isinstance(ai_result.get("analysis"), dict):
            ai_result["analysis"] = {}
        ai_analysis = ai_result["analysis"]
        ai_analysis.setdefault("summary", "")
        ai_analysis.setdefault("strengths", [])
        ai_analysis.setdefault("weaknesses", [])
        ai_analysis.setdefault("recommendations", [])

        rule_insights = _rule_based_insights(features, rule_scores)
        ai_analysis["strengths"] = _dedupe_lines(ai_analysis.get("strengths", []) + rule_insights["strengths"])
        ai_analysis["weaknesses"] = _dedupe_lines(ai_analysis.get("weaknesses", []) + rule_insights["weaknesses"])
        ai_analysis["recommendations"] = _dedupe_lines(ai_analysis.get("recommendations", []) + rule_insights["recommendations"], limit=10)

        # Fill tech stack from GitHub language meter when AI output is sparse.
        if not isinstance(ai_result.get("tech"), dict):
            ai_result["tech"] = {}

        detected_stack = ai_result["tech"].get("detected_stack")
        confidence = ai_result["tech"].get("confidence")
        if not isinstance(detected_stack, list) or len(detected_stack) == 0:
            sorted_langs = sorted(languages.items(), key=lambda x: x[1], reverse=True)
            ai_result["tech"]["detected_stack"] = [name for name, _ in sorted_langs[:6]]
            ai_result["tech"]["confidence"] = round(float(sorted_langs[0][1]), 2) if sorted_langs else 0.0
        elif not isinstance(confidence, (int, float)):
            ai_result["tech"]["confidence"] = 0.5

        # -------------------------
        # HYBRID SCORING
        # -------------------------
        hybrid = HybridService.combine_scores(
            rule_scores,
            ai_result.get("scores", {})
        )

        final_score = float(hybrid.get("overall_score", 0) or 0)
        risk = _calculate_risk(final_score, rule_scores, features)
        hybrid["grade"] = _grade_from_score(final_score)
        hybrid["risk"] = risk

        if not ai_analysis.get("verdict"):
            ai_analysis["verdict"] = (
                "Repository appears healthy overall with maintainable risk profile."
                if final_score >= 70
                else "Repository has moderate gaps and would benefit from targeted improvements."
                if final_score >= 45
                else "Repository is currently high-risk/low-maturity and needs focused quality improvements."
            )

        response_payload = {
            "success": True,
            "repository": {
                "name": repo_data.get("name"),
                "full_name": repo_data.get("full_name"),
                "description": repo_data.get("description"),
                "language": repo_data.get("language"),
                "stars": repo_data.get("stargazers_count", 0),
                "forks": repo_data.get("forks_count", 0),
                "open_issues": repo_data.get("open_issues_count", 0),
                "languages": languages,
            },
            "features": features,
            "rule_scores": rule_scores,
            "ai_analysis": ai_result,
            "final": hybrid,
        }

        _ANALYSIS_CACHE[cache_key] = (now, response_payload)
        return response_payload

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))# docs: final polishing and cleanup at 2026-03-20 18:16:00
# ui: add README parsing at 2026-03-20 11:47:00
# feat: implement radar chart at 2026-03-21 21:29:00
# docs: implement PR & issue scoring at 2026-03-25 13:54:00
# feat: optimize API calls at 2026-04-05 16:58:00
# perf: setup React frontend at 2026-04-14 14:56:00
