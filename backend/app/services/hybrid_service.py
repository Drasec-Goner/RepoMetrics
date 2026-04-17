class HybridService:

    @staticmethod
    def _clamp01(value: float) -> float:
        return max(0.0, min(1.0, float(value)))

    @staticmethod
    def combine_scores(
        rule_scores: dict,
        ai_scores: dict,
        ai_confidence: float | None = None,
        feature_signal_quality: float | None = None,
    ):
        final = {}
        details = {}

        ai_conf = HybridService._clamp01(ai_confidence if isinstance(ai_confidence, (int, float)) else 0.5)
        signal_quality = HybridService._clamp01(feature_signal_quality if isinstance(feature_signal_quality, (int, float)) else 0.5)

        # Adaptive blend: increase AI influence only when confidence and input quality are strong.
        ai_weight = 0.2 + (0.45 * ((ai_conf * 0.7) + (signal_quality * 0.3)))
        rule_weight = 1.0 - ai_weight

        for key in rule_scores:
            rule = float(rule_scores[key])
            ai_raw = ai_scores.get(key, rule)
            ai = float(ai_raw) if isinstance(ai_raw, (int, float)) else rule

            final_score = round((rule * rule_weight + ai * ai_weight), 2)
            final[key] = final_score
            details[key] = {
                "rule": round(rule, 2),
                "ai": round(ai, 2),
                "final": final_score,
                "weights": {
                    "rule_weight": round(rule_weight, 3),
                    "ai_weight": round(ai_weight, 3),
                },
            }

        overall = sum(final.values()) / len(final) if final else 0

        return {
            "category_scores": final,
            "overall_score": round(overall, 2),
            "category_details": details,
            "blend": {
                "rule_weight": round(rule_weight, 3),
                "ai_weight": round(ai_weight, 3),
                "ai_confidence": round(ai_conf, 3),
                "feature_signal_quality": round(signal_quality, 3),
            },
        }
