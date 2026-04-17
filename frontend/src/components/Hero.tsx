import GitHubLoginButton from "./ui/GitHubLoginButton";
import Container from "./ui/Container";

const Hero = () => {
  return (
    <div className="relative py-16 md:py-24 overflow-hidden scroll-mt-24" id="why-repometrics">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-14 -left-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl animate-float-slow" />
        <div className="absolute top-24 right-[-6rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-float-slow [animation-delay:1.2s]" />
        <div className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl animate-float-slow [animation-delay:2.2s]" />
        <div className="absolute inset-0 landing-grid opacity-60" />
      </div>

      <Container>
        <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div className="space-y-6 animate-rise-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100">
              AI + Rule-based repository intelligence
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight text-white">
              Understand any GitHub repo
              <span className="block mt-2 bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                in one intelligent report
              </span>
            </h1>

            <p className="text-slate-300 max-w-2xl text-base md:text-lg leading-relaxed">
              RepoMetrics evaluates activity, stability, documentation, and collaboration, then combines measurable signals with AI context
              so you know what is strong, what is risky, and what to improve next.
            </p>

            <div className="flex flex-wrap gap-3">
              <GitHubLoginButton className="shadow-cyan-500/30" />
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-slate-600/80 px-6 py-3 font-medium text-slate-200 hover:border-cyan-400/50 hover:text-cyan-200 transition"
              >
                Explore features
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {[
                { label: "Score pillars", value: "5" },
                { label: "Hybrid model", value: "Rule + AI" },
                { label: "Export format", value: "PDF" },
                { label: "Live insight", value: "Trend graph" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-700/80 bg-slate-900/55 p-3 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-cyan-200">{item.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:justify-self-end w-full max-w-md animate-rise-in [animation-delay:0.15s]">
            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 backdrop-blur-xl p-6 shadow-2xl shadow-cyan-950/40 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Repository pulse</p>
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs text-emerald-300">Live analysis</span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Activity", score: 84 },
                  { label: "Stability", score: 72 },
                  { label: "Documentation", score: 67 },
                ].map((row) => (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{row.label}</span>
                      <span className="text-cyan-200">{row.score}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 origin-left animate-grow-x"
                        style={{ width: `${row.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Build confidence before adopting a repository by combining quantitative metrics with practical AI recommendations.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Hero;