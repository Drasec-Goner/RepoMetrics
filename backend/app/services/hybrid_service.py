class HybridService:

    @staticmethod
    def combine_scores(rule_scores: dict, ai_scores: dict):
        final = {}
        details = {}

        for key in rule_scores:
            rule = float(rule_scores[key])
            ai_raw = ai_scores.get(key, rule)
            ai = float(ai_raw) if isinstance(ai_raw, (int, float)) else rule

            final_score = round((rule * 0.6 + ai * 0.4), 2)
            final[key] = final_score
            details[key] = {
                "rule": round(rule, 2),
                "ai": round(ai, 2),
                "final": final_score,
            }

        overall = sum(final.values()) / len(final) if final else 0

        return {
            "category_scores": final,
            "overall_score": round(overall, 2),
            "category_details": details,
        }
# ui: implement radar chart at 2026-04-01 10:52:00
# ui: optimize API calls at 2026-04-12 12:52:00
# docs: refactor feature extraction at 2026-03-20 21:56:00
# fix: build dashboard UI at 2026-03-21 11:39:00
# perf: final polishing and cleanup at 2026-04-12 19:44:00
