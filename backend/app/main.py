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
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        logger.error(f"Database initialization failed: {exc}")
        logger.warning("Starting API without database schema initialization.")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down RepoMetrics API...")