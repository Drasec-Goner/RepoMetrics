interface Props {
  score: number;
  grade: string;
}

const ScoreCard = ({ score, grade }: Props) => {
  return (
    <div className="bg-cardDark p-6 rounded-2xl shadow-lg flex justify-between items-center">
      <div>
        <p className="text-gray-400 text-sm">Final Score</p>
        <h2 className="text-3xl font-bold">{score}</h2>
      </div>

      <div className="text-right">
        <p className="text-gray-400 text-sm">Grade</p>
        <h2 className="text-2xl font-semibold text-primary">{grade}</h2>
      </div>
    </div>
  );
};

export default ScoreCard;