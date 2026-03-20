interface Props {
  title: string;
  items: string[];
  type?: "default" | "good" | "bad" | "suggestion";
}

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
  return (
    <div className="bg-cardDark p-6 rounded-2xl shadow-lg">
      <h3 className="font-semibold mb-4">{title}</h3>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className={`${getColor(type)} text-sm`}>
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightSection;