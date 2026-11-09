from fastapi import APIRouter

from app.api.v1.routers import health, info, session

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(info.router)
api_router.include_router(session.router)
