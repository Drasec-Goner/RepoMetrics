from pydantic import BaseModel

class RepoFeatures(BaseModel):

    commits: int
    contributors: int
    issues: int
    stars: int
    forks: int
    language: str


class RepoScores(BaseModel):

    activity_score: float
    collaboration_score: float
    popularity_score: float
    traditional_score: float
    ai_score: float
    final_score: float