from datetime import datetime, timedelta
from jose import JWTError, jwt

from app.core.config import settings


ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: timedelta):
    if not settings.SECRET_KEY:
        raise ValueError("SECRET_KEY is not configured")

    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    if not settings.SECRET_KEY:
        raise ValueError("SECRET_KEY is not configured")

    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc