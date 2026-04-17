interface Props {
  summary: string;
}

const SummaryCard = ({ summary }: Props) => {
  return (
    <div className="bg-cardDark p-6 rounded-2xl shadow-lg">
      <h3 className="font-semibold mb-3">AI Summary</h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        {summary}
      </p>
    </div>
  );
};

export default SummaryCard;