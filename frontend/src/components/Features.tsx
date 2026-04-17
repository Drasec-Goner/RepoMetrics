import Container from "./ui/Container";
import FeatureCard from "./ui/FeatureCard";
import {
  faBolt,
  faBrain,
  faChartLine,
  faFileCircleCheck,
  faGaugeHigh,
  faShieldHeart,
} from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    icon: faBrain,
    title: "AI-Powered Analysis",
    description: "Context-aware strengths, weaknesses, and recommendations from repository signals.",
  },
  {
    icon: faGaugeHigh,
    title: "Repository Scoring",
    description: "Transparent category scores for activity, collaboration, docs, stability, and popularity.",
  },
  {
    icon: faChartLine,
    title: "Historical Trend",
    description: "See momentum shifts over time with projected-score and activity visualization.",
  },
  {
    icon: faShieldHeart,
    title: "Risk Diagnostics",
    description: "Identify likely delivery risks early with clear risk level and top risk drivers.",
  },
  {
    icon: faBolt,
    title: "Tech Stack Detection",
    description: "Understand language and stack composition with confidence-aware summaries.",
  },
  {
    icon: faFileCircleCheck,
    title: "Actionable Suggestions",
    description: "Get prioritized actions to improve repository quality and maintainability quickly.",
  },
];

const Features = () => {
  return (
    <div className="py-20 scroll-mt-24" id="features">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Features built for real repository decisions</h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            From fast health checks to deeper engineering signals, RepoMetrics gives you the context needed to evaluate repositories with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <div id="how-it-works" className="mt-16 rounded-3xl border border-slate-700/70 bg-slate-900/45 p-6 md:p-8 backdrop-blur-sm scroll-mt-24">
          <h3 className="text-2xl font-semibold">How it works</h3>
          <p className="text-slate-400 mt-2 max-w-2xl">A simple flow that turns raw repository data into understandable decisions.</p>

          <div className="grid md:grid-cols-4 gap-4 mt-6">
            {[
              { step: "01", title: "Connect", text: "Sign in with GitHub and select a repository." },
              { step: "02", title: "Analyze", text: "RepoMetrics extracts features and computes baseline signals." },
              { step: "03", title: "Blend", text: "Rule scores and AI insights are combined into final outcomes." },
              { step: "04", title: "Act", text: "Use trend, risk, and recommendations to improve quickly." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
                <p className="text-cyan-300 font-semibold text-sm">Step {item.step}</p>
                <h4 className="text-white font-semibold mt-1">{item.title}</h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Features;