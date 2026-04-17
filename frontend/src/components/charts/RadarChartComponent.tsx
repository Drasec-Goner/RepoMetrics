import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  ruleScores?: Record<string, number>;
  aiScores?: Record<string, number>;
  finalScores?: Record<string, number>;
}

const CATEGORY_ORDER = ["activity", "collaboration", "documentation", "stability", "popularity"] as const;

const formatLabel = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

const RadarChartComponent = ({ ruleScores = {}, aiScores = {}, finalScores = {} }: Props) => {
  const formatted = CATEGORY_ORDER.map((category) => ({
    subject: formatLabel(category),
    rule: Number(ruleScores[category] ?? 0),
    ai: Number(aiScores[category] ?? 0),
    final: Number(finalScores[category] ?? 0),
  }));

  if (formatted.every((item) => item.rule <= 0 && item.ai <= 0 && item.final <= 0)) {
    return (
      <div className="bg-cardDark/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700/70 h-[300px]">
        <h3 className="mb-4 font-medium">Score Comparison</h3>
        <p className="text-sm text-gray-400">No score data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-cardDark/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700/70 min-w-0">
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-medium">Score Comparison</h3>
          <p className="text-xs text-gray-400 mt-1">Rule, AI/NLP, and final scores on the same radar.</p>
        </div>
      </div>

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
          <RadarChart
            data={formatted}
            cx="50%"
            cy="52%"
            outerRadius="72%"
            startAngle={90}
            endAngle={-270}
            margin={{ top: 8, right: 20, bottom: 8, left: 20 }}
          >
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#e2e8f0", fontSize: 13 }} tickLine={false} axisLine={false} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} tickCount={5} axisLine={false} />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12, paddingTop: 12 }} />
            <Radar dataKey="rule" name="Rule" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.08} strokeWidth={2.5} dot={{ r: 3, fill: "#22d3ee", stroke: "#22d3ee" }} />
            <Radar dataKey="ai" name="AI/NLP" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.10} strokeWidth={2.5} dot={{ r: 3, fill: "#a78bfa", stroke: "#a78bfa" }} />
            <Radar dataKey="final" name="Final" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.24} strokeWidth={3} dot={{ r: 4, fill: "#f59e0b", stroke: "#f59e0b" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RadarChartComponent;