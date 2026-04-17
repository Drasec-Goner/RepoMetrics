import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faChartSimple } from "@fortawesome/free-solid-svg-icons";

interface Props {
  score: number;
  grade: string;
}

const ScoreCard = ({ score, grade }: Props) => {
  return (
    <div className="bg-cardDark/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700/70 flex justify-between items-center">
      <div>
        <p className="text-gray-400 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faChartSimple} className="text-cyan-300" /> Final Score
        </p>
        <h2 className="text-3xl font-bold text-white">{score}</h2>
      </div>

      <div className="text-right">
        <p className="text-gray-400 text-sm flex items-center justify-end gap-2">
          <FontAwesomeIcon icon={faAward} className="text-primary" /> Grade
        </p>
        <h2 className="text-2xl font-semibold text-primary">{grade}</h2>
      </div>
    </div>
  );
};

export default ScoreCard;