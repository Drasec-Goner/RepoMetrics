import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: Record<string, number>;
}

const RadarChartComponent = ({ data }: Props) => {
  const formatted = Object.entries(data).map(([key, value]) => ({
    subject: key,
    value,
  }));

  return (
    <div className="bg-cardDark p-6 rounded-2xl h-[300px]">
      <h3 className="mb-4 font-medium">AI Score Breakdown</h3>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={formatted}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar dataKey="value" />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;