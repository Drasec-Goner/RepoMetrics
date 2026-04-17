interface Props {
  title: string;
  description: string;
}

const FeatureCard = ({ title, description }: Props) => {
  return (
    <div className="bg-cardDark p-6 rounded-2xl shadow-lg hover:scale-105 transition">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;