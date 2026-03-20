type Props = {
  score: number;
};

export default function RiskMeter({ score }: Props) {
  let level = "Low";
  let color = "#22c55e";

  if (score < 40) {
    level = "Critical";
    color = "#ef4444";
  } else if (score < 60) {
    level = "High";
    color = "#f97316";
  } else if (score < 75) {
    level = "Medium";
    color = "#eab308";
  }

  return (
    <div className="risk">
      <h2>Risk Level</h2>

      <div className="risk-bar">
        <div
          className="risk-fill"
          style={{
            width: `${score}%`,
            background: color
          }}
        />
      </div>

      <h3 style={{ color }}>{level}</h3>
    </div>
  );
}