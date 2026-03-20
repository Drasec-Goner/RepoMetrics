import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../utils/auth";
import type { User } from "../types";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const userParam = params.get("user");
        const tokenParam = params.get("token");

        // ✅ CASE 1: Token-based auth (preferred)
        if (tokenParam) {
          const decodedToken = decodeURIComponent(tokenParam);

          // ⚠️ Optional: If backend also sends user separately
          if (userParam) {
            const user: User = JSON.parse(decodeURIComponent(userParam));
            saveAuth(user, decodedToken);
          } else {
            // fallback (you may fetch user later)
            saveAuth({ id: 0, login: "unknown", avatar_url: "" }, decodedToken);
          }

          navigate("/dashboard");
          return;
        }

        // ✅ CASE 2: User-only auth
        if (userParam) {
          const decoded = decodeURIComponent(userParam);
          const user: User = JSON.parse(decoded);

          saveAuth(user);
          navigate("/dashboard");
          return;
        }

        // ❌ No valid data
        throw new Error("No authentication data found");
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