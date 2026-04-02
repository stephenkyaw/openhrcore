"""Admin module API router — aggregates auth, user, and tenant sub-routers."""

from fastapi import APIRouter

from .auth import router as auth_router
from .tenant import router as tenant_router
from .users import router as users_router

router = APIRouter(prefix="/admin", tags=["admin"])

router.include_router(auth_router)
router.include_router(users_router)
router.include_router(tenant_router)
