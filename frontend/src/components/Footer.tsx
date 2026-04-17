import Container from "./ui/Container";

const Footer = () => {
  return (
    <div className="border-t border-slate-700/70 py-10 mt-20 bg-slate-950/40">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="RepoMetrics logo"
              className="h-9 w-9 rounded-lg border border-cyan-300/30 bg-slate-900/70 p-0.5"
            />
            <div>
            <p className="text-sm text-slate-300">© {new Date().getFullYear()} RepoMetrics</p>
            <p className="text-xs text-slate-500 mt-1">Repository intelligence for faster engineering decisions.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <a href="#features" className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-300 hover:text-cyan-200 hover:border-cyan-400/45 transition">Features</a>
            <a href="#how-it-works" className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-300 hover:text-cyan-200 hover:border-cyan-400/45 transition">How it works</a>
            <a href="#why-repometrics" className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-300 hover:text-cyan-200 hover:border-cyan-400/45 transition">Why RepoMetrics</a>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Footer;