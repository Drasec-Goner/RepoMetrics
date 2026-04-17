import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, saveAuth } from "../utils/auth";
import type { User } from "../types";
import FullScreenLoader from "../components/ui/FullScreenLoader";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "RepoMetrics | Signing In";
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

      const userParam = params.get("user");
      const tokenParam = params.get("token");

      // ✅ IMPORTANT: Stop if no params
      if (!userParam || !tokenParam) {
        return;
      }

    const handleAuth = () => {
      try {
        logout();

        const params = new URLSearchParams(window.location.search);

        const userParam = params.get("user");
        const tokenParam = params.get("token");

        // Require both user and token to avoid saving incomplete auth state.
        if (tokenParam && userParam) {
          const user: User = JSON.parse(decodeURIComponent(userParam));
          const token = decodeURIComponent(tokenParam);
          saveAuth(user, token);
          navigate("/dashboard");
          return;
        }

        throw new Error("Invalid authentication callback payload");
      } catch (err) {
        console.error("Auth Error:", err);
        setError("Authentication failed. Please try again.");
      }
    };

    handleAuth();
  }, [navigate]);

  return error ? (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center rounded-2xl border border-red-500/30 bg-slate-900/80 p-6 max-w-md w-full">
        <p className="text-danger mb-4">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    </div>
  ) : (
    <FullScreenLoader
      title="Authenticating with GitHub"
      subtitle="Securing your session and preparing your dashboard..."
    />
  );
};

export default AuthCallback;