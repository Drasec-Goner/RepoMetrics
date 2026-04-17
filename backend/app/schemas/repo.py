from pydantic import BaseModel


class RepoResponse(BaseModel):
    name: str
    full_name: str
    description: str | None
    stars: int
    forks: int
    open_issues: int