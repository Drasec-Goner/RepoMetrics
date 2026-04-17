import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faChartLine,
  faCircleCheck,
  faClockRotateLeft,
  faCode,
  faFileLines,
  faShieldHeart,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import type { AnalysisResponse } from "../types";

type Props = {
  result: AnalysisResponse;
  finalScore: number;
  finalGrade: string;
};

const severityStyles: Record<string, string> = {
  high: "border-red-400/30 bg-red-400/10 text-red-100",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  low: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
};

const formatPercent = (value: number) => `${Math.max(0, Math.min(100, value)).toFixed(1)}%`;

const ReportExportSheet = ({ result, finalScore, finalGrade }: Props) => {
  const insights = result.insights;
  const hurting = insights?.what_is_hurting_your_score ?? [];
  const quality = insights?.code_quality_breakdown ?? [];
  const historical = insights?.historical_analysis;
  const ruleScores = result.rule_scores ?? {};
  const repoName = result.repository.full_name ?? result.repository.name ?? "Unknown repository";
  const repoLanguage = result.repository.language ?? "Unknown";
  const risk = result.final?.risk;
  const aiStrengths = result.ai_analysis?.analysis?.strengths ?? [];
  const recommendations = result.ai_analysis?.analysis?.recommendations ?? [];
  const languages = Object.entries(result.repository.languages ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const heroScore = Math.max(0, Math.min(100, finalScore));

  return (
    <div className="w-[1120px] bg-[#020617] text-white relative overflow-hidden p-10" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="absolute inset-0 opacity-100">
        <div className="absolute left-[-5rem] top-[-4rem] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
        <div className="absolute right-[-4rem] top-28 h-72 w-72 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative space-y-8">
        <header data-pdf-block className="rounded-[28px] border border-slate-700/80 bg-slate-950/65 p-8 shadow-2xl shadow-cyan-950/10 backdrop-blur">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
                <FontAwesomeIcon icon={faFileLines} /> RepoMetrics report
              </div>
              <div>
                <h1 className="text-4xl font-bold leading-tight">{repoName}</h1>
                <p className="mt-3 text-base text-slate-300 leading-relaxed">
                  A visual quality report for maintainability, collaboration, documentation, stability, and adoption.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
                Generated {new Date().toLocaleString()}
              </div>
              <div className="rounded-3xl border border-cyan-400/30 bg-slate-900/80 p-4 shadow-lg shadow-cyan-500/10">
                <div className="flex items-center gap-4">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-[12px] border-cyan-400/25 bg-slate-950/80">
                    <div className="text-center">
                      <div className="text-3xl font-black text-cyan-300">{heroScore.toFixed(0)}</div>
                      <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Score</div>
                    </div>
                  </div>
                  <div className="space-y-2 pr-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Final grade</p>
                    <p className="text-5xl font-black text-primary">{finalGrade}</p>
                    <p className="text-sm text-slate-300 max-w-[180px]">{result.ai_analysis?.analysis?.verdict ?? "Quality verdict unavailable."}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section data-pdf-block className="grid grid-cols-4 gap-4">
          {[
            { label: "Rule score", value: (Object.values(ruleScores).reduce((a, b) => a + b, 0) / Math.max(Object.keys(ruleScores).length, 1)).toFixed(1), accent: "text-cyan-300" },
            { label: "AI score", value: (Object.values(result.ai_analysis?.scores ?? {}).reduce((a, b) => a + b, 0) / Math.max(Object.keys(result.ai_analysis?.scores ?? {}).length, 1)).toFixed(1), accent: "text-violet-300" },
            { label: "Risk level", value: risk?.level ?? "Low", accent: "text-amber-200" },
            { label: "Primary language", value: repoLanguage, accent: "text-emerald-200" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-700 bg-slate-950/65 p-5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
              <p className={`mt-3 text-2xl font-bold ${item.accent}`}>{item.value}</p>
            </div>
          ))}
        </section>

        <section data-pdf-block className="grid grid-cols-2 gap-6">
          <div className="rounded-[28px] border border-slate-700 bg-slate-950/65 p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-300" /> What’s hurting your score?
            </h2>
            <div className="space-y-3">
              {hurting.slice(0, 4).map((item) => (
                <div key={`${item.category}-${item.label}`} className={`rounded-2xl border p-4 ${severityStyles[item.severity] ?? severityStyles.medium}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{item.category}</p>
                    </div>
                    <p className="text-right text-sm font-bold">{item.impact.toFixed(1)} impact</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-100">{item.detail}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-950/50">
                    <div className="h-2 rounded-full bg-current" style={{ width: formatPercent(item.impact * 2) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-700 bg-slate-950/65 p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <FontAwesomeIcon icon={faCode} className="text-cyan-300" /> Code Quality Breakdown
            </h2>
            <div className="space-y-4">
              {quality.map((item) => (
                <div key={`${item.category}-${item.label}`} className="space-y-2 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.category}</p>
                    </div>
                    <p className="text-2xl font-black text-cyan-300">{item.score.toFixed(1)}</p>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800">
                    <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-primary" style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }} />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section data-pdf-block className="grid grid-cols-2 gap-6">
          <div className="rounded-[28px] border border-slate-700 bg-slate-950/65 p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <FontAwesomeIcon icon={faClockRotateLeft} className="text-cyan-300" /> Historical analysis
            </h2>
            {historical ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Trend</p>
                  <p className="mt-2 text-2xl font-bold text-white capitalize">{historical.trend}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{historical.summary}</p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {historical.timeline.map((point) => (
                    <div key={point.period} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{point.period}</p>
                      <p className="mt-2 text-lg font-bold text-white">{point.commit_count} commits</p>
                      <p className="text-sm text-cyan-300">Activity {point.activity_score.toFixed(1)}</p>
                      <p className="text-sm text-slate-300">Proj. {point.projected_score.toFixed(1)} ({point.grade})</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300">No historical trend data available.</p>
            )}
          </div>

          <div className="rounded-[28px] border border-slate-700 bg-slate-950/65 p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <FontAwesomeIcon icon={faBullseye} className="text-cyan-300" /> Action plan
            </h2>
            <div className="space-y-3">
              {(recommendations.slice(0, 4).length > 0 ? recommendations.slice(0, 4) : aiStrengths.slice(0, 4)).map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-success" />
                    <p className="font-semibold text-white">{item}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Repository context</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-200">
                {languages.length > 0 ? languages.map(([name, value]) => (
                  <div key={name} className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                    <p className="font-semibold text-white">{name}</p>
                    <p className="text-cyan-300">{Math.round(value * 100)}% share</p>
                  </div>
                )) : (
                  <p className="text-slate-300">No language data available.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer data-pdf-block className="flex items-center justify-between rounded-[28px] border border-slate-700 bg-slate-950/65 px-6 py-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldHeart} className="text-cyan-300" />
            RepoMetrics visual report
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faChartLine} className="text-violet-300" />
            {heroScore.toFixed(1)} overall score
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReportExportSheet;
