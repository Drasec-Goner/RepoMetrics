import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain, faScaleBalanced, faStar } from "@fortawesome/free-solid-svg-icons";

interface Props {
  finalScore: number;
  grade: string;
  ruleScores: Record<string, number>;
  aiScores: Record<string, number>;
  aiSummary: string;
  aiVerdict?: string;
}

const average = (values: number[]) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const verdictFromScores = (finalScore: number, nlpScore: number) => {
  if (finalScore >= 80 && nlpScore >= 75) {
    return "Excellent quality profile: strong engineering signals across both measured metrics and AI assessment.";
  }

  if (finalScore >= 65 && nlpScore >= 60) {
    return "Good repository health with clear strengths and a few targeted gaps to address.";
  }

  if (finalScore >= 45) {
    return "Moderate maturity: usable foundation, but several core quality indicators need focused improvements.";
  }

  return "Low maturity/risk-prone profile: prioritize documentation, collaboration, and issue resolution to improve trust.";
};

const ScoreExplanationCard = ({ finalScore, grade, ruleScores, aiScores, aiSummary, aiVerdict }: Props) => {
  const ruleScore = average(Object.values(ruleScores));
  const nlpScore = average(Object.values(aiScores));
  const verdict = aiVerdict?.trim() || verdictFromScores(finalScore, nlpScore);

  return (
    <div className="bg-cardDark/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg space-y-4 border border-slate-700/70">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FontAwesomeIcon icon={faScaleBalanced} className="text-cyan-300" /> How This Score Was Calculated
      </h3>

      <p className="text-sm text-slate-300 leading-relaxed">
        Interpretation: the rule score reflects measurable repository signals, while the AI/NLP score captures contextual quality from docs and patterns.
        The final result balances both so one noisy metric cannot dominate the outcome.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-900/50 p-4 border border-slate-700">
          <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-2">
            <FontAwesomeIcon icon={faScaleBalanced} className="text-cyan-300" /> Rule Score (60%)
          </p>
          <p className="text-2xl font-bold text-cyan-300">{ruleScore.toFixed(1)}</p>
        </div>

        <div className="rounded-xl bg-slate-900/50 p-4 border border-slate-700">
          <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-2">
            <FontAwesomeIcon icon={faBrain} className="text-violet-300" /> AI / NLP Score (40%)
          </p>
          <p className="text-2xl font-bold text-violet-300">{nlpScore.toFixed(1)}</p>
        </div>

        <div className="rounded-xl bg-slate-900/50 p-4 border border-slate-700">
          <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-2">
            <FontAwesomeIcon icon={faStar} className="text-primary" /> Final Grade
          </p>
          <p className="text-2xl font-bold text-primary">{grade}</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
        <p className="text-sm font-semibold text-primary">Final Verdict</p>
        <p className="text-sm text-gray-200 mt-1 leading-relaxed">{verdict}</p>
      </div>

      {aiSummary && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <p className="text-sm font-semibold text-gray-200">AI Context</p>
          <p className="text-sm text-gray-300 mt-1 leading-relaxed">{aiSummary}</p>
        </div>
      )}
    </div>
  );
};

export default ScoreExplanationCard;
