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
    def commit_rhythm_stability(commit_dates: list[datetime], horizon_days: int = 180) -> float:
        if not commit_dates:
            return 0.5

        now = datetime.utcnow()
        filtered = [dt for dt in sorted(commit_dates) if (now - dt).days <= horizon_days]
        if len(filtered) < 3:
            return 0.5

        intervals = []
        for idx in range(1, len(filtered)):
            interval_days = max(0.0, (filtered[idx] - filtered[idx - 1]).total_seconds() / 86400.0)
            intervals.append(interval_days)

        if not intervals:
            return 0.5

        mean_gap = sum(intervals) / len(intervals)
        if mean_gap <= 0:
            return 1.0

        variance = sum((gap - mean_gap) ** 2 for gap in intervals) / len(intervals)
        std_dev = math.sqrt(max(0.0, variance))
        coeff_variation = std_dev / mean_gap

        # Lower variation indicates more stable cadence. 0.9 maps near neutral.
        return ScoringService.clamp01(1.0 - (coeff_variation / 0.9))

    @staticmethod
    def calculate_rule_scores(features: dict, commit_dates: list[datetime]) -> dict:
        commit_count = float(features.get("commit_count", 0) or 0)
        contributor_count = float(features.get("contributors", 0) or 0)
        pr_total = float(features.get("pr_total", 0) or 0)
        pr_merged_ratio = float(features.get("pr_merged_ratio", 0) or 0)
        issue_closure_rate = float(features.get("issue_closure_rate", 0) or 0)
        issue_closure_per_month = float(features.get("issue_closure_per_month", 0) or 0)
        commit_frequency_per_month = float(features.get("commit_frequency_per_month", 0) or 0)
        pr_frequency_per_month = float(features.get("pr_frequency_per_month", 0) or 0)
        bus_factor_proxy = float(features.get("bus_factor_proxy", 0) or 0)
        release_count = float(features.get("release_count", 0) or 0)

        stars = float(features.get("stars", 0) or 0)
        forks = float(features.get("forks", 0) or 0)
        subscribers = float(features.get("subscribers_count", 0) or 0)
        watchers = float(features.get("watchers_count", 0) or 0)
        stars_per_month = float(features.get("stars_per_month", 0) or 0)

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
        rhythm_stability = ScoringService.commit_rhythm_stability(commit_dates)

        merge_conf = ScoringService.confidence_adjusted_ratio(pr_merged_ratio, pr_total)
        merge_ratio_signal = ScoringService.clamp01(pr_merged_ratio)
        contributor_signal = ScoringService.log_normalized(contributor_count, 50.0)
        participation_signal = ScoringService.saturating(pr_total + contributor_count, 30.0)
        collaboration = ScoringService.clamp(
            (
                0.42 * (0.6 * merge_conf + 0.4 * merge_ratio_signal)
                + 0.38 * contributor_signal
                + 0.20 * participation_signal
            )
            * 100.0
        )
        # Avoid overly harsh collaboration penalties for small but actively maintained repositories.
        if contributor_count >= 1 and commit_count >= 25 and pr_total <= 2:
            collaboration = max(collaboration, 35.0)

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
        issue_velocity = ScoringService.saturating(issue_closure_per_month, 8.0)
        release_signal = ScoringService.saturating(release_count, 18.0)
        stability = ScoringService.clamp(
            (
                0.40 * closure_conf
                + 0.22 * issue_burden
                + 0.16 * issue_velocity
                + 0.12 * rhythm_stability
                + 0.10 * max(0.0, min(1.0, bus_factor_proxy))
            )
            * 100.0
        )
        # Small stabilization bonus for projects with regular release practice.
        stability = ScoringService.clamp((0.92 * stability) + (0.08 * (release_signal * 100.0)))

        popularity_signal = (
            0.55 * ScoringService.log_normalized(stars, 100000.0)
            + 0.20 * ScoringService.log_normalized(forks, 30000.0)
            + 0.15 * ScoringService.log_normalized(watchers, 100000.0)
            + 0.05 * ScoringService.log_normalized(subscribers, 15000.0)
            + 0.03 * ScoringService.saturating(stars_per_month, 15.0)
            + (0.02 if license_present else 0.0)
        )
        # Keep popularity as a positive signal without making smaller/new repos look disproportionately poor.
        popularity = ScoringService.clamp(25.0 + (75.0 * popularity_signal))

        # Blend long-horizon and age-normalized delivery signals to reduce temporal bias.
        long_horizon_signal = ScoringService.log_normalized(commit_count, 5000.0) * 100.0
        cadence_signal = ScoringService.saturating(commit_frequency_per_month, 12.0) * 100.0
        flow_signal = ScoringService.saturating(pr_frequency_per_month, 10.0) * 100.0
        activity = ScoringService.clamp(
            (0.52 * activity)
            + (0.18 * long_horizon_signal)
            + (0.20 * cadence_signal)
            + (0.10 * flow_signal)
        )

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