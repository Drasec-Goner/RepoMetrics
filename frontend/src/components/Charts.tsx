type Props = {
  scores: Record<string, number>;
};

export default function Charts({ scores }: Props) {
  if (!scores) return null;

  return (
    <div className="charts">
      <h2>Score Breakdown</h2>

      {Object.entries(scores).map(([key, value]) => (
        <div key={key} className="chart-row">
          <div className="chart-header">
            <span className="label">{key}</span>
            <span className="value">{value}</span>
          </div>

          <div className="bar">
            <div
              className="fill"
              style={{
                width: `${value}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}