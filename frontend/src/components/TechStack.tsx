import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faBolt } from "@fortawesome/free-solid-svg-icons";

interface Props {
  tech:
    | Record<string, number>
    | {
        detected_stack?: string[];
        confidence?: number;
      };
  githubLanguages?: Record<string, number>;
  primaryLanguage?: string;
}

const TechStack = ({ tech, githubLanguages = {}, primaryLanguage = "" }: Props) => {
  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
  const formatPercent = (value: number) => `${(clamp01(value) * 100).toFixed(1)}%`;

  const normalizeToPercentShares = (input: Array<[string, number]>) => {
    const clean = input
      .map(([name, value]) => [name, Number(value)] as [string, number])
      .filter(([, value]) => Number.isFinite(value) && value > 0);

    const total = clean.reduce((sum, [, value]) => sum + value, 0);
    if (total <= 0) return [] as Array<[string, number]>;

    return clean.map(([name, value]) => [name, value / total] as [string, number]);
  };

  const hasDetectedArray =
    typeof tech === "object" &&
    tech !== null &&
    "detected_stack" in tech &&
    Array.isArray((tech as { detected_stack?: string[] }).detected_stack);

  const detectedStack = hasDetectedArray
    ? (tech as { detected_stack?: string[] }).detected_stack ?? []
    : [];

  const confidence =
    typeof tech === "object" && tech !== null && "confidence" in tech
      ? Number((tech as { confidence?: number }).confidence ?? 0)
      : undefined;

  const scoreMap = hasDetectedArray
    ? Object.fromEntries(
        detectedStack.map((name) => [
          name,
          Math.max(0, Math.min(1, confidence ?? 0)),
        ])
      )
    : (tech as Record<string, number>);

  const aiEntries = Object.entries(scoreMap || {}).map(([name, value]) => [name, Number(value)] as [string, number]);
  const githubEntries = Object.entries(githubLanguages || {}).map(([name, value]) => [name, Number(value)] as [string, number]);
  const shouldUseGithubFallback = githubEntries.length > 0 || aiEntries.length === 0 || (typeof confidence === "number" && confidence <= 0.1);

  const entries = shouldUseGithubFallback ? githubEntries : aiEntries;
  const finalEntries =
    entries.length === 0 && primaryLanguage
      ? [[primaryLanguage, 1] as [string, number]]
      : entries;
  const normalizedEntries = normalizeToPercentShares(finalEntries);
  const sortedEntries = [...normalizedEntries]
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-cardDark/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700/70">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <FontAwesomeIcon icon={faLayerGroup} className="text-cyan-300" /> Tech Stack
      </h3>

      {!shouldUseGithubFallback && typeof confidence === "number" && (
        <p className="text-xs text-gray-400 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faBolt} className="text-violet-300" />
          Detection confidence: {formatPercent(confidence)}
        </p>
      )}

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Bars show relative share after normalization to 100%. Confidence reflects certainty of stack detection, not code quality.
      </p>

      {sortedEntries.length === 0 && (
        <p className="text-sm text-gray-400">No tech stack detected.</p>
      )}

      <div className="space-y-4">
        {sortedEntries.map(([name, confidence], index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{name}</span>
              <span className="text-gray-400">
                {formatPercent(confidence)}
              </span>
            </div>

            <div className="w-full bg-slate-700 h-2 rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${clamp01(confidence) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStack;