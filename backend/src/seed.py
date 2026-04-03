"""Seed the database with a default tenant, pipeline, and sample data.

Run with:  python -m src.seed
Idempotent — safe to run multiple times.
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from passlib.context import CryptContext

from src.config import get_settings
from src.modules.recruitment.domain.models import (
    Application,
    ApplicationCurrentStage,
    ApplicationStatus,
    Candidate,
    CandidateEmail,
    CandidatePhone,
    CandidateSource,
    EmailLabel,
    EmploymentType,
    ExperienceLevel,
    JobOpening,
    JobOpeningStatus,
    PhoneLabel,
    Pipeline,
    PipelineStage,
    Role,
    RolePermissionEntry,
    StageType,
    Tenant,
    UserAccount,
    UserRole,
)
from src.shared.database.session import init_engine

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TENANT_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")
RECRUITER_ID = uuid.UUID("00000000-0000-0000-0000-000000000003")
HIRING_MGR_ID = uuid.UUID("00000000-0000-0000-0000-000000000004")
VIEWER_ID = uuid.UUID("00000000-0000-0000-0000-000000000005")

DEFAULT_PASSWORD = pwd_context.hash("password123")


async def seed(session: AsyncSession) -> None:
    existing = await session.execute(select(Tenant).where(Tenant.id == TENANT_ID))
    if existing.scalar_one_or_none() is not None:
        print("[seed] Data already exists — skipping.")
        return

    now = datetime.now(timezone.utc)

    tenant = Tenant(
        id=TENANT_ID,
        tenant_id=TENANT_ID,
        name="Demo Organisation",
        slug="demo",
        is_active=True,
    )
    session.add(tenant)

    from src.modules.admin.permissions import DEFAULT_ROLE_PERMISSIONS, ROLE_DESCRIPTIONS

    existing_roles = await session.execute(
        select(Role).where(Role.tenant_id == TENANT_ID).limit(1)
    )
    if existing_roles.scalars().first() is None:
        role_defs = {
            "admin": uuid.UUID("00000000-0000-0000-0000-a00000000001"),
            "recruiter": uuid.UUID("00000000-0000-0000-0000-a00000000002"),
            "hiring_manager": uuid.UUID("00000000-0000-0000-0000-a00000000003"),
            "viewer": uuid.UUID("00000000-0000-0000-0000-a00000000004"),
        }
        for role_name, role_id in role_defs.items():
            role_obj = Role(
                id=role_id,
                tenant_id=TENANT_ID,
                name=role_name,
                description=ROLE_DESCRIPTIONS.get(role_name, ""),
                is_system=True,
            )
            session.add(role_obj)
            for perm in DEFAULT_ROLE_PERMISSIONS.get(role_name, []):
                session.add(RolePermissionEntry(
                    id=uuid.uuid4(),
                    tenant_id=TENANT_ID,
                    role_id=role_id,
                    permission=perm,
                ))

    user = UserAccount(
        id=USER_ID,
        tenant_id=TENANT_ID,
        keycloak_user_id=USER_ID,
        email="admin@openhrcore.dev",
        full_name="Dev Admin",
        password_hash=DEFAULT_PASSWORD,
        is_active=True,
        role=UserRole.ADMIN,
    )
    session.add(user)

    recruiter = UserAccount(
        id=RECRUITER_ID,
        tenant_id=TENANT_ID,
        keycloak_user_id=RECRUITER_ID,
        email="sarah.chen@openhrcore.dev",
        full_name="Sarah Chen",
        password_hash=DEFAULT_PASSWORD,
        is_active=True,
        role=UserRole.RECRUITER,
    )
    session.add(recruiter)

    hiring_mgr = UserAccount(
        id=HIRING_MGR_ID,
        tenant_id=TENANT_ID,
        keycloak_user_id=HIRING_MGR_ID,
        email="michael.torres@openhrcore.dev",
        full_name="Michael Torres",
        password_hash=DEFAULT_PASSWORD,
        is_active=True,
        role=UserRole.HIRING_MANAGER,
    )
    session.add(hiring_mgr)

    viewer = UserAccount(
        id=VIEWER_ID,
        tenant_id=TENANT_ID,
        keycloak_user_id=VIEWER_ID,
        email="julia.park@openhrcore.dev",
        full_name="Julia Park",
        password_hash=DEFAULT_PASSWORD,
        is_active=True,
        role=UserRole.VIEWER,
    )
    session.add(viewer)

    pipeline_id = uuid.uuid4()
    pipeline = Pipeline(
        id=pipeline_id,
        tenant_id=TENANT_ID,
        name="Default Pipeline",
        is_default=True,
    )
    session.add(pipeline)

    stage_defs = [
        ("Applied", StageType.SOURCED, 0),
        ("Screening", StageType.SCREENING, 1),
        ("Interview", StageType.INTERVIEW, 2),
        ("Offer", StageType.OFFER, 3),
        ("Hired", StageType.HIRED, 4),
        ("Rejected", StageType.REJECTED, 5),
    ]
    stages: dict[str, PipelineStage] = {}
    for name, stype, order in stage_defs:
        stage = PipelineStage(
            id=uuid.uuid4(),
            tenant_id=TENANT_ID,
            pipeline_id=pipeline_id,
            name=name,
            sort_order=order,
            stage_type=stype,
        )
        session.add(stage)
        stages[name] = stage

    jobs_data = [
        {
            "title": "Senior Backend Engineer",
            "description": "We are looking for a Senior Backend Engineer to join our platform team. You will design and build scalable APIs, improve system reliability, and mentor junior engineers.",
            "department": "Engineering",
            "location": "Remote",
            "employment_type": EmploymentType.FULL_TIME,
            "experience_level": ExperienceLevel.SENIOR,
            "salary_min": 120000,
            "salary_max": 160000,
            "currency": "USD",
            "status": JobOpeningStatus.OPEN,
            "published_at": now,
        },
        {
            "title": "Product Designer",
            "description": "Join our design team to create beautiful, user-centered experiences for our HR platform. You will work closely with product and engineering to ship world-class interfaces.",
            "department": "Design",
            "location": "New York, NY",
            "employment_type": EmploymentType.FULL_TIME,
            "experience_level": ExperienceLevel.MID,
            "salary_min": 90000,
            "salary_max": 130000,
            "currency": "USD",
            "status": JobOpeningStatus.OPEN,
            "published_at": now,
        },
        {
            "title": "Frontend Developer Intern",
            "description": "A 3-month internship working with React, TypeScript, and Tailwind CSS. You will ship real features alongside our engineering team.",
            "department": "Engineering",
            "location": "Remote",
            "employment_type": EmploymentType.INTERNSHIP,
            "experience_level": ExperienceLevel.ENTRY,
            "status": JobOpeningStatus.DRAFT,
        },
        {
            "title": "Head of People Operations",
            "description": "Lead our People team as we scale from 50 to 200 employees. Define culture, build processes, and create an environment where everyone does their best work.",
            "department": "People",
            "location": "San Francisco, CA",
            "employment_type": EmploymentType.FULL_TIME,
            "experience_level": ExperienceLevel.EXECUTIVE,
            "salary_min": 180000,
            "salary_max": 250000,
            "currency": "USD",
            "status": JobOpeningStatus.OPEN,
            "published_at": now,
        },
    ]

    jobs: list[JobOpening] = []
    for jd in jobs_data:
        job = JobOpening(
            id=uuid.uuid4(),
            tenant_id=TENANT_ID,
            created_by=USER_ID,
            **jd,
        )
        session.add(job)
        jobs.append(job)

    candidates_data = [
        {
            "first_name": "Alice",
            "last_name": "Johnson",
            "headline": "Senior Python Developer | FastAPI | PostgreSQL",
            "summary": "8 years of experience building scalable backend systems. Previously at Stripe and Shopify.",
            "source": CandidateSource.LINKEDIN,
            "email": "alice.johnson@example.com",
            "phone": "+1-555-0101",
        },
        {
            "first_name": "Bob",
            "last_name": "Martinez",
            "headline": "Full Stack Engineer | React & Node.js",
            "summary": "5 years in web development. Passionate about clean code and great UX.",
            "source": CandidateSource.REFERRAL,
            "email": "bob.martinez@example.com",
            "phone": "+1-555-0102",
        },
        {
            "first_name": "Carol",
            "last_name": "Williams",
            "headline": "UX/UI Designer | Figma | Design Systems",
            "summary": "6 years crafting user experiences for SaaS products. Previously at Notion.",
            "source": CandidateSource.DIRECT,
            "email": "carol.williams@example.com",
            "phone": "+1-555-0103",
        },
        {
            "first_name": "David",
            "last_name": "Chen",
            "headline": "DevOps Engineer | Kubernetes | AWS",
            "summary": "7 years in infrastructure and platform engineering.",
            "source": CandidateSource.JOB_BOARD,
            "email": "david.chen@example.com",
            "phone": "+1-555-0104",
        },
        {
            "first_name": "Emma",
            "last_name": "Taylor",
            "headline": "HR Director | People Ops | Startup Experience",
            "summary": "12 years leading People teams at high-growth startups. Built HR functions from scratch twice.",
            "source": CandidateSource.AGENCY,
            "email": "emma.taylor@example.com",
            "phone": "+1-555-0105",
        },
    ]

    candidates: list[Candidate] = []
    for cd in candidates_data:
        email_addr = cd.pop("email")
        phone_num = cd.pop("phone")
        cand = Candidate(
            id=uuid.uuid4(),
            tenant_id=TENANT_ID,
            **cd,
        )
        session.add(cand)
        candidates.append(cand)

        session.add(CandidateEmail(
            id=uuid.uuid4(),
            tenant_id=TENANT_ID,
            candidate_id=cand.id,
            email=email_addr,
            is_primary=True,
            label=EmailLabel.PERSONAL,
        ))
        session.add(CandidatePhone(
            id=uuid.uuid4(),
            tenant_id=TENANT_ID,
            candidate_id=cand.id,
            phone=phone_num,
            is_primary=True,
            label=PhoneLabel.MOBILE,
        ))

    applications_data = [
        (candidates[0], jobs[0], "Screening"),   # Alice -> Backend Engineer
        (candidates[1], jobs[0], "Interview"),    # Bob -> Backend Engineer
        (candidates[2], jobs[1], "Applied"),      # Carol -> Product Designer
        (candidates[3], jobs[0], "Applied"),      # David -> Backend Engineer
        (candidates[4], jobs[3], "Offer"),        # Emma -> Head of People
    ]

    for cand, job, stage_name in applications_data:
        app = Application(
            id=uuid.uuid4(),
            tenant_id=TENANT_ID,
            job_opening_id=job.id,
            candidate_id=cand.id,
            pipeline_id=pipeline_id,
            applied_at=now,
            status=ApplicationStatus.ACTIVE,
        )
        session.add(app)

        stage = stages[stage_name]
        session.add(ApplicationCurrentStage(
            id=uuid.uuid4(),
            tenant_id=TENANT_ID,
            application_id=app.id,
            pipeline_stage_id=stage.id,
            entered_at=now,
        ))

    await session.commit()
    print("[seed] Demo data created successfully.")


async def main() -> None:
    settings = get_settings()
    engine = init_engine(settings.DATABASE_URL)

    from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession as AS

    factory = async_sessionmaker(bind=engine, class_=AS, expire_on_commit=False)
    async with factory() as session:
        await seed(session)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
