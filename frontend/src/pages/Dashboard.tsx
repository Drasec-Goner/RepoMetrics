import { useEffect, useRef, useState } from "react";
import { fetchUserRepos, analyzeRepo } from "../api/repo";
import type { Repo, AnalysisResponse } from "../types";
import RepoSelector from "../components/RepoSelector";
import { getUser, logout } from "../utils/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFolderOpen, faGlobe, faSearch, faLayerGroup, faChevronDown, faChartPie } from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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
import AnalysisInsightsCard from "../components/AnalysisInsightsCard";
import ReportExportSheet from "../components/ReportExportSheet";

const gradeFromScore = (score: number) => {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
};

const POPULAR_REPOS = [
  "facebook/react",
  "microsoft/vscode",
  "vercel/next.js",
  "vitejs/vite",
  "tailwindlabs/tailwindcss",
  "fastapi/fastapi",
];

const parseRepoTarget = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2].replace(/\.git$/i, ""),
    };
  }

  const shorthand = trimmed.replace(/^@/, "").replace(/\.git$/i, "");
  const parts = shorthand.split("/").filter(Boolean);

  if (parts.length >= 2) {
    return {
      owner: parts[0],
      repo: parts[1],
    };
  }

  return null;
};

const Dashboard = () => {
  const user = getUser();
  const reportRef = useRef<HTMLDivElement | null>(null);

  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repoInput, setRepoInput] = useState("");
  const [repoSource, setRepoSource] = useState<"saved" | "public">("saved");
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "RepoMetrics | Dashboard";
  }, []);

  // 🔹 Fetch repos on load
  useEffect(() => {
    const loadRepos = async () => {
      try {
        setLoadingRepos(true);
        setError(null);

        const data = await fetchUserRepos();
        setRepos(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Repository loading error:", errorMsg, err);
        setError(`Failed to load repositories: ${errorMsg}`);
      } finally {
        setLoadingRepos(false);
      }
    };

    loadRepos();
  }, []);

  // 🔹 Analyze repo
  const handleAnalyze = async () => {
    const target = repoSource === "public" ? parseRepoTarget(repoInput) : parseRepoTarget(selectedRepo);
    if (!target) {
      setError("Enter a valid GitHub repository like owner/repo or a GitHub URL.");
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);

      const data = await analyzeRepo(target.owner, target.repo);
      setResult(data);
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportReport = async () => {
    if (!result || !reportRef.current) return;

    try {
      setExportingPdf(true);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const sectionGap = 4;

      const paintPageBackground = () => {
        pdf.setFillColor(2, 6, 23);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
      };

      const reportBlocks = Array.from(reportRef.current.querySelectorAll<HTMLElement>("[data-pdf-block]"));
      const blocks = reportBlocks.length > 0 ? reportBlocks : [reportRef.current];
      let cursorY = margin;

      paintPageBackground();

      for (let index = 0; index < blocks.length; index += 1) {
        const block = blocks[index];
        const canvas = await html2canvas(block, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#020617",
          logging: false,
          windowWidth: reportRef.current.scrollWidth,
        });

        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        if (cursorY > margin && cursorY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          paintPageBackground();
          cursorY = margin;
        }

        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", margin, cursorY, contentWidth, imgHeight);
        cursorY += imgHeight + sectionGap;
      }

      const filename = `${result.repository.full_name ?? "repo-analysis"}-report.pdf`.replace(/[^a-z0-9._-]+/gi, "_");
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
      setError("Unable to export PDF report right now. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="relative overflow-hidden p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-40 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">
          Welcome, {user?.login}
        </h1>

        <button
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
          className="bg-danger px-4 py-2 rounded-lg shadow-lg shadow-red-500/10"
        >
          Logout
        </button>
      </div>

      {/* Repo Selector */}
      <div className="bg-cardDark/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl space-y-4 border border-slate-700/70">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <FontAwesomeIcon icon={faFolderOpen} className="text-cyan-300" />
            Select Repository
          </h2>
          <p className="text-sm text-gray-400">Analyze one of your repos or any public GitHub repository.</p>
        </div>

        <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/50 p-1 w-fit">
          <button
            type="button"
            onClick={() => setRepoSource("saved")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
              repoSource === "saved" ? "bg-primary text-white shadow" : "text-gray-300 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={faLayerGroup} /> My repos
          </button>
          <button
            type="button"
            onClick={() => setRepoSource("public")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
              repoSource === "public" ? "bg-primary text-white shadow" : "text-gray-300 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={faGlobe} /> Public repo
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] items-start transition-all duration-300">
          {repoSource === "saved" ? (
            <div className="space-y-2 animate-fade-in">
              {loadingRepos ? (
                <p className="text-gray-400">Loading repositories...</p>
              ) : repos.length === 0 ? (
                <p className="text-gray-400 text-sm">No repositories found.</p>
              ) : (
                <RepoSelector
                  repos={repos}
                  selected={selectedRepo}
                  onChange={(value) => {
                    setSelectedRepo(value);
                    setRepoInput("");
                  }}
                />
              )}
            </div>
          ) : (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm text-gray-300">Or analyze a public GitHub repo</label>
              <input
                value={repoInput}
                onChange={(e) => {
                  setRepoInput(e.target.value);
                  setSelectedRepo("");
                }}
                placeholder="facebook/react or https://github.com/facebook/react"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 text-gray-100 placeholder:text-gray-500"
              />
              <div className="flex flex-wrap gap-2">
                {POPULAR_REPOS.map((repo) => (
                  <button
                    key={repo}
                    type="button"
                    onClick={() => {
                      setRepoInput(repo);
                      setSelectedRepo("");
                    }}
                    className="rounded-full border border-slate-700 bg-slate-900/40 px-3 py-1 text-xs text-gray-300 hover:border-cyan-400/50 hover:text-cyan-200 transition"
                  >
                    {repo}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex md:items-end md:justify-end self-end">
            <button
              onClick={handleAnalyze}
              disabled={!(repoSource === "public" ? repoInput : selectedRepo) || analyzing}
              className="bg-primary px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition inline-flex items-center gap-2 shadow-lg shadow-cyan-500/10 min-w-[180px] justify-center h-12"
            >
              <FontAwesomeIcon icon={faSearch} />
              {analyzing ? "Analyzing..." : "Analyze Repo"}
            </button>
          </div>
        </div>
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
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleExportReport}
              disabled={exportingPdf}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-slate-900/60 px-4 py-2 text-sm font-medium text-cyan-200 hover:border-cyan-300 hover:bg-slate-800/80 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faDownload} />
              {exportingPdf ? "Building PDF..." : "Export PDF"}
            </button>
          </div>

          <ScoreCard score={finalScore} grade={finalGrade} />

          <div className="grid md:grid-cols-2 gap-6">
            <RadarChartComponent ruleScores={ruleScores} aiScores={aiScores} finalScores={breakdown} />
            <BarChartComponent data={breakdown} ruleScores={ruleScores} aiScores={aiScores} />
          </div>

          <RiskMeter score={finalScore} riskScore={risk?.score} meaning={risk?.meaning} reasons={risk?.reasons} />

          <details className="bg-cardDark/95 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/70 overflow-hidden">
            <summary className="cursor-pointer list-none px-6 py-4 select-none flex items-center justify-between gap-4 hover:bg-slate-800/30 transition">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faChartPie} className="text-cyan-300" />
                <div>
                  <h3 className="font-semibold">Deep Dive Analysis</h3>
                  <p className="text-sm text-gray-400">Open to see score math, historical context, and improvement plans.</p>
                </div>
              </div>
              <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
            </summary>

            <div className="px-6 pb-6 pt-2 space-y-6 animate-fade-in">
              <ScoreExplanationCard
                finalScore={finalScore}
                grade={finalGrade}
                ruleScores={ruleScores}
                aiScores={aiScores}
                aiSummary={summary}
                aiVerdict={verdict}
              />

              <AnalysisInsightsCard insights={result.insights} />

              <ImprovementGuide
                details={categoryDetails}
                currentScore={finalScore}
                currentGrade={finalGrade}
                analysis={result.ai_analysis}
              />

              <TechStack tech={tech} githubLanguages={githubLanguages} primaryLanguage={primaryLanguage} />

              <div className="grid md:grid-cols-2 gap-6">
                <InsightSection title="Strengths" items={strengths} type="good" />
                <InsightSection title="Weaknesses" items={weaknesses} type="bad" />
              </div>

              <InsightSection title="Recommendations" items={recommendations} type="suggestion" />
            </div>
          </details>
              </>
            );
          })()}
        </div>
      )}

      {result && (
        <div ref={reportRef} className="fixed left-[-12000px] top-0 w-[1120px] pointer-events-none">
          <ReportExportSheet
            result={result}
            finalScore={result.final?.score ?? result.final?.overall_score ?? 0}
            finalGrade={result.final?.grade ?? gradeFromScore(result.final?.score ?? result.final?.overall_score ?? 0)}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
