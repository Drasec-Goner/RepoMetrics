import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";

type Props = {
  scores: Record<string, number>;
};

export default function ContributionGraph({ scores }: Props) {
  if (!scores) return null;

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-cardDark/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700/70">
      <h2 className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faChartPie} className="text-cyan-300" /> Metric Contribution
      </h2>

      {Object.entries(scores).map(([key, value]) => {
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0";

        return (
          <div key={key} style={{ marginBottom: "10px" }}>
            <span className="text-gray-200">{key}</span>

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