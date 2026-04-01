def calculate_risk(features, ai_metrics):

    commit_score = min(features["commits"] / 200, 1)
    contributor_score = min(features["contributors"] / 20, 1)

    issue_risk = min(features["issues"] / 100, 1)

    doc_score = ai_metrics.get("documentation", 50) / 100
    maintain_score = ai_metrics.get("maintainability", 50) / 100

    health = (
        0.25 * commit_score +
        0.20 * contributor_score +
        0.20 * doc_score +
        0.20 * maintain_score -
        0.15 * issue_risk
    )

    health = max(0, min(1, health))

    risk_score = round((1 - health) * 100, 2)

    return risk_score

def classify_risk(score):

    if score < 25:
        return "Low Risk"

    elif score < 50:
        return "Moderate Risk"

    elif score < 75:
        return "High Risk"

    else:
        return "Critical Risk"