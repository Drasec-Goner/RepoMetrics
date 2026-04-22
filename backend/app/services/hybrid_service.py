class HybridService:

    _CATEGORY_WEIGHTS = {
        "activity": 0.26,
        "collaboration": 0.24,
        "documentation": 0.22,
        "stability": 0.22,
        "popularity": 0.06,
    }

    @staticmethod
    def _clamp01(value: float) -> float:
        return max(0.0, min(1.0, float(value)))

    @staticmethod
    def combine_scores(
        rule_scores: dict,
        ai_scores: dict,
        ai_confidence: float | None = None,
        feature_signal_quality: float | None = None,
        ai_score_coverage: float | None = None,
    ):
        final = {}
        details = {}

        ai_conf = HybridService._clamp01(ai_confidence if isinstance(ai_confidence, (int, float)) else 0.5)
        signal_quality = HybridService._clamp01(feature_signal_quality if isinstance(feature_signal_quality, (int, float)) else 0.5)
        score_coverage = HybridService._clamp01(ai_score_coverage if isinstance(ai_score_coverage, (int, float)) else 1.0)

        # Adaptive blend: increase AI influence only when confidence and input quality are strong.
        base_ai_weight = 0.2 + (0.45 * ((ai_conf * 0.7) + (signal_quality * 0.3)))
        ai_weight = base_ai_weight * score_coverage
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
                "overall_weight": round(HybridService._CATEGORY_WEIGHTS.get(key, 0.0), 3),
                "weights": {
                    "rule_weight": round(rule_weight, 3),
                    "ai_weight": round(ai_weight, 3),
                },
            }

        if final:
            weighted_total = 0.0
            total_weight = 0.0
            for key, value in final.items():
                weight = float(HybridService._CATEGORY_WEIGHTS.get(key, 0.0))
                if weight <= 0:
                    continue
                weighted_total += value * weight
                total_weight += weight

            overall = (weighted_total / total_weight) if total_weight > 0 else (sum(final.values()) / len(final))
        else:
            overall = 0

        return {
            "category_scores": final,
            "overall_score": round(overall, 2),
            "category_details": details,
            "blend": {
                "rule_weight": round(rule_weight, 3),
                "ai_weight": round(ai_weight, 3),
                "ai_confidence": round(ai_conf, 3),
                "feature_signal_quality": round(signal_quality, 3),
                "ai_score_coverage": round(score_coverage, 3),
            },
        }
