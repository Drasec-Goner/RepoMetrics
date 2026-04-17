import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Skeleton from "./ui/Skeleton";

const LoadingDashboard = () => {
  return (
    <div className="space-y-6 bg-cardDark/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700/70">
      <div className="flex items-center gap-2 text-cyan-300">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
        <span className="font-semibold">Analyzing repository</span>
        <FontAwesomeIcon icon={faChartLine} />
      </div>

      <Skeleton className="h-24 w-full" />

      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>

      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />

      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>

      <Skeleton className="h-40 w-full" />
    </div>
  );
};

export default LoadingDashboard;