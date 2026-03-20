import GitHubLoginButton from "./ui/GitHubLoginButton";
import Container from "./ui/Container";

const Hero = () => {
  return (
    <div className="relative py-24">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl"></div>

      <Container>
        <div className="relative text-center flex flex-col items-center gap-6">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Analyze GitHub Repos
            <br />
            with <span className="text-primary">AI Insights</span>
          </h1>

          <p className="text-gray-400 max-w-xl">
            RepoMetrics evaluates your repositories with AI-powered scoring,
            insights, and recommendations to help you build better code.
          </p>

          <GitHubLoginButton />
        </div>
      </Container>
    </div>
  );
};

export default Hero;