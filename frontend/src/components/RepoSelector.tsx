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
        <option key={repo.id ?? repo.full_name} value={repo.full_name}>
          {repo.full_name}
        </option>
      ))}
    </select>
  );
};

export default RepoSelector;