import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: Record<string, number>;
  fallbackData?: Record<string, number>;
}

const CATEGORY_ORDER = ["activity", "collaboration", "documentation", "stability", "popularity"] as const;

const formatLabel = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

const RadarChartComponent = ({ data, fallbackData = {} }: Props) => {
  const source = Object.keys(data).length > 0 ? data : fallbackData;
  const formatted = CATEGORY_ORDER.map((category) => ({
    subject: formatLabel(category),
    value: Number(source[category] ?? 0),
  }));

  if (formatted.every((item) => item.value <= 0)) {
    return (
      <div className="bg-cardDark p-6 rounded-2xl h-[300px]">
        <h3 className="mb-4 font-medium">AI Score Breakdown</h3>
        <p className="text-sm text-gray-400">No score data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-cardDark p-6 rounded-2xl h-[300px] min-w-0">
      <h3 className="mb-4 font-medium">AI Score Breakdown</h3>

      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
        <RadarChart data={formatted}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#e2e8f0", fontSize: 13 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
          <Radar
            dataKey="value"
            stroke="#22d3ee"
            strokeWidth={3}
            fill="#22d3ee"
            fillOpacity={0.35}
            dot={{ r: 4, fill: "#22d3ee", stroke: "#22d3ee" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;