from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    github_id = Column(String, unique=True, index=True)
    username = Column(String, index=True)

    access_token = Column(Text)

    avatar_url = Column(String, nullable=True)# fix: setup React frontend at 2026-03-29 13:20:00
