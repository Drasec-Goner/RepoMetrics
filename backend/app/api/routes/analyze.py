from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.services.github_service import GitHubService
from app.services.feature_service import FeatureService
from app.services.ai_service import AIService
from app.services.scoring_service import ScoringService
from app.services.hybrid_service import HybridService

from app.db.database import get_db
from app.db import models
from app.core.security import decode_access_token
from app.core.config import settings

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
    if score >= 80:
        return "A"
    if score >= 65:
        return "B"
    if score >= 45:
        return "C"
    return "D"


def _categorize_recommendations(recommendations: list[str], features: dict) -> dict:
    """
    Categorizes recommendations into categories and checks if they're already implemented.
    Returns a dict mapping category -> list of {text, status} where status is 'implemented' or 'recommended'.
    """
    
    category_keywords = {
        "activity": ["commit", "release", "cadence", "frequency", "active", "maintenance", "changelog"],
        "collaboration": ["pr", "review", "merge", "contributor", "contributing", "pull request", "guidelines", "templates"],
        "documentation": ["readme", "docs", "documentation", "examples", "api", "architecture", "guide", "setup"],
        "stability": ["issue", "bug", "test", "ci", "regression", "reliability", "metrics", "automation"],
        "popularity": ["discoverability", "tags", "topics", "community", "adoption", "showcase", "demo", "share"],
    }
    
    # Check for already-implemented features
    implemented_checks = {
        "activity": features.get("recent_commits", 0) >= 60,  # Active recent commits
        "collaboration": features.get("pr_total", 0) > 0 and features.get("pr_merged_ratio", 0) > 0.5,
        "documentation": features.get("has_readme") and features.get("readme_keyword_score", 0) >= 50,
        "stability": features.get("issue_closure_rate", 0) >= 0.5 or features.get("open_issues_count", 0) < 20,
        "popularity": features.get("stars", 0) > 0 or features.get("license_present"),
    }
    
    categorized = {
        "activity": [],
        "collaboration": [],
        "documentation": [],
        "stability": [],
        "popularity": [],
    }
    
    for rec in recommendations:
        rec_lower = rec.lower()
        assigned = False
        
        # Try to categorize by keywords
        for category, keywords in category_keywords.items():
            if any(keyword in rec_lower for keyword in keywords):
                # Check if this specific recommendation is already implemented
                status = "implemented" if implemented_checks.get(category) else "recommended"
                categorized[category].append({
                    "text": rec,
                    "status": status
                })
                assigned = True
                break
        
        # If not assigned, put in activity as default
        if not assigned:
            categorized["activity"].append({
                "text": rec,
                "status": "recommended"
            })
    
    return categorized


def _parse_commit_dates(commits: list[dict]) -> list[datetime]:
    parsed_dates: list[datetime] = []

    for commit in commits:
        date_text = (
            commit.get("commit", {})
            .get("author", {})
            .get("date")
        )

        if not date_text:
            continue

        try:
            parsed_dates.append(datetime.fromisoformat(str(date_text).replace("Z", "")))
        except ValueError:
            continue

    return sorted(parsed_dates, reverse=True)


def _build_historical_analysis(commits: list[dict], final_score: float, rule_scores: dict) -> dict:
    dates = _parse_commit_dates(commits)
    if not dates:
        return {
            "trend": "stable",
            "summary": "No commit history was available to build a trend line.",
            "timeline": [],
        }

    now = datetime.utcnow()
    windows = [180, 90, 30, 7]
    timeline = []

    for days in windows:
        threshold = now - timedelta(days=days)
        count = sum(1 for commit_date in dates if commit_date >= threshold)
        activity_rate = count / max(days / 7.0, 1.0)
        activity_score = _clamp_score(activity_rate * 18.0)
        projected_score = _clamp_score((final_score * 0.75) + (activity_score * 0.25))

        timeline.append({
            "period": f"Last {days} days",
            "commit_count": count,
            "activity_score": activity_score,
            "projected_score": projected_score,
            "grade": _grade_from_score(projected_score),
        })

    last_30 = timeline[2]["commit_count"]
    prev_30 = max(0, timeline[1]["commit_count"] - last_30)

    if last_30 > prev_30 * 1.15:
        trend = "improving"
        summary = "Recent activity is accelerating, which usually supports healthier maintenance and release cadence."
    elif last_30 < prev_30 * 0.85:
        trend = "declining"
        summary = "Recent activity is slowing down, so the project may be losing momentum and maintenance visibility."
    else:
        trend = "stable"
        summary = "Commit activity is relatively steady, with no major acceleration or drop in recent momentum."

    if rule_scores.get("stability", 0) < 50:
        summary += " Issue resolution quality still needs attention."

    return {
        "trend": trend,
        "summary": summary,
        "timeline": timeline,
    }


