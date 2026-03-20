import { useState } from "react";

type Props = {
  onAnalyze: (owner: string, repo: string) => void;
};

export default function RepoForm({ onAnalyze }: Props) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parts = url.split("/");
    const owner = parts[3];
    const repo = parts[4];

    onAnalyze(owner, repo);
  };

  return (
    <form onSubmit={handleSubmit} className="repo-form">
      <input
        type="text"
        placeholder="Enter GitHub repo URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button type="submit">Analyze</button>
    </form>
  );
}