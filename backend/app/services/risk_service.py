class RiskService:

    @staticmethod
    def calculate_risk_score(analysis: dict, repo: dict) -> dict:
        score = analysis["score"]
        activity = analysis["breakdown"]["activity"]
        maintainability = analysis["breakdown"]["maintainability"]
        open_issues = repo["open_issues"]

        risk = 0
        reasons = []

        # Low activity → higher risk
        if activity < 40:
            risk += 30
            reasons.append("Low development activity")

        # Too many issues → higher risk
        if open_issues > 500:
            risk += 30
            reasons.append("High number of unresolved issues")

        elif open_issues > 100:
            risk += 15
            reasons.append("Moderate number of unresolved issues")

        # Poor maintainability
        if maintainability < 60:
            risk += 25
            reasons.append("Poor documentation or maintainability")

        # Low overall score
        if score < 60:
            risk += 20
            reasons.append("Low overall repository health score")

        # Normalize to 100
        risk_score = min(risk, 100)

        # Classification
        if risk_score >= 75:
            level = "Critical"
        elif risk_score >= 50:
            level = "High"
        elif risk_score >= 25:
            level = "Medium"
        else:
            level = "Low"

        return {
            "risk_score": risk_score,
            "risk_level": level,
            "reasons": reasons
        }