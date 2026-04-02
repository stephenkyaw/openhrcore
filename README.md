# OpenHRCore

**AI-Powered Workforce Platform**

OpenHRCore is a production-ready, multi-tenant SaaS platform for workforce management. The first module — **OpenHRCore Recruit** — is an AI-powered Applicant Tracking System (ATS) that helps companies create job postings, manage candidates, upload CVs, track recruitment pipelines, run AI CV screening, and get hiring recommendations.

## Architecture

- **Modular Monolith** with Clean Architecture and Domain-Driven Design
- **Multi-tenant** — tenant isolation enforced at every query via JWT-extracted `tenant_id`
- **AI as decision support** — AI screening results are stored separately and never overwrite core entities

## Tech Stack

### Backend
- Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Alembic
- PostgreSQL, Redis, Dramatiq (background jobs)
- Pydantic v2, Keycloak (JWT auth), S3/MinIO (file storage)
- structlog for structured logging

### Frontend
- React 19, TypeScript, Vite
- Tailwind CSS v4, shadcn/ui-inspired components
- TanStack Query, React Hook Form + Zod, React Router

## Project Structure

```
openhrcore/
├── backend/
│   ├── src/
│   │   ├── main.py                      # FastAPI app factory
│   │   ├── config.py                    # Pydantic Settings
│   │   ├── worker.py                    # Dramatiq broker
│   │   ├── migrations/                  # Alembic migrations
│   │   ├── modules/
│   │   │   ├── recruitment/
│   │   │   │   ├── domain/models.py     # 17 SQLAlchemy models
│   │   │   │   ├── repository/          # Data access layer
│   │   │   │   ├── service/             # Business logic
│   │   │   │   ├── api/                 # FastAPI route handlers
│   │   │   │   ├── schemas/             # Pydantic request/response
│   │   │   │   └── tasks/               # Dramatiq background tasks
│   │   │   ├── ai/
│   │   │   │   ├── engine/              # AI provider abstraction
│   │   │   │   ├── schemas/             # AI input/output models
│   │   │   │   └── service.py           # Screening orchestrator
│   │   │   └── workflow/
│   │   │       └── service/             # Pipeline stage transitions
│   │   └── shared/
│   │       ├── auth/                    # Keycloak JWT validation
│   │       ├── database/               # Async engine + session
│   │       ├── storage/                # S3 client
│   │       └── common/                 # Exceptions, pagination, schemas
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── app/                        # Providers, Router
│   │   ├── api/                        # Axios API client + endpoints
│   │   ├── types/                      # TypeScript interfaces
│   │   ├── modules/recruitment/
│   │   │   ├── hooks/                  # TanStack Query hooks
│   │   │   ├── pages/                  # Job, Candidate, Application pages
│   │   │   ├── pipeline/               # Kanban board components
│   │   │   ├── screening/              # AI screening display
│   │   │   └── notes/                  # Notes panel
│   │   ├── shared/
│   │   │   ├── components/             # Reusable UI components
│   │   │   └── layouts/                # App shell layout
│   │   └── lib/                        # Utilities
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for frontend development)
- Python 3.12+ (for backend development)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repo-url> openhrcore
cd openhrcore

# Copy environment file
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec api alembic upgrade head
```

Services will be available at:
- **API**: http://localhost:8000 (docs at /docs)
- **Frontend**: http://localhost:5173
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

### Local Development

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -e ".[dev]"

# Start infrastructure
docker-compose up -d postgres redis minio

# Run migrations
alembic upgrade head

# Start the API server
uvicorn src.main:create_app --factory --reload --port 8000

# Start the worker (in a separate terminal)
dramatiq src.worker --processes 2 --threads 4
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

All endpoints are prefixed with `/api/v1/openhrcore/recruitment`.

| Method | Path | Description |
|--------|------|-------------|
| POST | /jobs | Create a job opening |
| GET | /jobs | List job openings |
| GET | /jobs/{id} | Get job detail |
| PATCH | /jobs/{id} | Update job |
| POST | /candidates | Create a candidate |
| GET | /candidates | List candidates |
| GET | /candidates/{id} | Get candidate profile |
| PATCH | /candidates/{id} | Update candidate |
| POST | /applications | Create an application |
| GET | /applications | List applications |
| GET | /applications/{id} | Get application detail |
| POST | /applications/{id}/move-stage | Move to pipeline stage |
| GET | /applications/{id}/stage-history | Stage transition history |
| POST | /candidates/{id}/documents/cv | Upload CV |
| POST | /applications/{id}/screening/run | Trigger AI screening |
| GET | /applications/{id}/screening-result | Get screening result |
| POST | /applications/{id}/notes | Create note |
| GET | /applications/{id}/notes | List notes |
| POST | /pipelines | Create pipeline |
| GET | /pipelines/{id} | Get pipeline with stages |
| GET | /pipelines/{id}/board | Pipeline Kanban board |

## Domain Models

17 models covering the full recruitment lifecycle:

- **Tenant** — Organization (multi-tenancy boundary)
- **UserAccount** — Users linked to Keycloak
- **JobOpening** — Job positions with status workflow
- **Candidate** — Applicant profiles with contact info
- **CandidateEmail / CandidatePhone** — Multi-value contacts
- **Pipeline / PipelineStage** — Configurable recruitment workflows
- **Application** — Links candidates to jobs
- **ApplicationCurrentStage / ApplicationStageTransition** — Stage tracking with full audit trail
- **CandidateDocument** — CV and document storage (S3)
- **RecruitmentNote** — Collaborative notes on applications
- **ActivityLog** — Generic audit log
- **AIAnalysisRun** — AI processing tracker
- **CandidateScreeningResult / CandidateScreeningScoreBreakdown** — Structured AI output

## AI Screening

The AI screening module uses a provider-abstraction pattern:

1. Upload a CV for a candidate
2. Create an application linking the candidate to a job
3. Trigger screening — enqueued as a Dramatiq background task
4. AI analyzes the CV against job requirements
5. Returns structured scores across 5 criteria (Skills Match, Experience, Education, Cultural Fit, Overall Impression)
6. Each criterion scored 0-20 (100 max), with recommendation: **shortlist** (>=70), **review** (40-69), **reject** (<40)

Results are stored separately from core entities — AI is decision support, not source of truth.

## Frontend Pages

- **Dashboard** — Overview stats and quick actions
- **Job Openings** — List, create, filter by status, detail view with applications
- **Candidates** — List, search, create, profile with contact info and documents
- **Application Detail** — Overview, AI screening results, stage timeline, notes
- **Pipeline Board** — Kanban view of applications grouped by pipeline stage

## License

MIT
