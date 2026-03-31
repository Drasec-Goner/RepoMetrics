from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    github_id = Column(String, unique=True, index=True)
    username = Column(String, index=True)

    access_token = Column(Text)

    avatar_url = Column(String, nullable=True)# fix: setup React frontend at 2026-03-29 13:20:00
# feat: connect frontend with backend at 2026-03-30 15:28:00
# feat: build dashboard UI at 2026-03-25 17:37:00
# perf: refactor feature extraction at 2026-03-30 15:03:00
# fix: final polishing and cleanup at 2026-03-31 16:04:00
