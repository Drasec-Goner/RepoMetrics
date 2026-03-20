import json

def calculate_ai_score(ai_metrics):

    documentation = ai_metrics.get("documentation", 0)
    clarity = ai_metrics.get("clarity", 0)
    maintainability = ai_metrics.get("maintainability", 0)
    community = ai_metrics.get("community", 0)

    score = (
        0.35 * documentation +
        0.25 * clarity +
        0.25 * maintainability +
        0.15 * community
    )

    return round(score, 2)


def parse_ai_response(ai_response):

    try:
        data = json.loads(ai_response)
        return data
    except:
        return {
            "documentation": 70,
            "clarity": 70,
            "maintainability": 70,
            "community": 70
        }