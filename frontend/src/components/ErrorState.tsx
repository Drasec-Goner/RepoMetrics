import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faRotateRight } from "@fortawesome/free-solid-svg-icons";

interface Props {
  message: string;
  onRetry?: () => void;
}

const ErrorState = ({ message, onRetry }: Props) => {
  return (
    <div className="bg-cardDark/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-red-500/20 text-center">
      <div className="mb-4 flex items-center justify-center gap-2 text-red-300">
        <FontAwesomeIcon icon={faTriangleExclamation} />
        <span className="font-semibold">Something went wrong</span>
      </div>

      <p className="text-red-200 mb-4">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-lg shadow-lg shadow-cyan-500/10"
        >
          <FontAwesomeIcon icon={faRotateRight} />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;