type Props = {
  scores: Record<string, number>;
};

export default function ContributionGraph({ scores }: Props) {
  if (!scores) return null;

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h2>Metric Contribution</h2>

      {Object.entries(scores).map(([key, value]) => {
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0";

        return (
          <div key={key} style={{ marginBottom: "10px" }}>
            <span>{key}</span>

            <div className="bar">
              <div
                className="fill"
                style={{ width: `${percent}%` }}
              />
            </div>

            <span>{percent}%</span>
          </div>
        );
      })}
    </div>
  );
}