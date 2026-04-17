interface Props {
  message: string;
  onRetry?: () => void;
}

const ErrorState = ({ message, onRetry }: Props) => {
  return (
    <div className="bg-cardDark p-6 rounded-xl text-center">
      <p className="text-red-400 mb-4">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-primary px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;