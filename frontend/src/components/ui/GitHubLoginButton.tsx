const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");

const GitHubLoginButton = () => {
    const handleLogin = () => {
  window.location.href = `${BACKEND_URL}/api/auth/login`;
    };

  return (
    <button
      onClick={handleLogin}
      className="bg-primary hover:bg-indigo-500 transition px-6 py-3 rounded-xl font-medium shadow-lg"
    >
      Login with GitHub
    </button>
  );
};

export default GitHubLoginButton;