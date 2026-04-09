from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import health, analyze
from app.core.config import settings
from app.core.logger import logger
from app.db.database import engine, Base
from app.db import models
from app.api.routes import auth
from app.api.routes import user

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(user.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(auth.router)



@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME} API in {settings.ENVIRONMENT} mode")

    Base.metadata.create_all(bind=engine)


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down RepoMetrics API...")
# setup: initialize FastAPI backend @ 2026-03-21T14:06:00
# feat: add health check endpoint @ 2026-03-21T19:36:00
# feat: extract stars, forks, issues @ 2026-03-24T19:53:00
# feat: compute recent activity score @ 2026-03-25T16:34:00
# feat: contributor distribution analysis @ 2026-03-26T19:16:00
# feat: issue closure rate calculation @ 2026-03-27T11:36:00
# feat: detect documentation sections (install, usage) @ 2026-03-28T21:11:00
# feat: documentation quality analysis @ 2026-03-29T15:16:00
# feat: implement rule-based scoring engine @ 2026-03-30T12:56:00
# feat: generate repository summary @ 2026-03-31T10:03:00
# feat: generate strengths and weaknesses @ 2026-04-01T22:22:00
# refactor: normalize score weights @ 2026-04-02T21:40:00
# feat: detect tech stack and frameworks @ 2026-04-03T11:15:00
# improve: optimize prompt engineering @ 2026-04-04T13:44:00
# feat: store users in database @ 2026-04-06T22:08:00
# feat: save access token @ 2026-04-06T22:17:00
# feat: fetch user repositories @ 2026-04-07T21:28:00
# feat: create base layout @ 2026-04-08T13:38:00
# feat: add repo input form @ 2026-04-09T15:32:00