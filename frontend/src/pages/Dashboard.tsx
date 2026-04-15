import { useEffect, useState } from "react";
import { fetchUserRepos, analyzeRepo } from "../api/repo";
import type { Repo, AnalysisResponse } from "../types";
import RepoSelector from "../components/RepoSelector";
import { getUser, logout } from "../utils/auth";
import ScoreCard from "../components/ScoreCard";
import RadarChartComponent from "../components/charts/RadarChartComponent";
import BarChartComponent from "../components/charts/BarChartComponent";
import RiskMeter from "../components/RiskMeter";
import InsightSection from "../components/InsightSection";
import TechStack from "../components/TechStack";
import LoadingDashboard from "../components/LoadingDashboard";
import ErrorState from "../components/ErrorState";
import ScoreExplanationCard from "../components/ScoreExplanationCard";
import ImprovementGuide from "../components/ImprovementGuide";

const gradeFromScore = (score: number) => {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
};

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
      } catch {
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
    } catch {
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
          {(() => {
            const finalScore = result.final?.score ?? result.final?.overall_score ?? 0;
            const finalGrade = result.final?.grade ?? gradeFromScore(finalScore);
            const aiScores = result.ai_analysis?.scores ?? {};
            const breakdown = result.final?.breakdown ?? result.final?.category_scores ?? {};
            const summary = result.ai_analysis?.analysis?.summary ?? "AI summary unavailable.";
            const verdict = result.ai_analysis?.analysis?.verdict ?? "";
            const tech = result.ai_analysis?.tech ?? {};
            const githubLanguages = result.repository?.languages ?? {};
            const primaryLanguage = result.repository?.language ?? "";
            const strengths = result.ai_analysis?.analysis?.strengths ?? [];
            const weaknesses = result.ai_analysis?.analysis?.weaknesses ?? [];
            const recommendations = result.ai_analysis?.analysis?.recommendations ?? [];
            const ruleScores = result.rule_scores ?? {};
            const risk = result.final?.risk;
            const categoryDetails = result.final?.category_details ?? {};

            return (
              <>
          {/* Score */}
          <ScoreCard
            score={finalScore}
            grade={finalGrade}
          />

          <ScoreExplanationCard
            finalScore={finalScore}
            grade={finalGrade}
            ruleScores={ruleScores}
            aiScores={aiScores}
            aiSummary={summary}
            aiVerdict={verdict}
          />

          <ImprovementGuide
            details={categoryDetails}
            currentScore={finalScore}
            currentGrade={finalGrade}
          />

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <RadarChartComponent data={aiScores} fallbackData={breakdown} />
            <BarChartComponent data={breakdown} ruleScores={ruleScores} aiScores={aiScores} />
          </div>

          {/* Risk */}
          <RiskMeter
            score={finalScore}
            riskScore={risk?.score}
            meaning={risk?.meaning}
            reasons={risk?.reasons}
          />

          <TechStack tech={tech} githubLanguages={githubLanguages} primaryLanguage={primaryLanguage} />

          {/* Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <InsightSection
              title="Strengths"
              items={strengths}
              type="good"
            />

            <InsightSection
              title="Weaknesses"
              items={weaknesses}
              type="bad"
            />
          </div>

          <InsightSection
            title="Recommendations"
            items={recommendations}
            type="suggestion"
          />
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
