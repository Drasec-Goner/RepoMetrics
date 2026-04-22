import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCircleCheck,
  faFolderTree,
} from "@fortawesome/free-solid-svg-icons";
import type { Repo } from "../types";

interface Props {
  repos: Repo[];
  selected: string;
  onChange: (value: string) => void;
}

const RepoSelector = ({ repos, selected, onChange }: Props) => {
  const sortedRepos = [...repos].sort((a, b) => a.full_name.localeCompare(b.full_name));
  const selectedRepo = sortedRepos.find((repo) => repo.full_name === selected);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="text-slate-400">Choose from your repositories</p>
        <p className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-slate-300">
          {sortedRepos.length} available
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300">
          <FontAwesomeIcon icon={faFolderTree} />
        </div>

        <select
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900/70 py-3 pl-10 pr-11 text-slate-100 shadow-sm transition hover:border-cyan-400/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
        >
          <option value="">Select a repository</option>

          {sortedRepos.map((repo) => (
            <option key={repo.id ?? repo.full_name} value={repo.full_name}>
              {repo.full_name}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      </div>

      {selectedRepo && (
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
          <FontAwesomeIcon icon={faCircleCheck} />
          Selected: {selectedRepo.full_name}
        </div>
      )}
    </div>
  );
};

export default RepoSelector;