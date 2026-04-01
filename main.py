from fastapi import FastAPI
from app.api.routes import health, analyze
from app.core.config import settings
from app.core.logger import logger
from app.db.database import engine, Base
from app.db import models
from app.api.routes import auth

app = FastAPI(title=settings.APP_NAME)

# Routes
app.include_router(health.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME} API in {settings.ENVIRONMENT} mode")

    Base.metadata.create_all(bind=engine)


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down RepoMetrics API...")