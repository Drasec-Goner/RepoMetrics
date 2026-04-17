import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCode,
  faExclamationTriangle,
  faGaugeHigh,
  faHistory,
  faShieldHeart,
} from "@fortawesome/free-solid-svg-icons";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalysisResponse } from "../types";

type Props = {
  insights?: AnalysisResponse["insights"];
};

const severityStyles: Record<string, string> = {
  high: "border-red-500/30 bg-red-500/10 text-red-200",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  low: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
};

const trendLabels = {
  improving: "Improving",
  stable: "Stable",
  declining: "Declining",
} as const;

const AnalysisInsightsCard = ({ insights }: Props) => {
  const hurting = insights?.what_is_hurting_your_score ?? [];
  const quality = insights?.code_quality_breakdown ?? [];
  const historical = insights?.historical_analysis;
  const historicalChartData = (historical?.timeline ?? []).map((point) => ({
    period: point.period.replace("Last ", "").replace(" days", "d"),
    commits: point.commit_count,
    activity: Number(point.activity_score.toFixed(1)),
    projected: Number(point.projected_score.toFixed(1)),
  }));

  if (!hurting.length && !quality.length && !historical) {
    return null;
  }

  return (
    <div className="bg-cardDark p-6 rounded-2xl shadow-lg space-y-6 border border-slate-700/70">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FontAwesomeIcon icon={faChartLine} className="text-cyan-300" />
            Analysis Insights
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            A deeper look at what is limiting the score, how the code quality breaks down, and how the repository is trending over time.
          </p>
        </div>
      </div>

      {hurting.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-300" />
            <h4 className="font-semibold text-white">What’s hurting your score?</h4>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {hurting.map((item) => (
              <div key={`${item.category}-${item.label}`} className={`rounded-xl border p-4 ${severityStyles[item.severity] ?? severityStyles.medium}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-300">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">Impact {item.impact.toFixed(1)}</p>
                    <p className="text-xs text-gray-300">Score {item.score.toFixed(1)}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-100 mt-3 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {quality.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCode} className="text-primary" />
            <h4 className="font-semibold text-white">Code Quality Breakdown</h4>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {quality.map((item) => (
              <div key={`${item.category}-${item.label}`} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-400">{item.category}</p>
                  </div>
                  <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-bold text-cyan-200">
                    {item.score.toFixed(1)}
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {historical && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHistory} className="text-cyan-300" />
            <h4 className="font-semibold text-white">Historical analysis</h4>
          </div>

          <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2">
            <p className="text-xs text-cyan-100 leading-relaxed">
              Projected score is a momentum-adjusted estimate: it blends your current overall score with recent commit activity trends.
              It helps compare direction across time windows, but it is not a guaranteed future score.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-white">
                  Trend: <span className="text-cyan-300">{trendLabels[historical.trend]}</span>
                </p>
                <p className="text-sm text-gray-300 mt-1 leading-relaxed">{historical.summary}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
                <FontAwesomeIcon icon={faGaugeHigh} /> Commit momentum
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              {historical.timeline.map((point) => (
                <div key={point.period} className="rounded-lg border border-slate-700 bg-slate-950/40 p-3 space-y-2">
                  <p className="text-sm font-semibold text-white">{point.period}</p>
                  <p className="text-xs text-gray-400">Commits: {point.commit_count}</p>
                  <p className="text-xs text-cyan-300">Activity score: {point.activity_score.toFixed(1)}</p>
                  <p className="text-xs text-primary">Projected score: {point.projected_score.toFixed(1)} ({point.grade})</p>
                </div>
              ))}
            </div>

            {historicalChartData.length > 1 && (
              <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-sm font-semibold text-white mb-1">Historical trend graph</p>
                <p className="text-xs text-gray-400 mb-3">
                  Comparing activity score and projected score across time windows.
                </p>

                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalChartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="period" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "10px",
                          color: "#e2e8f0",
                        }}
                        labelStyle={{ color: "#cbd5e1" }}
                        formatter={(value, name) => {
                          const numeric = typeof value === "number" ? value : Number(value ?? 0);
                          if (name === "Commits") {
                            return [numeric, name];
                          }
                          return [numeric.toFixed(1), name];
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="activity"
                        name="Activity Score"
                        stroke="#22d3ee"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#22d3ee" }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="projected"
                        name="Projected Score"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#f59e0b" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  Read this as trajectory: if the amber line stays above or rises with the cyan line, repository momentum is improving.
                  If both lines trend down, maintenance cadence is weakening.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 flex items-start gap-3">
        <FontAwesomeIcon icon={faShieldHeart} className="mt-1 text-success" />
        <p className="text-sm text-gray-300 leading-relaxed">
          Use the score drivers to prioritize fixes, the code quality breakdown to guide cleanup, and the historical trend to see whether your maintenance habits are improving or fading.
        </p>
      </div>
    </div>
  );
};

export default AnalysisInsightsCard;
