import math


class ScoringService:

    @staticmethod
    def normalize(value: float, max_value: float) -> float:
        if max_value == 0:
            return 0
        return min(value / max_value, 1)

    @staticmethod
    def log_scale(value: float) -> float:
        return math.log(value + 1)

    @staticmethod
    def calculate_popularity_score(stars: int, forks: int) -> float:
        stars_score = ScoringService.log_scale(stars)
        forks_score = ScoringService.log_scale(forks)

        normalized_stars = ScoringService.normalize(stars_score, 10)
        normalized_forks = ScoringService.normalize(forks_score, 8)

        return (normalized_stars * 0.7 + normalized_forks * 0.3) * 100

    @staticmethod
    def calculate_activity_score(open_issues: int) -> float:
        if open_issues == 0:
            return 100
        if open_issues < 10:
            return 80
        if open_issues < 50:
            return 60
        if open_issues < 200:
            return 40
        return 20

    @staticmethod
    def calculate_maintainability_score(description: str | None) -> float:
        if not description:
            return 40
        if len(description) < 20:
            return 60
        return 100

    @staticmethod
    def calculate_final_score(popularity: float, activity: float, maintainability: float) -> dict:
        final_score = (
            popularity * 0.5 +
            activity * 0.3 +
            maintainability * 0.2
        )

        if final_score >= 85:
            grade = "A"
        elif final_score >= 70:
            grade = "B"
        elif final_score >= 50:
            grade = "C"
        else:
            grade = "D"

        return {
            "score": round(final_score, 2),
            "grade": grade,
            "breakdown": {
                "popularity": round(popularity, 2),
                "activity": round(activity, 2),
                "maintainability": round(maintainability, 2)
            }
        }