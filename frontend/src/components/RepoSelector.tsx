import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCircleCheck,
  faFolderTree,
  faMagnifyingGlass,
  faClockRotateLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Repo } from "../types";

const RECENT_REPOS_STORAGE_KEY = "repometrics_recent_repos";
const MAX_RECENT_REPOS = 5;

const getOwnerName = (repo: Repo) => {
  if (typeof repo.owner === "string" && repo.owner.trim()) {
    return repo.owner;
  }

  if (repo.owner && typeof repo.owner === "object" && "login" in repo.owner) {
    return repo.owner.login;
  }

  return repo.full_name.split("/")[0] ?? "Unknown";
};

const fuzzyScore = (candidate: string, rawQuery: string) => {
  const query = rawQuery.trim().toLowerCase();
  const text = candidate.toLowerCase();

  if (!query) {
    return 1;
  }

  const directIndex = text.indexOf(query);
  if (directIndex >= 0) {
    const isPrefix = directIndex === 0;
    return 300 - directIndex + (isPrefix ? 25 : 0);
  }

  let score = 0;
  let searchFrom = 0;
  let previousIndex = -1;

  for (const char of query) {
    const idx = text.indexOf(char, searchFrom);
    if (idx === -1) {
      return -1;
    }

    score += 8;
    if (previousIndex >= 0) {
      const gap = idx - previousIndex - 1;
      score -= Math.min(gap, 6);
      if (gap === 0) {
        score += 5;
      }
    }

    previousIndex = idx;
    searchFrom = idx + 1;
  }

  score -= Math.max(text.length - query.length, 0) * 0.1;
  return score;
};

const loadRecentRepoNames = () => {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_REPOS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
};

const saveRecentRepoNames = (names: string[]) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(RECENT_REPOS_STORAGE_KEY, JSON.stringify(names));
  } catch {
    // Ignore storage write errors to keep selection flow uninterrupted.
  }
};

interface Props {
  repos: Repo[];
  selected: string;
  onChange: (value: string) => void;
}

const RepoSelector = ({ repos, selected, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentRepoNames, setRecentRepoNames] = useState<string[]>(() => loadRecentRepoNames());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const sortedRepos = useMemo(
    () => [...repos].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [repos]
  );
  const filteredRepos = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return sortedRepos;
    }

    return sortedRepos
      .map((repo) => ({
        repo,
        score: fuzzyScore(repo.full_name, normalized),
      }))
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.repo.full_name.localeCompare(b.repo.full_name);
      })
      .map((entry) => entry.repo);
  }, [query, sortedRepos]);

  const recentRepos = useMemo(() => {
    const repoMap = new Map(sortedRepos.map((repo) => [repo.full_name, repo]));
    return recentRepoNames.map((name) => repoMap.get(name)).filter((repo): repo is Repo => Boolean(repo));
  }, [recentRepoNames, sortedRepos]);

  const sectionedRepos = useMemo(() => {
    const sections: Array<{ title: string; icon?: typeof faClockRotateLeft; repos: Repo[] }> = [];
    let candidates = filteredRepos;

    if (!query.trim() && recentRepos.length > 0) {
      sections.push({ title: "Recently used", icon: faClockRotateLeft, repos: recentRepos });
      const recentSet = new Set(recentRepos.map((repo) => repo.full_name));
      candidates = filteredRepos.filter((repo) => !recentSet.has(repo.full_name));
    }

    const grouped = candidates.reduce((acc, repo) => {
      const owner = getOwnerName(repo);
      if (!acc.has(owner)) {
        acc.set(owner, [] as Repo[]);
      }
      acc.get(owner)?.push(repo);
      return acc;
    }, new Map<string, Repo[]>());

    const owners = [...grouped.keys()].sort((a, b) => a.localeCompare(b));
    owners.forEach((owner) => {
      const ownerRepos = grouped.get(owner) ?? [];
      sections.push({ title: owner, repos: ownerRepos });
    });

    let runningIndex = 0;
    const indexedSections = sections.map((section) => {
      const items = section.repos.map((repo) => ({ repo, index: runningIndex++ }));
      return {
        ...section,
        items,
      };
    });

    const flat = indexedSections.flatMap((section) => section.items.map((item) => item.repo));

    return {
      sections: indexedSections,
      flat,
      total: flat.length,
    };
  }, [filteredRepos, query, recentRepos]);

  const selectedRepo = sortedRepos.find((repo) => repo.full_name === selected);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(sectionedRepos.total > 0 ? 0 : -1);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [isOpen, sectionedRepos.total]);

  const selectRepo = (repoName: string) => {
    onChange(repoName);
    setIsOpen(false);
    setQuery("");

    setRecentRepoNames((previous) => {
      const next = [repoName, ...previous.filter((name) => name !== repoName)].slice(0, MAX_RECENT_REPOS);
      saveRecentRepoNames(next);
      return next;
    });
  };

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (sectionedRepos.total === 0) {
        return;
      }
      setActiveIndex((prev) => {
        if (prev < 0) {
          return 0;
        }
        return Math.min(prev + 1, sectionedRepos.total - 1);
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (sectionedRepos.total === 0) {
        return;
      }
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const repo = sectionedRepos.flat[activeIndex];
      if (repo) {
        selectRepo(repo.full_name);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="text-slate-400">Choose from your repositories</p>
        <p className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-slate-300">
          {sortedRepos.length} available
        </p>
      </div>

      <div className="relative" ref={containerRef}>
        <div className="pointer-events-none absolute left-3 top-4 text-cyan-300">
          <FontAwesomeIcon icon={faFolderTree} />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/70 py-3 pl-10 pr-11 text-left text-slate-100 shadow-sm transition hover:border-cyan-400/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <p className="truncate text-sm sm:text-base">
            {selectedRepo?.full_name ?? "Select a repository"}
          </p>
          {selectedRepo ? (
            <p className="mt-1 text-xs text-cyan-200/80">Ready to analyze</p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">Search by owner or repository name</p>
          )}
        </button>

        <div className="pointer-events-none absolute right-3 top-4 text-slate-400">
          <FontAwesomeIcon icon={faChevronDown} />
        </div>

        {isOpen && (
          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950/95 shadow-2xl backdrop-blur">
            <div className="border-b border-slate-800 p-2">
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </div>
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search repositories..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2.5 pl-9 pr-8 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                    aria-label="Clear repository search"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto py-1" role="listbox" aria-label="Repositories">
              {sectionedRepos.total === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400">No repositories match your search.</p>
              ) : (
                sectionedRepos.sections.map((section) => (
                  <div key={section.title} className="py-1">
                    <div className="sticky top-0 z-10 border-y border-slate-800 bg-slate-900/95 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        {section.icon && <FontAwesomeIcon icon={section.icon} className="text-slate-500" />}
                        {section.title}
                      </span>
                    </div>

                    {section.items.map(({ repo, index }) => {
                      const isSelected = repo.full_name === selected;
                      const isActive = index === activeIndex;

                      return (
                        <button
                          type="button"
                          key={repo.id ?? repo.full_name}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => selectRepo(repo.full_name)}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition ${
                            isSelected
                              ? "bg-cyan-500/15 text-cyan-100"
                              : isActive
                                ? "bg-slate-800/90 text-slate-100"
                                : "text-slate-300 hover:bg-slate-800/70"
                          }`}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <span className="truncate">{repo.full_name}</span>
                          {isSelected && (
                            <span className="text-emerald-300">
                              <FontAwesomeIcon icon={faCircleCheck} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
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