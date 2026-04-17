import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import { useEffect } from "react";

const Landing = () => {
  useEffect(() => {
    document.title = "RepoMetrics | Home";
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(99,102,241,0.16),transparent_28%),radial-gradient(circle_at_50%_85%,rgba(56,189,248,0.08),transparent_32%)]" />
      </div>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Landing;