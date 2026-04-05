import { useEffect, useState } from "react";
import { fetchUserRepos, analyzeRepo } from "../api/repo";
import type { Repo, AnalysisResponse } from "../types";
import RepoSelector from "../components/RepoSelector";
import { getUser, logout } from "../utils/auth";
import ScoreCard from "../components/ScoreCard";
import RadarChartComponent from "../components/charts/RadarChartComponent";
import BarChartComponent from "../components/charts/BarChartComponent";
import RiskMeter from "../components/RiskMeter";
import SummaryCard from "../components/SummaryCard";
import InsightSection from "../components/InsightSection";
import TechStack from "../components/TechStack";
import LoadingDashboard from "../components/LoadingDashboard";
import ErrorState from "../components/ErrorState";

const Dashboard = () => {
  const user = getUser();

  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch repos on load
  useEffect(() => {
    const loadRepos = async () => {
      try {
        setLoadingRepos(true);
        setError(null);

        const data = await fetchUserRepos();
        setRepos(data);
      } catch (error) {
        setError("Failed to load repositories");
      } finally {
        setLoadingRepos(false);
      }
    };

    loadRepos();
  }, []);

  // 🔹 Analyze repo
  const handleAnalyze = async () => {
    if (!selectedRepo) return;

    const [owner, repo] = selectedRepo.split("/");

    try {
      setAnalyzing(true);
      setError(null);

      const data = await analyzeRepo(owner, repo);
      setResult(data);
    } catch (error) {
      setError("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Welcome, {user?.login}
        </h1>

        <button
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
          className="bg-danger px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Repo Selector */}
      <div className="bg-cardDark p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-medium">Select Repository</h2>

        {loadingRepos ? (
          <p className="text-gray-400">Loading repositories...</p>
        ) : repos.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No repositories found.
          </p>
        ) : (
          <RepoSelector
            repos={repos}
            selected={selectedRepo}
            onChange={setSelectedRepo}
          />
        )}

        <button
          onClick={handleAnalyze}
          disabled={!selectedRepo || analyzing}
          className="
            bg-primary px-6 py-2 rounded-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:scale-105 transition
          "
        >
          {analyzing ? "Analyzing..." : "Analyze Repo"}
        </button>
      </div>


      {error && (
        <ErrorState message={error} />
      )}

      {analyzing && <LoadingDashboard />}

      {!analyzing && result && (
        <div className="space-y-6 animate-fade-in">
          {/* Score */}
          <ScoreCard
            score={result.final.score}
            grade={result.final.grade}
          />

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <RadarChartComponent data={result.ai_analysis.scores} />
            <BarChartComponent data={result.final.breakdown} />
          </div>

          {/* Risk */}
          <RiskMeter score={result.final.score} />

          {/* AI Summary */}
          <SummaryCard summary={result.ai_analysis.analysis.summary} />
          <TechStack tech={result.ai_analysis.tech} />

          {/* Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <InsightSection
              title="Strengths"
              items={result.ai_analysis.analysis.strengths}
              type="good"
            />

            <InsightSection
              title="Weaknesses"
              items={result.ai_analysis.analysis.weaknesses}
              type="bad"
            />
          </div>

          <InsightSection
            title="Recommendations"
            items={result.ai_analysis.analysis.recommendations}
            type="suggestion"
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;# perf: initialize project structure at 2026-03-25 21:07:00
# feat: setup FastAPI backend at 2026-03-29 22:39:00
# docs: optimize API calls at 2026-04-04 20:59:00
# fix: implement PR & issue scoring at 2026-04-10 16:01:00
# refactor: add hybrid scoring logic at 2026-04-02 13:04:00
# perf: setup React frontend at 2026-04-04 12:15:00
# fix: add README parsing at 2026-04-05 17:58:00
