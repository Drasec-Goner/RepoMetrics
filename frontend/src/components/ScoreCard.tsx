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

export default RiskMeter;
