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