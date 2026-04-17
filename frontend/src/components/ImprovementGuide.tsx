import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faBullseye,
  faCheck,
  faChevronDown,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { AnalysisResponse } from "../types";

interface CategoryDetail {
  rule: number;
  ai: number;
  final: number;
}

interface Props {
  details: Record<string, CategoryDetail>;
  currentScore: number;
  currentGrade: string;
  analysis?: AnalysisResponse["ai_analysis"];
}

const TITLES: Record<string, string> = {
  activity: "Activity",
  collaboration: "Collaboration",
  documentation: "Documentation",
  stability: "Stability",
  popularity: "Popularity",
};

// Fallback suggestions if AI doesn't provide them
const FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  activity: [
    "Commit at least weekly with meaningful messages to demonstrate active maintenance.",
    "Create structured releases every 1-2 months with detailed changelog updates.",
    "Automate repetitive tasks with CI/CD to free bandwidth for feature development.",
  ],
  collaboration: [
    "Aim for <48 hour PR review/merge time and provide constructive feedback quickly.",
    "Create detailed CONTRIBUTING.md with setup instructions and coding standards.",
    "Set up GitHub issue/PR templates to standardize collaboration and reduce back-and-forth.",
  ],
  documentation: [
    "Write comprehensive README covering: installation, usage examples, and contributing steps.",
    "Add architecture documentation and API reference docs for core modules.",
    "Keep docs in sync with releases—update them in the same PR that introduces changes.",
  ],
  stability: [
    "Close or resolve issues within 30 days to keep backlog manageable and healthy.",
    "Add integration tests for critical workflows to catch regressions early.",
    "Track and publish metrics: bug count, incident response time, and fix lead time.",
  ],
  popularity: [
    "Add 3-5 relevant GitHub topics and create descriptive release notes with highlights.",
    "Share project updates on social media, dev communities, and blogs quarterly.",
    "Build and showcase 2-3 real-world use-case examples or demos in the README.",
  ],
};

type ImpactTier = "critical" | "high" | "moderate" | "incremental";

const impactMeta: Record<ImpactTier, { label: string; badgeClass: string; barClass: string }> = {
  critical: {
    label: "Top Priority",
    badgeClass: "border-rose-400/40 text-rose-200 bg-rose-400/10",
    barClass: "bg-rose-300",
  },
  high: {
    label: "High Impact",
    badgeClass: "border-amber-400/40 text-amber-200 bg-amber-400/10",
    barClass: "bg-amber-300",
  },
  moderate: {
    label: "Moderate Impact",
    badgeClass: "border-cyan-400/40 text-cyan-200 bg-cyan-400/10",
    barClass: "bg-cyan-300",
  },
  incremental: {
    label: "Incremental",
    badgeClass: "border-slate-500/50 text-slate-300 bg-slate-700/20",
    barClass: "bg-slate-400",
  },
};

