from pydantic import BaseModel


class UserCreate(BaseModel):
    github_id: str
    username: str
    access_token: str
    avatar_url: str | None = None


class UserResponse(BaseModel):
    id: int
    github_id: str
    username: str
    avatar_url: str | None

    class Config:
        from_attributes = True