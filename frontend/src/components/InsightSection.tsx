interface Props {
  title: string;
  items: string[];
  type?: "default" | "good" | "bad" | "suggestion";
}

const normalizeInsightText = (text: string) => {
  // Remove markdown emphasis/heading/list markers for clean UI text.
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#+\s*/g, "")
    .replace(/^[-*]\s+/g, "")
    .trim();
};

const splitActionPrefix = (text: string) => {
  const normalized = normalizeInsightText(text);
  const separatorIndex = normalized.indexOf(":");

  if (separatorIndex <= 0) {
    return { title: normalized, detail: "" };
  }

  return {
    title: normalized.slice(0, separatorIndex).trim(),
    detail: normalized.slice(separatorIndex + 1).trim(),
  };
};

const getColor = (type: Props["type"]) => {
  switch (type) {
    case "good":
      return "text-green-400";
    case "bad":
      return "text-red-400";
    case "suggestion":
      return "text-yellow-400";
    default:
      return "text-gray-300";
  }
};

const InsightSection = ({ title, items, type = "default" }: Props) => {
  if (type === "suggestion") {
    const palettes = [
      "border-cyan-400/50 bg-cyan-400/10",
      "border-emerald-400/50 bg-emerald-400/10",
      "border-amber-400/50 bg-amber-400/10",
      "border-fuchsia-400/50 bg-fuchsia-400/10",
    ];

    return (
      <div className="bg-cardDark p-6 rounded-2xl shadow-lg">
        <h3 className="font-semibold mb-4">{title}</h3>

        <div className="space-y-3">
          {items.map((item, index) => {
            const parts = splitActionPrefix(item);
            return (
              <div
                key={index}
                className={`rounded-xl border p-3 ${palettes[index % palettes.length]}`}
              >
                <p className="text-sm font-semibold text-white">{index + 1}. {parts.title}</p>
                {parts.detail && <p className="text-sm text-gray-200 mt-1 leading-relaxed">{parts.detail}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cardDark p-6 rounded-2xl shadow-lg">
      <h3 className="font-semibold mb-4">{title}</h3>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className={`${getColor(type)} text-sm`}>
            • {normalizeInsightText(item)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightSection;