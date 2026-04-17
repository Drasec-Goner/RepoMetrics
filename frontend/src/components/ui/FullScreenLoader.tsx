import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";

interface Props {
  title: string;
  subtitle?: string;
  fullScreen?: boolean;
}

const FullScreenLoader = ({ title, subtitle, fullScreen = true }: Props) => {
  const wrapperClass = fullScreen
    ? "fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4"
    : "w-full";

  return (
    <div className={wrapperClass} role="status" aria-live="polite">
      <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/90 px-6 py-5 shadow-2xl shadow-cyan-950/35 w-full max-w-md">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-300/10 text-cyan-200">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              {title}
              <FontAwesomeIcon icon={faWandMagicSparkles} className="text-cyan-300" />
            </p>
            {subtitle && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader;