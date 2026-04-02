"""Recruitment module API router — aggregates all sub-routers."""

from fastapi import APIRouter

from .applications import router as applications_router
from .candidates import router as candidates_router
from .documents import router as documents_router
from .jobs import router as jobs_router
from .notes import router as notes_router
from .pipelines import router as pipelines_router
from .screening import router as screening_router

router = APIRouter(prefix="/recruitment", tags=["recruitment"])

router.include_router(jobs_router)
router.include_router(candidates_router)
router.include_router(applications_router)
router.include_router(documents_router)
router.include_router(notes_router)
router.include_router(pipelines_router)
router.include_router(screening_router)
