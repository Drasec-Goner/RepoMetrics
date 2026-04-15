from datetime import datetime


class FeatureService:

    @staticmethod
    def extract_features(repo, commits, contributors, pulls, issues, readme):
        features = {}

        # Activity Metrics
        features["commit_count"] = len(commits)
        features["recent_commits"] = FeatureService._recent_commit_score(commits)

        # Collaboration
        features["contributors"] = len(contributors)
        features["pr_total"] = len(pulls)
        features["pr_merged_ratio"] = FeatureService._pr_merge_ratio(pulls)
        features["issue_closure_rate"] = FeatureService._issue_closure_rate(issues)

        # Popularity
        features["stars"] = repo.get("stargazers_count", 0)
        features["forks"] = repo.get("forks_count", 0)

        # Documentation
        readme_text = ""
        if readme and "content" in readme:
            import base64
            readme_text = base64.b64decode(readme["content"]).decode("utf-8", errors="ignore")

        features["readme_length"] = len(readme_text)
        features["has_readme"] = len(readme_text) > 0

        return features

    @staticmethod
    def _recent_commit_score(commits):
        if not commits:
            return 0

        if not commits or "commit" not in commits[0]:
            return 0

        latest = commits[0]["commit"]["author"]["date"]
        latest_date = datetime.fromisoformat(latest.replace("Z", ""))

        days = (datetime.utcnow() - latest_date).days

        if days < 7:
            return 100
        elif days < 30:
            return 70
        elif days < 90:
            return 40
        return 10

    @staticmethod
    def _pr_merge_ratio(pulls):
        if not pulls:
            return 0
        merged = [p for p in pulls if p.get("merged_at")]
        return len(merged) / len(pulls)

    @staticmethod
    def _issue_closure_rate(issues):
        if not issues:
            return 0
        closed = [i for i in issues if i.get("state") == "closed"]
        return len(closed) / len(issues)
# init: create RepoMetrics project @ 2026-03-20T15:28:00
# init: create RepoMetrics project @ 2026-03-20T20:42:00
# init: create RepoMetrics project @ 2026-03-20T16:40:00
# feat: implement FeatureService @ 2026-03-24T13:00:00
# feat: add activity metrics (commits frequency) @ 2026-03-25T13:15:00
# feat: add collaboration metrics (PR merge ratio) @ 2026-03-26T21:11:00# perf: add hybrid scoring logic at 2026-03-23 14:01:00
# fix: add hybrid scoring logic at 2026-04-01 12:11:00
# refactor: add GitHub API integration at 2026-04-10 22:09:00
# fix: build dashboard UI at 2026-04-13 17:00:00
# ui: add hybrid scoring logic at 2026-04-07 14:34:00
# perf: add contributor metrics at 2026-04-08 16:12:00
# refactor: add charts visualization at 2026-04-11 15:37:00
# fix: implement radar chart at 2026-04-15 19:03:00
