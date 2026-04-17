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
    <div>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Landing;