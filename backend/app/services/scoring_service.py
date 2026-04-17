import math
from datetime import datetime


class ScoringService:
    """
    Deterministic scoring helpers.

    Research-backed techniques used here:
    - Wilson lower bound for small-sample proportion robustness.
    - Exponential time decay for commit recency weighting.
    - Log/saturating transforms for heavy-tailed popularity signals.
    """

    @staticmethod
    def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
        return max(low, min(high, float(value)))

    @staticmethod
    def clamp01(value: float) -> float:
        return max(0.0, min(1.0, float(value)))

    @staticmethod
    def normalize(value: float, max_value: float) -> float:
        if max_value <= 0:
            return 0.0
        return ScoringService.clamp01(value / max_value)

    @staticmethod
    def log_normalized(value: float, cap: float) -> float:
        if cap <= 0:
            return 0.0
        v = max(0.0, min(float(value), cap))
        return ScoringService.normalize(math.log1p(v), math.log1p(cap))

    @staticmethod
    def saturating(value: float, k: float) -> float:
        if k <= 0:
            return 0.0
        v = max(0.0, float(value))
        return 1.0 - math.exp(-v / k)

    @staticmethod
    def wilson_lower_bound(successes: float, total: float, z: float = 1.96) -> float:
        n = max(0.0, float(total))
        if n <= 0:
            return 0.0

        p = ScoringService.clamp01(float(successes) / n)
        z2 = z * z
        denominator = 1.0 + (z2 / n)
        center = p + (z2 / (2.0 * n))
        margin = z * math.sqrt((p * (1.0 - p) / n) + (z2 / (4.0 * n * n)))
        return ScoringService.clamp01((center - margin) / denominator)

    @staticmethod
    def confidence_adjusted_ratio(ratio: float, total: float, z: float = 1.96) -> float:
        r = ScoringService.clamp01(ratio)
        n = max(0.0, float(total))
        return ScoringService.wilson_lower_bound(r * n, n, z=z)

    @staticmethod
    def recency_activity_score(commit_dates: list[datetime], half_life_days: float = 30.0, horizon_days: int = 180) -> float:
        if not commit_dates:
            return 0.0

        now = datetime.utcnow()
        decay = math.log(2) / max(1.0, half_life_days)
        weighted_sum = 0.0
        commits_in_window = 0

        for commit_date in commit_dates:
            days_old = max(0.0, (now - commit_date).total_seconds() / 86400.0)
            if days_old > horizon_days:
                continue
            commits_in_window += 1
            weighted_sum += math.exp(-decay * days_old)

        if commits_in_window == 0:
            return 0.0

        # Using a saturating curve prevents very high commit volume from dominating.
        volume_signal = ScoringService.saturating(commits_in_window, 40.0)
        recency_signal = ScoringService.saturating(weighted_sum, 18.0)
        return ScoringService.clamp((0.35 * volume_signal + 0.65 * recency_signal) * 100.0)

    @staticmethod
    def calculate_rule_scores(features: dict, commit_dates: list[datetime]) -> dict:
        commit_count = float(features.get("commit_count", 0) or 0)
        contributor_count = float(features.get("contributors", 0) or 0)
        pr_total = float(features.get("pr_total", 0) or 0)
        pr_merged_ratio = float(features.get("pr_merged_ratio", 0) or 0)
        issue_closure_rate = float(features.get("issue_closure_rate", 0) or 0)

        stars = float(features.get("stars", 0) or 0)
        forks = float(features.get("forks", 0) or 0)
        subscribers = float(features.get("subscribers_count", 0) or 0)
        watchers = float(features.get("watchers_count", 0) or 0)

        open_issues = float(features.get("open_issues_count", 0) or 0)
        readme_length = float(features.get("readme_length", 0) or 0)
        readme_keywords = float(features.get("readme_keyword_score", 0) or 0)
        readme_sections = float(features.get("readme_section_count", 0) or 0)
        readme_flesch = float(features.get("readme_flesch_reading_ease", 0) or 0)
        readme_words = float(features.get("readme_word_count", 0) or 0)

        has_readme = bool(features.get("has_readme"))
        has_wiki = bool(features.get("has_wiki"))
        license_present = bool(features.get("license_present"))

        activity = ScoringService.recency_activity_score(commit_dates)

        merge_conf = ScoringService.confidence_adjusted_ratio(pr_merged_ratio, pr_total)
        contributor_signal = ScoringService.log_normalized(contributor_count, 50.0)
        collaboration = ScoringService.clamp((0.7 * merge_conf + 0.3 * contributor_signal) * 100.0)

        readability_signal = ScoringService.normalize(readme_flesch, 100.0)
        structure_signal = ScoringService.normalize(readme_sections, 12.0)
        depth_signal = ScoringService.log_normalized(readme_words, 2500.0)
        keyword_signal = ScoringService.normalize(readme_keywords, 100.0)
        readme_presence = 1.0 if has_readme else 0.0

        documentation = ScoringService.clamp(
            (
                0.20 * readme_presence
                + 0.25 * depth_signal
                + 0.20 * structure_signal
                + 0.20 * keyword_signal
                + 0.10 * readability_signal
                + (0.05 if has_wiki else 0.0)
            )
            * 100.0
        )

        closure_conf = ScoringService.confidence_adjusted_ratio(
            issue_closure_rate,
            max(open_issues, 1.0) + max(float(features.get("closed_issues_count", 0) or 0), 0.0),
        )
        issue_burden = 1.0 - ScoringService.log_normalized(open_issues, 500.0)
        stability = ScoringService.clamp((0.65 * closure_conf + 0.35 * issue_burden) * 100.0)

        popularity = ScoringService.clamp(
            (
                0.55 * ScoringService.log_normalized(stars, 100000.0)
                + 0.20 * ScoringService.log_normalized(forks, 30000.0)
                + 0.15 * ScoringService.log_normalized(watchers, 100000.0)
                + 0.05 * ScoringService.log_normalized(subscribers, 15000.0)
                + (0.05 if license_present else 0.0)
            )
            * 100.0
        )

        # Blend a light long-horizon commit signal into activity to reduce volatility.
        long_horizon_signal = ScoringService.log_normalized(commit_count, 5000.0) * 100.0
        activity = ScoringService.clamp((0.75 * activity) + (0.25 * long_horizon_signal))

        return {
            "activity": round(activity, 2),
            "collaboration": round(collaboration, 2),
            "documentation": round(documentation, 2),
            "stability": round(stability, 2),
            "popularity": round(popularity, 2),
        }

    @staticmethod
    def feature_signal_quality(features: dict) -> float:
        checks = [
            bool(features.get("has_readme")),
            float(features.get("commit_count", 0) or 0) > 0,
            float(features.get("contributors", 0) or 0) > 0,
            float(features.get("pr_total", 0) or 0) > 0,
            float(features.get("open_issues_count", 0) or 0) >= 0,
            float(features.get("stars", 0) or 0) >= 0,
        ]
        return round(sum(1 for ok in checks if ok) / len(checks), 3)