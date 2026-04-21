import Container from "./ui/Container";

const Navbar = () => {
  const scrollToSection = (id: string, offset = 28) => {
    const target = document.getElementById(id);
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const scrollToFeaturesCheese = () => {
    const target = document.getElementById("features");
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      window.scrollBy({ top: 520, behavior: "smooth" });
    }, 250);
  };

  return (
    <div className="sticky top-0 z-40 border-b border-cyan-400/20 bg-slate-950/60 backdrop-blur-xl">
      <Container>
        <div className="flex justify-between items-center py-4 gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="RepoMetrics logo"
              className="h-10 w-10 rounded-xl border border-cyan-300/30 bg-slate-900/80 p-0.5 shadow-lg shadow-cyan-500/30"
            />
            <div>
              <h1 className="font-bold text-lg text-cyan-200 tracking-wide">RepoMetrics</h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Repository Intelligence</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
            <button
              type="button"
              onClick={scrollToFeaturesCheese}
              className="rounded-full border border-slate-700/80 px-3 py-1.5 hover:border-cyan-400/50 hover:text-cyan-200 transition"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="rounded-full border border-slate-700/80 px-3 py-1.5 hover:border-cyan-400/50 hover:text-cyan-200 transition"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("why-repometrics")}
              className="rounded-full border border-slate-700/80 px-3 py-1.5 hover:border-cyan-400/50 hover:text-cyan-200 transition"
            >
              Why this helps
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Navbar;