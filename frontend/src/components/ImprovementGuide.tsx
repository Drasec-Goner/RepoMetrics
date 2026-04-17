interface CategoryDetail {
  rule: number;
  ai: number;
  final: number;
}

interface Props {
  details: Record<string, CategoryDetail>;
  currentScore: number;
  currentGrade: string;
}

const TITLES: Record<string, string> = {
  activity: "Activity",
  collaboration: "Collaboration",
  documentation: "Documentation",
  stability: "Stability",
  popularity: "Popularity",
};

const SUGGESTIONS: Record<string, string[]> = {
  activity: [
    "Increase commit cadence with smaller, consistent updates.",
    "Maintain a changelog to make progress visible and auditable.",
    "Plan milestone-based releases to demonstrate active maintenance.",
  ],
  collaboration: [
    "Review and merge pull requests faster to improve contribution flow.",
    "Add CONTRIBUTING guidelines and issue templates.",
    "Use labels and project boards to coordinate contributor work.",
  ],
  documentation: [
    "Expand README with setup, usage, architecture, and troubleshooting.",
    "Add API/reference docs and examples for key workflows.",
    "Keep docs updated in every release cycle.",
  ],
  stability: [
    "Triage and close stale issues regularly.",
    "Add automated tests for critical paths and bug regressions.",
    "Track reliability metrics (bugs, incident rate, fix lead time).",
  ],
  popularity: [
    "Improve project discoverability through clear tags/topics and releases.",
    "Share updates/changelogs in community channels.",
    "Showcase use-cases and demos to increase adoption interest.",
  ],
};

const impactLabel = (gap: number) => {
  if (gap >= 45) return "Very High Impact";
  if (gap >= 30) return "High Impact";
  if (gap >= 15) return "Moderate Impact";
  return "Incremental Impact";
};

const gradeFromScore = (score: number) => {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
};

const estimateCategoryLift = (finalCategoryScore: number) => {
  const gapTo100 = Math.max(0, 100 - finalCategoryScore);
  // Conservative lift estimate: a practical iteration rarely closes the full gap.
  return Math.min(25, gapTo100 * 0.35);
};

const ImprovementGuide = ({ details, currentScore, currentGrade }: Props) => {
  const entries = Object.entries(details || {});

  if (entries.length === 0) {
    return null;
  }

  return (
    <details className="bg-cardDark rounded-2xl shadow-lg border border-slate-700/70 overflow-hidden">
      <summary className="cursor-pointer list-none p-6 select-none">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Improvement Guide</h3>
            <p className="text-sm text-gray-400 mt-1">
              Expand to see practical actions that can improve each scoring category.
            </p>
          </div>
          <span className="text-xs uppercase tracking-wide text-primary font-semibold">Open</span>
        </div>
      </summary>

      <div className="px-6 pb-6">
        <div className="grid md:grid-cols-2 gap-4">
          {entries.map(([key, values]) => {
            const title = TITLES[key] || key;
            const gap = Math.max(0, 100 - Number(values.final || 0));
            const suggestions = SUGGESTIONS[key] || ["Improve measurable quality indicators in this area."];
            const liftForCategory = estimateCategoryLift(Number(values.final || 0));
            const categoryCount = Math.max(entries.length, 1);
            const estimatedOverallGain = liftForCategory / categoryCount;
            const projectedScore = Math.min(100, currentScore + estimatedOverallGain);
            const projectedGrade = gradeFromScore(projectedScore);

            return (
              <div key={key} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-white">{title}</h4>
                  <span className="text-xs rounded-full px-2 py-1 border border-cyan-400/40 text-cyan-300">
                    {impactLabel(gap)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md bg-slate-800/70 p-2 text-gray-300">Rule: {values.rule.toFixed(1)}</div>
                  <div className="rounded-md bg-slate-800/70 p-2 text-gray-300">AI: {values.ai.toFixed(1)}</div>
                  <div className="rounded-md bg-slate-800/70 p-2 text-gray-300">Final: {values.final.toFixed(1)}</div>
                </div>

                <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">
                  <p className="text-gray-200">
                    Estimated improvement if this area is strengthened: <span className="font-semibold text-cyan-300">+{estimatedOverallGain.toFixed(1)}</span> overall points
                  </p>
                  <p className="text-gray-300 mt-1">
                    Projected overall: <span className="font-semibold">{projectedScore.toFixed(1)}</span> ({projectedGrade})
                    <span className="text-xs text-gray-400"> from current {currentScore.toFixed(1)} ({currentGrade})</span>
                  </p>
                </div>

                <ul className="space-y-1">
                  {suggestions.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-200">- {item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
};

export default ImprovementGuide;
