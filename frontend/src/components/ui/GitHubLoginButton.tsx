import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch, faSpinner } from "@fortawesome/free-solid-svg-icons";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");

interface Props {
  className?: string;
}

const GitHubLoginButton = ({ className = "" }: Props) => {
  const [redirecting, setRedirecting] = useState(false);

  const handleLogin = () => {
    setRedirecting(true);
    window.location.href = `${BACKEND_URL}/api/auth/login`;
  };

  return (
    <button
      onClick={handleLogin}
      disabled={redirecting}
      className={`inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 text-slate-950 transition px-6 py-3 rounded-xl font-semibold shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      <FontAwesomeIcon icon={redirecting ? faSpinner : faCodeBranch} className={`text-base ${redirecting ? "animate-spin" : ""}`} />
      {redirecting ? "Redirecting..." : "Login with GitHub"}
    </button>
  );
};

export default GitHubLoginButton;