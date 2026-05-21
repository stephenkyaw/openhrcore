from fastapi import APIRouter

from app.features.user.router import router as user_router

api_router = APIRouter()
api_router.include_router(user_router)
