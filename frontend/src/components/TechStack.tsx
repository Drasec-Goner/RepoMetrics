interface Props {
  tech: Record<string, number>;
}

const TechStack = ({ tech }: Props) => {
  const entries = Object.entries(tech);

  return (
    <div className="bg-cardDark p-6 rounded-2xl shadow-lg">
      <h3 className="font-semibold mb-4">Tech Stack</h3>

      <div className="space-y-4">
        {entries.map(([name, confidence], index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{name}</span>
              <span className="text-gray-400">
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="w-full bg-slate-700 h-2 rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStack;