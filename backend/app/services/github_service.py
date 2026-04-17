import httpx
from app.core.config import settings


class GitHubService:

    @staticmethod
    async def _request(url: str, token: str | None = None):
        headers = {}

        if token:
            headers["Authorization"] = f"Bearer {token}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)

            if response.status_code != 200:
                raise Exception(
                    f"GitHub API Error {response.status_code}: {response.text}"
                )

            return response.json()

    # -------------------------
    # REPO
    # -------------------------
    @staticmethod
    async def fetch_repo(owner, repo, token=None):
        url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}"
        return await GitHubService._request(url, token)

    # -------------------------
    # COMMITS
    # -------------------------
    @staticmethod
    async def fetch_commits(owner, repo, token=None):
        url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/commits"
        return await GitHubService._request(url, token)

    # -------------------------
    # CONTRIBUTORS
    # -------------------------
    @staticmethod
    async def fetch_contributors(owner, repo, token=None):
        url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/contributors"
        return await GitHubService._request(url, token)

    # -------------------------
    # PULL REQUESTS
    # -------------------------
    @staticmethod
    async def fetch_pulls(owner, repo, token=None):
        url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/pulls?state=all"
        return await GitHubService._request(url, token)

    # -------------------------
    # ISSUES
    # -------------------------
    @staticmethod
    async def fetch_issues(owner, repo, token=None):
        url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/issues?state=all"
        return await GitHubService._request(url, token)

    # -------------------------
    # LANGUAGES
    # -------------------------
    @staticmethod
    async def fetch_languages(owner, repo, token=None):
        url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/languages"
        raw = await GitHubService._request(url, token)

        if not isinstance(raw, dict) or not raw:
            return {}

        total_bytes = sum(v for v in raw.values() if isinstance(v, (int, float)))
        if total_bytes <= 0:
            return {}

        normalized = {
            str(language): float(bytes_count) / float(total_bytes)
            for language, bytes_count in raw.items()
            if isinstance(bytes_count, (int, float)) and bytes_count > 0
        }

        # Keep only meaningful contributors to reduce noise from tiny language fragments.
        filtered = {k: v for k, v in normalized.items() if v >= 0.001}
        source = filtered or normalized
        source_total = sum(source.values())
        if source_total <= 0:
            return {}

        return {k: v / source_total for k, v in source.items()}

    # -------------------------
    # README
    # -------------------------
    @staticmethod
    async def fetch_readme(owner, repo, token=None):
        url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/readme"

        headers = {
            "Accept": "application/vnd.github.v3.raw"
        }

        if token:
            headers["Authorization"] = f"Bearer {token}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)

            if response.status_code != 200:
                return ""

            return response.text

    @staticmethod
    async def fetch_user_repos(token: str):
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json"
        }

        params = {
            "per_page": 100,
            "sort": "updated"
        }

        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{settings.GITHUB_API_BASE}/user/repos",
                headers=headers,
                params=params
            )

        if res.status_code != 200:
            raise Exception(
                f"GitHub API Error {res.status_code}: {res.text}"
            )

        repos = res.json()

        # ✅ Clean structure for frontend dropdown
        return [
            {
                "name": repo["name"],
                "full_name": repo["full_name"],
                "owner": repo["owner"]["login"]
            }
            for repo in repos
        ]
# feat: integrate GitHub API (fetch repo details) @ 2026-03-22T10:23:00
# refactor: create github_service module @ 2026-03-22T10:07:00
# feat: fetch commits, issues, PRs from GitHub @ 2026-03-23T16:48:00
# fix: handle GitHub API errors @ 2026-03-23T16:12:00
# feat: fetch README from GitHub @ 2026-03-28T16:56:00
# feat: implement GitHub OAuth login @ 2026-04-05T10:21:00
# fix: resolve backend errors (AI + GitHub service) @ 2026-04-15T17:30:00# feat: add hybrid scoring logic at 2026-03-29 18:36:00
# refactor: final polishing and cleanup at 2026-04-03 20:25:00
# perf: add contributor metrics at 2026-04-09 16:02:00
# ui: add README parsing at 2026-04-13 10:27:00
# fix: refactor feature extraction at 2026-04-13 12:45:00
# feat: add contribution graph at 2026-04-14 11:59:00
# feat: add hybrid scoring logic at 2026-04-15 21:02:00
# feat: add GitHub API integration at 2026-03-22 15:54:00
# refactor: build dashboard UI at 2026-03-25 16:12:00
# perf: setup React frontend at 2026-03-31 19:43:00
# feat: refactor feature extraction at 2026-04-08 10:12:00
# docs: setup React frontend at 2026-04-08 16:40:00
# fix: implement commit analysis at 2026-04-10 19:46:00