def _build_score_hurt_factors(rule_scores: dict, features: dict, ai_analysis: dict) -> list[dict]:
    factors: list[dict] = []

    def add_factor(category: str, score: float, label: str, detail: str, severity_weight: float):
        if score >= 70:
            return

        severity = "high" if score < 45 else "medium"
        factors.append({
            "category": category,
            "label": label,
            "detail": detail,
            "score": round(float(score), 1),
            "severity": severity,
            "impact": round((100 - float(score)) * severity_weight, 1),
        })

    add_factor(
        "documentation",
        float(rule_scores.get("documentation", 0) or 0),
        "Documentation depth",
        "The README and supporting docs are not strong enough to make onboarding and maintenance effortless.",
        0.35,
    )
    add_factor(
        "activity",
        float(rule_scores.get("activity", 0) or 0),
        "Development cadence",
        "Commit velocity is not showing strong, steady maintenance signals.",
        0.32,
    )
    add_factor(
        "stability",
        float(rule_scores.get("stability", 0) or 0),
        "Issue and reliability health",
        "Issue resolution and regression signals are weaker than they should be.",
        0.3,
    )
    add_factor(
        "collaboration",
        float(rule_scores.get("collaboration", 0) or 0),
        "Collaboration flow",
        "PR review, merge, or contributor signals could be stronger.",
        0.28,
    )
    add_factor(
        "popularity",
        float(rule_scores.get("popularity", 0) or 0),
        "Adoption visibility",
        "Stars, forks, or broader discoverability signals are still limited.",
        0.2,
    )

    if not features.get("has_readme"):
        factors.append({
            "category": "documentation",
            "label": "Missing README",
            "detail": "A README is one of the fastest ways to improve clarity and onboarding.",
            "score": 0,
            "severity": "high",
            "impact": 35,
        })

    if features.get("license_present") is False:
        factors.append({
            "category": "compliance",
            "label": "No license detected",
            "detail": "A clear license improves trust and makes reuse safer.",
            "score": 0,
            "severity": "medium",
            "impact": 12,
        })

    for weakness in (ai_analysis.get("weaknesses") or [])[:3]:
        text = str(weakness).strip()
        if text:
            factors.append({
                "category": "ai",
                "label": "AI-identified weakness",
                "detail": text,
                "score": 0,
                "severity": "medium",
                "impact": 8,
            })

    factors.sort(key=lambda item: item.get("impact", 0), reverse=True)
    return factors[:6]


def _build_code_quality_breakdown(rule_scores: dict, features: dict) -> list[dict]:
    breakdown = [
        {
            "category": "documentation",
            "label": "Documentation & onboarding",
            "score": round(float(rule_scores.get("documentation", 0) or 0), 1),
            "detail": "README depth, examples, and setup clarity.",
        },
        {
            "category": "stability",
            "label": "Reliability & regression safety",
            "score": round(float(rule_scores.get("stability", 0) or 0), 1),
            "detail": "Issue closure, open issue load, and healthy maintenance signals.",
        },
        {
            "category": "activity",
            "label": "Delivery cadence",
            "score": round(float(rule_scores.get("activity", 0) or 0), 1),
            "detail": "Recent commits and sustained maintenance rhythm.",
        },
        {
            "category": "collaboration",
            "label": "Contributor workflow",
            "score": round(float(rule_scores.get("collaboration", 0) or 0), 1),
            "detail": "PR merge ratio and contributor participation.",
        },
        {
            "category": "popularity",
            "label": "Reach & adoption",
            "score": round(float(rule_scores.get("popularity", 0) or 0), 1),
            "detail": "Stars, forks, watchers, and overall discoverability.",
        },
    ]

    if features.get("license_present"):
        breakdown.append({
            "category": "compliance",
            "label": "License clarity",
            "score": 100,
            "detail": "An explicit license makes the project easier to reuse.",
        })

    return breakdown


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
        # TOKEN RESOLUTION
        # -------------------------
        user = None
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
        else:
            # Optional app-level token used for anonymous/public analysis to reduce rate-limit failures.
            token = settings.GITHUB_TOKEN

        if user:
            cache_identity = f"user:{user.id}"
        else:
            cache_identity = "public-token" if token else "public-anon"
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
        releases = await GitHubService.fetch_releases(owner, repo, token)
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
            releases or [],
        )

        # -------------------------
        # RULE SCORING
        # -------------------------
        commit_dates = _parse_commit_dates(commits or [])
        rule_scores = ScoringService.calculate_rule_scores(features, commit_dates)

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
        ai_score_sources: dict[str, str] = {}
        ai_model_scores = 0
        for category, value in rule_scores.items():
            ai_score = ai_result["scores"].get(category)
            if not isinstance(ai_score, (int, float)):
                ai_result["scores"][category] = value
                ai_score_sources[category] = "fallback_rule"
            else:
                ai_model_scores += 1
                ai_score_sources[category] = "model"

        total_categories = max(len(rule_scores), 1)
        ai_score_coverage = round(ai_model_scores / total_categories, 3)

        ai_result["meta"] = {
            "score_source": "model" if ai_score_coverage >= 1.0 else "fallback",
            "score_coverage": ai_score_coverage,
            "score_sources": ai_score_sources,
            "used_fallback": ai_score_coverage < 1.0,
            "error": ai_result.get("error"),
        }

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

        # Categorize recommendations by category and check if implemented
        categorized_recommendations = _categorize_recommendations(ai_analysis["recommendations"], features)
        ai_analysis["categorized_recommendations"] = categorized_recommendations

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
            ai_result.get("scores", {}),
            ai_confidence=float(ai_result.get("tech", {}).get("confidence", 0.5) or 0.5),
            feature_signal_quality=ScoringService.feature_signal_quality(features),
            ai_score_coverage=ai_score_coverage,
        )

        final_score = float(hybrid.get("overall_score", 0) or 0)
        risk = _calculate_risk(final_score, rule_scores, features)
        hybrid["grade"] = _grade_from_score(final_score)
        hybrid["risk"] = risk
        hybrid["methodology"] = {
            "temporal_normalization": True,
            "stability_model": "issue+cadence+contributor-distribution",
            "hybrid_blend": "confidence-adaptive",
        }

        historical = _build_historical_analysis(commits or [], final_score, rule_scores)
        hurt_factors = _build_score_hurt_factors(rule_scores, features, ai_analysis)
        code_quality_breakdown = _build_code_quality_breakdown(rule_scores, features)

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
            "insights": {
                "what_is_hurting_your_score": hurt_factors,
                "code_quality_breakdown": code_quality_breakdown,
                "historical_analysis": historical,
            },
        }

        _ANALYSIS_CACHE[cache_key] = (now, response_payload)
        return response_payload

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
