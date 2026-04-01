def traditional_score(features):

    activity = min(features["commits"] / 200, 1) * 100
    collaboration = min(features["contributors"] / 20, 1) * 100
    popularity = min(features["stars"] / 5000, 1) * 100

    score = (
        0.4 * activity +
        0.3 * collaboration +
        0.3 * popularity
    )

    return round(score, 2)


def final_score(traditional, ai):

    score = 0.6 * traditional + 0.4 * ai

    return round(score, 2)


def classify_repo(score):

    if score >= 90:
        return "Excellent Repository"
    elif score >= 75:
        return "Well Maintained"
    elif score >= 60:
        return "Moderate Quality"
    elif score >= 40:
        return "Needs Improvement"
    else:
        return "Poor Repository Health"