const impactTierByRank = (rank: number, total: number): ImpactTier => {
  if (total <= 1) return "critical";

  const normalizedRank = rank / Math.max(total - 1, 1);
  if (normalizedRank <= 0.2) return "critical";
  if (normalizedRank <= 0.45) return "high";
  if (normalizedRank <= 0.75) return "moderate";
  return "incremental";
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

const ImprovementGuide = ({ details, currentScore, currentGrade, analysis }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const entries = Object.entries(details || {});

  const rankedKeys = [...entries]
    .sort(([, a], [, b]) => {
      const liftA = estimateCategoryLift(Number(a.final || 0));
      const liftB = estimateCategoryLift(Number(b.final || 0));
      return liftB - liftA;
    })
    .map(([key]) => key);

  const rankIndex = new Map(rankedKeys.map((key, index) => [key, index]));

  // Get categorized recommendations from AI or fallback
  const categorizedRecs = analysis?.categorized_recommendations ?? {
    activity: [],
    collaboration: [],
    documentation: [],
    stability: [],
    popularity: [],
  };

  if (entries.length === 0) {
    return null;
  }

  // Calculate total projected score if all improvements are implemented
  const totalLift = entries.reduce((sum, [, values]) => {
    const liftForCategory = estimateCategoryLift(Number(values.final || 0));
    return sum + liftForCategory;
  }, 0);
  const totalProjectedScore = Math.min(100, currentScore + totalLift);
  const totalProjectedGrade = gradeFromScore(totalProjectedScore);

  // Count implemented vs recommended
  const allRecommendations = Object.values(categorizedRecs).flat();
  const implementedCount = allRecommendations.filter((r) => r.status === "implemented").length;
  const recommendedCount = allRecommendations.filter((r) => r.status === "recommended").length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/35 bg-cardDark shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_18px_45px_rgba(8,47,73,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_40%)]" />
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="improvement-guide-content"
        className="relative w-full cursor-pointer p-6 select-none hover:bg-slate-800/35 transition text-left"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold inline-flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300 animate-pulse" />
              Improvement Guide
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {implementedCount > 0 ? (
                <>
                  <span className="text-success inline-flex items-center gap-1">
                    <FontAwesomeIcon icon={faCircleCheck} /> {implementedCount} active
                  </span>
                  {' '}• {recommendedCount} recommended
                  actions
                </>
              ) : (
                <>AI-powered suggestions tailored to your project</>
              )}
            </p>
          </div>
          <span className="text-xs uppercase tracking-wide text-primary font-semibold inline-flex items-center gap-2">
            {isOpen ? "Close" : "Open"}
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </span>
        </div>

        {!isOpen && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
            <FontAwesomeIcon icon={faBullseye} className="text-cyan-200" />
            Recommended next step
          </div>
        )}
      </button>

      <div
        id="improvement-guide-content"
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-90"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`px-6 space-y-6 transition-all duration-300 ${
              isOpen ? "pb-6 pt-2 translate-y-0 opacity-100" : "pb-0 pt-0 -translate-y-1 opacity-0"
            }`}
          >
            <div className="grid md:grid-cols-2 gap-4">
          {entries.map(([key, values]) => {
            const title = TITLES[key] || key;
            const liftForCategory = estimateCategoryLift(Number(values.final || 0));
            const categoryCount = Math.max(entries.length, 1);
            const estimatedOverallGain = liftForCategory / categoryCount;
            const projectedScore = Math.min(100, currentScore + estimatedOverallGain);
            const projectedGrade = gradeFromScore(projectedScore);
            const rank = rankIndex.get(key) ?? 0;
            const tier = impactTierByRank(rank, entries.length);
            const tierMeta = impactMeta[tier];

            const maxLift = Math.max(...entries.map(([, entry]) => estimateCategoryLift(Number(entry.final || 0))), 1);
            const impactBarWidth = Math.max(12, Math.min(100, (liftForCategory / maxLift) * 100));

            // Get suggestions from AI or fallback
            const suggestions = categorizedRecs[key as keyof typeof categorizedRecs] || [];
            const displaySuggestions =
              suggestions.length > 0 ? suggestions : FALLBACK_SUGGESTIONS[key].map((text) => ({ text, status: "recommended" }));

            return (
              <div key={key} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-white">{title}</h4>
                  <span className={`text-xs rounded-full px-2 py-1 border ${tierMeta.badgeClass}`}>
                    {tierMeta.label}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Relative impact</span>
                    <span>#{rank + 1}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800/90">
                    <div className={`h-1.5 rounded-full ${tierMeta.barClass}`} style={{ width: `${impactBarWidth}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md bg-slate-800/70 p-2 text-gray-300">Rule: {values.rule.toFixed(1)}</div>
                  <div className="rounded-md bg-slate-800/70 p-2 text-gray-300">AI: {values.ai.toFixed(1)}</div>
                  <div className="rounded-md bg-slate-800/70 p-2 text-gray-300">Final: {values.final.toFixed(1)}</div>
                </div>

                <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">
                  <p className="text-gray-200">
                    Estimated improvement if this area is strengthened:{" "}
                    <span className="font-semibold text-cyan-300">+{estimatedOverallGain.toFixed(1)}</span> overall points
                  </p>
                  <p className="text-gray-300 mt-1">
                    Projected score from this category:{" "}
                    <span className="font-semibold">
                      {projectedScore.toFixed(1)}
                    </span>{" "}
                    ({projectedGrade})
                    <span className="text-xs text-gray-400"> vs current {currentScore.toFixed(1)} ({currentGrade})</span>
                  </p>
                </div>

                <ul className="space-y-2">
                  {displaySuggestions.map((item, idx) => {
                    const isImplemented = item.status === "implemented";
                    return (
                      <li
                        key={idx}
                        className={`text-sm flex gap-2 rounded-md p-2 transition ${
                          isImplemented
                            ? "bg-success/5 border border-success/30 text-success"
                            : "text-gray-200 hover:bg-slate-800/50"
                        }`}
                      >
                        <span className={`font-bold flex-shrink-0 ${isImplemented ? "text-success" : "text-primary"}`}>
                          {isImplemented ? <FontAwesomeIcon icon={faCheck} /> : `${idx + 1}.`}
                        </span>
                        <span className="flex-1">
                          {item.text}
                          {isImplemented && <span className="text-xs ml-1 italic">(Active in your project)</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
            </div>

            {/* Final Projected Total */}
            <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faBullseye} className="text-cyan-300" />
              Final Projected Total
            </h4>
            <span className="text-xs uppercase tracking-wide text-cyan-300 font-bold">
              If all improvements are implemented
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="rounded-md bg-slate-800/70 p-3 border border-slate-700">
              <p className="text-xs text-gray-400 mb-1">Current Score</p>
              <p className="text-lg font-bold text-white">{currentScore.toFixed(1)}</p>
              <p className="text-xs text-gray-500">({currentGrade})</p>
            </div>
            <div className="rounded-md bg-slate-800/70 p-3 border border-slate-700">
              <p className="text-xs text-gray-400 mb-1">Total Lift</p>
              <p className="text-lg font-bold text-cyan-300 flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faArrowTrendUp} /> +{totalLift.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">points</p>
            </div>
            <div className="rounded-md bg-slate-800/70 p-3 border border-primary/30 md:col-start-1 md:col-end-3">
              <p className="text-xs text-gray-400 mb-1">Projected Score</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-bold text-primary">{totalProjectedScore.toFixed(1)}</p>
                <p className="text-2xl font-bold text-primary">({totalProjectedGrade})</p>
              </div>
            </div>
            <div className="rounded-md bg-slate-800/70 border border-cyan-400/30 p-3 md:col-start-3 md:col-end-5 flex flex-col justify-center items-center">
              <p className="text-xs text-gray-400 mb-1">Grade Improvement</p>
              <p className="text-base font-bold text-cyan-300">
                {currentGrade} → {totalProjectedGrade}
              </p>
            </div>
          </div>

          <div className="rounded-md bg-slate-800/50 p-3 border border-slate-700">
            <p className="text-sm text-gray-200">
              <span className="text-cyan-300 font-semibold">Strategy:</span> Start with cards labeled
              "Top Priority" and "High Impact" first, then move to "Moderate Impact." Suggestions marked with the
              check icon are already active in your project, so focus on the remaining actions for the biggest gain.
            </p>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovementGuide;
