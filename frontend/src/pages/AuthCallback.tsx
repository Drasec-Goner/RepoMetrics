import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, saveAuth } from "../utils/auth";
import type { User } from "../types";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-danger mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="animate-pulse text-gray-400">
          Authenticating...
        </div>
      )}
    </div>
  );
};

export default AuthCallback;