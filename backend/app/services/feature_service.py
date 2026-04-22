import base64
import math
import re
from datetime import datetime


class FeatureService:

    @staticmethod
    def extract_features(repo, commits, contributors, pulls, issues, readme, languages=None, releases=None):
        features = {}
        languages = languages or {}
        releases = releases or []

        # Activity Metrics
        features["commit_count"] = len(commits)
        features["recent_commits"] = FeatureService._recent_commit_score(commits)

        # Collaboration
        features["contributors"] = len(contributors)
        features["top_contributor_share"] = FeatureService._top_contributor_share(contributors)
        features["bus_factor_proxy"] = max(0.0, 1.0 - features["top_contributor_share"])
        features["pr_total"] = len(pulls)
        features["pr_merged_ratio"] = FeatureService._pr_merge_ratio(pulls)
        features["issue_closure_rate"] = FeatureService._issue_closure_rate(issues)
        features["closed_issues_count"] = sum(1 for issue in issues if issue.get("state") == "closed")
        features["release_count"] = len(releases)

        # Popularity
        features["stars"] = repo.get("stargazers_count", 0)
        features["forks"] = repo.get("forks_count", 0)
        features["open_issues_count"] = repo.get("open_issues_count", 0)
        features["primary_language"] = repo.get("language") or ""
        features["description_length"] = len((repo.get("description") or "").strip())
        features["subscribers_count"] = repo.get("subscribers_count", 0)
        features["watchers_count"] = repo.get("watchers_count", 0)
        features["repo_size_kb"] = repo.get("size", 0)
        features["is_archived"] = bool(repo.get("archived", False))
        features["has_wiki"] = bool(repo.get("has_wiki", False))
        features["license_present"] = bool(repo.get("license"))
        features["repo_age_days"] = FeatureService._repo_age_days(repo)

        age_months = max(features["repo_age_days"] / 30.0, 1.0)
        features["commit_frequency_per_month"] = round(features["commit_count"] / age_months, 3)
        features["pr_frequency_per_month"] = round(features["pr_total"] / age_months, 3)
        features["issue_closure_per_month"] = round(features["closed_issues_count"] / age_months, 3)
        features["stars_per_month"] = round(features["stars"] / age_months, 3)

        # Language profile
        features["language_count"] = len(languages)
        features["dominant_language_share"] = max(languages.values()) if languages else 0
        features["top_languages"] = [name for name, _ in sorted(languages.items(), key=lambda x: x[1], reverse=True)[:8]]

        # Documentation
        readme_text = FeatureService._readme_text(readme)

        features["readme_length"] = len(readme_text)
        features["has_readme"] = len(readme_text) > 0
        features["readme_section_count"] = FeatureService._count_readme_sections(readme_text)
        features["readme_keyword_score"] = FeatureService._readme_keyword_score(readme_text)
        features["readme_word_count"] = FeatureService._word_count(readme_text)
        features["readme_sentence_count"] = FeatureService._sentence_count(readme_text)
        features["readme_flesch_reading_ease"] = FeatureService._flesch_reading_ease(readme_text)
        features["readme_code_block_count"] = readme_text.count("```") // 2
        features["readme_link_count"] = len(re.findall(r"https?://", readme_text, flags=re.IGNORECASE))
        features["readme_table_count"] = sum(1 for line in readme_text.splitlines() if "|" in line)
        features["readme_excerpt"] = readme_text[:1500]

        return features

    @staticmethod
    def _readme_text(readme) -> str:
        if isinstance(readme, str):
            return readme

        if isinstance(readme, dict) and "content" in readme:
            raw_content = readme.get("content") or ""
            if not isinstance(raw_content, str):
                return ""

            try:
                return base64.b64decode(raw_content).decode("utf-8", errors="ignore")
            except Exception:
                return ""

        return ""

    @staticmethod
    def _recent_commit_score(commits):
        if not commits:
            return 0

        if not commits or "commit" not in commits[0]:
            return 0

        latest = commits[0]["commit"]["author"]["date"]
        latest_date = datetime.fromisoformat(latest.replace("Z", ""))

        days = (datetime.utcnow() - latest_date).days

        if days < 7:
            return 100
        elif days < 30:
            return 70
        elif days < 90:
            return 40
        return 10

    @staticmethod
    def _pr_merge_ratio(pulls):
        if not pulls:
            return 0
        merged = [p for p in pulls if p.get("merged_at")]
        return len(merged) / len(pulls)

    @staticmethod
    def _issue_closure_rate(issues):
        if not issues:
            return 0
        closed = [i for i in issues if i.get("state") == "closed"]
        return len(closed) / len(issues)

    @staticmethod
    def _count_readme_sections(readme_text: str) -> int:
        if not readme_text:
            return 0
        return sum(1 for line in readme_text.splitlines() if line.strip().startswith("#"))

    @staticmethod
    def _readme_keyword_score(readme_text: str) -> int:
        if not readme_text:
            return 0

        lower = readme_text.lower()
        keywords = [
            "install",
            "usage",
            "contributing",
            "license",
            "api",
            "example",
            "features",
        ]
        hits = sum(1 for keyword in keywords if keyword in lower)
        return round((hits / len(keywords)) * 100)

    @staticmethod
    def _word_count(text: str) -> int:
        if not text:
            return 0
        return len(re.findall(r"\b[\w'-]+\b", text))

    @staticmethod
    def _sentence_count(text: str) -> int:
        if not text:
            return 0
        return max(1, len(re.findall(r"[.!?]+", text)))

    @staticmethod
    def _syllable_count(word: str) -> int:
        cleaned = re.sub(r"[^a-z]", "", word.lower())
        if not cleaned:
            return 0

        groups = re.findall(r"[aeiouy]+", cleaned)
        syllables = len(groups)

        if cleaned.endswith("e") and syllables > 1:
            syllables -= 1

        return max(1, syllables)

    @staticmethod
    def _flesch_reading_ease(text: str) -> float:
        if not text:
            return 0.0

        words = re.findall(r"\b[\w'-]+\b", text)
        word_count = len(words)
        if word_count == 0:
            return 0.0

        sentence_count = FeatureService._sentence_count(text)
        syllables = sum(FeatureService._syllable_count(word) for word in words)

        # Flesch Reading Ease: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
        score = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllables / word_count)
        if math.isnan(score) or math.isinf(score):
            return 0.0
        return max(0.0, min(100.0, float(score)))

    @staticmethod
    def _repo_age_days(repo: dict) -> int:
        created_at = str(repo.get("created_at") or "")
        if not created_at:
            return 365

        try:
            created_date = datetime.fromisoformat(created_at.replace("Z", ""))
            age_days = max(1, (datetime.utcnow() - created_date).days)
            return age_days
        except ValueError:
            return 365

    @staticmethod
    def _top_contributor_share(contributors: list[dict]) -> float:
        if not contributors:
            return 0.0

        contributions = [float(c.get("contributions", 0) or 0) for c in contributors]
        total = sum(contributions)
        if total <= 0:
            return 0.0

        top = max(contributions)
        return max(0.0, min(1.0, top / total))
