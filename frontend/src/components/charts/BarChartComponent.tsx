import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: Record<string, number>;
  ruleScores?: Record<string, number>;
  aiScores?: Record<string, number>;
}

const CATEGORY_ORDER = ["activity", "collaboration", "documentation", "stability", "popularity"] as const;

const formatLabel = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

const BarChartComponent = ({ data, ruleScores = {}, aiScores = {} }: Props) => {
  const formatted = CATEGORY_ORDER.map((category) => ({
    name: formatLabel(category),
    rule: Number(ruleScores[category] ?? 0),
    ai: Number(aiScores[category] ?? 0),
    final: Number(data[category] ?? 0),
  }));

  if (formatted.every((item) => item.final <= 0 && item.rule <= 0 && item.ai <= 0)) {
    return (
      <div className="bg-cardDark p-6 rounded-2xl h-[300px]">
        <h3 className="mb-4 font-medium">Category Breakdown</h3>
        <p className="text-sm text-gray-400">No score breakdown available.</p>
      </div>
    );
  }

  return (
    <div className="bg-cardDark p-6 rounded-2xl min-w-0">
      <h3 className="mb-4 font-medium">Category Breakdown</h3>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
          <BarChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0" }} />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
            <Bar dataKey="rule" name="Rule (60%)" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ai" name="AI/NLP (40%)" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="final" name="Final" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {formatted.map((item) => (
          <div key={item.name} className="rounded-lg border border-slate-700 bg-slate-900/40 p-2">
            <p className="text-xs text-gray-400">{item.name}</p>
            <p className="text-sm text-cyan-300">Rule: {item.rule.toFixed(1)}</p>
            <p className="text-sm text-violet-300">AI: {item.ai.toFixed(1)}</p>
            <p className="text-sm text-amber-300 font-semibold">Final: {item.final.toFixed(1)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChartComponent;