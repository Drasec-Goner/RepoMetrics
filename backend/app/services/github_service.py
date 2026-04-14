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
