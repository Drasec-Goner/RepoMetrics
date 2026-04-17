import Container from "./ui/Container";
import FeatureCard from "./ui/FeatureCard";

const features = [
  {
    title: "AI-Powered Analysis",
    description: "Get intelligent insights on code quality and structure.",
  },
  {
    title: "Repository Scoring",
    description: "Understand your repo health with a detailed score.",
  },
  {
    title: "Tech Stack Detection",
    description: "Automatically detect technologies used in your repo.",
  },
  {
    title: "Actionable Suggestions",
    description: "Improve your projects with AI-driven recommendations.",
  },
];

const Features = () => {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Features</h2>
          <p className="text-gray-400 mt-2">
            Everything you need to evaluate your repositories
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Container>
    </div>
  );
};

export default Features;