interface Props {
  score: number;
}

const getRiskLevel = (score: number) => {
  if (score >= 80) return "Low";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "High";
  return "Critical";
};

const RiskMeter = ({ score }: Props) => {
  const level = getRiskLevel(score);

  return (
    <div className="bg-cardDark p-6 rounded-2xl">
      <h3 className="mb-2 font-medium">Risk Level</h3>
      <p className="text-xl font-bold">{level}</p>
    </div>
  );
};

export default RiskMeter;# refactor: fix API response bug at 2026-03-22 15:38:00
# feat: refactor feature extraction at 2026-03-26 10:03:00
# perf: add contributor metrics at 2026-04-02 16:01:00
# docs: setup React frontend at 2026-04-03 11:08:00
# perf: add contributor metrics at 2026-04-08 19:31:00
