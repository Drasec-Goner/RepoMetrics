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
}# perf: initialize project structure at 2026-03-24 14:00:00
# perf: refactor feature extraction at 2026-03-29 18:21:00
# feat: add hybrid scoring logic at 2026-04-13 17:22:00
