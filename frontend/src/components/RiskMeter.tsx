import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faShieldHeart } from "@fortawesome/free-solid-svg-icons";

interface Props {
  score: number;
  riskScore?: number;
  meaning?: string;
  reasons?: string[];
}

const getRiskLevel = (score: number) => {
  if (score >= 80) return "Low";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "High";
  return "Critical";
};

const RiskMeter = ({ score, riskScore, meaning, reasons = [] }: Props) => {
  const level = getRiskLevel(score);
  const normalizedRiskScore = typeof riskScore === "number" ? riskScore : Math.max(0, Math.min(100, 100 - score));

  return (
    <div className="bg-cardDark/95 backdrop-blur-sm p-6 rounded-2xl space-y-3 border border-slate-700/70 shadow-lg">
      <h3 className="mb-2 font-medium flex items-center gap-2">
        <FontAwesomeIcon icon={faShieldHeart} className="text-cyan-300" /> Risk Level
      </h3>
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold flex items-center gap-2">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-300" /> {level}
        </p>
        <p className="text-sm text-gray-400">Risk Score: {normalizedRiskScore}</p>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Lower risk score is better. It summarizes where delivery or maintainability problems are more likely to appear first.
      </p>

      <p className="text-sm text-gray-300 leading-relaxed">
        {meaning || "Risk level indicates how likely maintainability or delivery issues are based on quality, activity, stability, and documentation signals."}
      </p>

      {reasons.length > 0 && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Top Risk Drivers</p>
          <ul className="space-y-1">
            {reasons.map((reason, index) => (
              <li key={index} className="text-sm text-gray-200">- {reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskMeter;