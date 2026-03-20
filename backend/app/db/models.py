from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    github_id = Column(String, unique=True, index=True)
    username = Column(String, index=True)

    access_token = Column(Text)

    avatar_url = Column(String, nullable=True)