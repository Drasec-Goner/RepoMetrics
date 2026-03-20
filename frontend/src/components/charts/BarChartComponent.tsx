import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: Record<string, number>;
}

const BarChartComponent = ({ data }: Props) => {
  const formatted = Object.entries(data).map(([key, value]) => ({
    name: key,
    value,
  }));

  return (
    <div className="bg-cardDark p-6 rounded-2xl h-[300px]">
      <h3 className="mb-4 font-medium">Category Breakdown</h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted}>
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;