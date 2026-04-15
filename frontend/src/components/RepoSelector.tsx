import type { Repo } from "../types";

interface Props {
  repos: Repo[];
  selected: string;
  onChange: (value: string) => void;
}

const RepoSelector = ({ repos, selected, onChange }: Props) => {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="bg-cardDark border border-slate-700 px-4 py-2 rounded-lg w-full"
    >
      <option value="">Select a repository</option>

      {repos.map((repo) => (
        <option key={repo.id} value={repo.full_name}>
          {repo.full_name}
        </option>
      ))}
    </select>
  );
};

export default RepoSelector;# fix: add contribution graph at 2026-03-21 21:10:00
# fix: build dashboard UI at 2026-04-01 15:53:00
# docs: initialize project structure at 2026-04-03 12:40:00
# docs: integrate Gemini AI analysis at 2026-03-28 13:07:00
# ui: implement PR & issue scoring at 2026-04-10 19:21:00
# ui: fix frontend bugs at 2026-04-15 20:32:00
