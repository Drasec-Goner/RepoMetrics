class HybridService:

    @staticmethod
    def combine_scores(rule_scores: dict, ai_scores: dict):
        final = {}

        for key in rule_scores:
            rule = rule_scores[key]
            ai = ai_scores.get(key, rule)

            final[key] = round((rule * 0.6 + ai * 0.4), 2)

        overall = sum(final.values()) / len(final)

        return {
            "category_scores": final,
            "overall_score": round(overall, 2)
        }# ui: implement radar chart at 2026-04-01 10:52:00
