// ---------------------------------------------------------------------------
// Enums (string literal unions matching backend Python enums)
// ---------------------------------------------------------------------------

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"

export type ExperienceLevel =
  | "entry"
  | "mid"
  | "senior"
  | "lead"
  | "executive"

export type JobOpeningStatus = "draft" | "open" | "on_hold" | "closed"

export type CandidateSource =
  | "direct"
  | "referral"
  | "linkedin"
  | "job_board"
  | "agency"
  | "other"

export type EmailLabel = "personal" | "work" | "other"

export type PhoneLabel = "mobile" | "home" | "work" | "other"

export type ApplicationStatus = "active" | "hired" | "rejected" | "withdrawn"

export type StageType =
  | "sourced"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn"

export type DocumentType = "cv" | "cover_letter" | "portfolio" | "other"

export type AIRunType = "cv_screening" | "scoring"

export type AIRunStatus = "pending" | "processing" | "completed" | "failed"

export type ScreeningRecommendation = "shortlist" | "review" | "reject"

// ---------------------------------------------------------------------------
// Generic pagination envelope
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ---------------------------------------------------------------------------
// Job Opening
// ---------------------------------------------------------------------------

export interface JobOpening {
  id: string
  tenant_id: string
  title: string
  description: string | null
  department: string | null
  location: string | null
  employment_type: EmploymentType
  experience_level: ExperienceLevel
  salary_min: number | null
  salary_max: number | null
  currency: string | null
  status: JobOpeningStatus
  published_at: string | null
  closed_at: string | null
  created_by: string | null
  application_count: number | null
  created_at: string
  updated_at: string
}

export interface JobOpeningCreate {
  title: string
  description?: string
  department?: string
  location?: string
  employment_type: EmploymentType
  experience_level: ExperienceLevel
  salary_min?: number
  salary_max?: number
  currency?: string
}

export interface JobOpeningUpdate {
  title?: string
  description?: string
  department?: string
  location?: string
  employment_type?: EmploymentType
  experience_level?: ExperienceLevel
  salary_min?: number
  salary_max?: number
  currency?: string
  status?: JobOpeningStatus
}

// ---------------------------------------------------------------------------
// Candidate
// ---------------------------------------------------------------------------

export interface CandidateEmail {
  id: string
  tenant_id: string
  candidate_id: string
  email: string
  is_primary: boolean
  label: EmailLabel
  created_at: string
  updated_at: string
}

export interface CandidatePhone {
  id: string
  tenant_id: string
  candidate_id: string
  phone: string
  is_primary: boolean
  label: PhoneLabel
  created_at: string
  updated_at: string
}

export interface Candidate {
  id: string
  tenant_id: string
  first_name: string
  last_name: string
  headline: string | null
  summary: string | null
  source: CandidateSource
  source_detail: string | null
  emails: CandidateEmail[]
  phones: CandidatePhone[]
  created_at: string
  updated_at: string
}

export interface CandidateCreate {
  first_name: string
  last_name: string
  headline?: string
  summary?: string
  source?: CandidateSource
  source_detail?: string
  emails?: { email: string; is_primary?: boolean; label?: EmailLabel }[]
  phones?: { phone: string; is_primary?: boolean; label?: PhoneLabel }[]
}

export interface CandidateUpdate {
  first_name?: string
  last_name?: string
  headline?: string
  summary?: string
  source?: CandidateSource
  source_detail?: string
}

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------

export interface ApplicationCurrentStage {
  id: string
  pipeline_stage_id: string
  stage_name: string | null
  stage_type: StageType | null
  entered_at: string
}

export interface Application {
  id: string
  tenant_id: string
  job_opening_id: string
  candidate_id: string
  pipeline_id: string | null
  applied_at: string
  status: ApplicationStatus
  rejection_reason: string | null
  candidate: Candidate | null
  job_opening: JobOpening | null
  current_stage: ApplicationCurrentStage | null
  created_at: string
  updated_at: string
}

export interface ApplicationCreate {
  job_opening_id: string
  candidate_id: string
  pipeline_id?: string
}

// ---------------------------------------------------------------------------
// Pipeline & Stages
// ---------------------------------------------------------------------------

export interface PipelineStage {
  id: string
  tenant_id: string
  pipeline_id: string
  name: string
  sort_order: number
  stage_type: StageType
  created_at: string
  updated_at: string
}

export interface Pipeline {
  id: string
  tenant_id: string
  name: string
  is_default: boolean
  job_opening_id: string | null
  stages: PipelineStage[]
  created_at: string
  updated_at: string
}

export interface PipelineStageCreate {
  name: string
  sort_order: number
  stage_type: StageType
}

export interface PipelineCreate {
  name: string
  is_default?: boolean
  job_opening_id?: string
  stages?: PipelineStageCreate[]
}

// ---------------------------------------------------------------------------
// Stage Transition
// ---------------------------------------------------------------------------

export interface StageTransition {
  id: string
  tenant_id: string
  application_id: string
  from_stage_id: string | null
  to_stage_id: string
  from_stage_name: string | null
  to_stage_name: string | null
  transitioned_at: string
  transitioned_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MoveStageRequest {
  to_stage_id: string
  notes?: string
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export interface CandidateDocument {
  id: string
  tenant_id: string
  candidate_id: string
  application_id: string | null
  document_type: DocumentType
  file_name: string
  file_key: string
  file_size_bytes: number
  mime_type: string
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export interface RecruitmentNote {
  id: string
  tenant_id: string
  application_id: string
  author_id: string | null
  content: string
  is_private: boolean
  author_name: string | null
  created_at: string
  updated_at: string
}

export interface NoteCreate {
  content: string
  is_private?: boolean
}

// ---------------------------------------------------------------------------
// AI Screening
// ---------------------------------------------------------------------------

export interface ScoreBreakdown {
  id: string
  criteria: string
  score: number
  max_score: number
  reason: string
}

export interface AIAnalysisRun {
  id: string
  application_id: string
  run_type: AIRunType
  status: AIRunStatus
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  ai_model: string
  ai_provider: string
  created_at: string
}

export interface ScreeningResult {
  id: string
  application_id: string
  overall_score: number
  recommendation: ScreeningRecommendation
  summary: string
  strengths: string[]
  weaknesses: string[]
  breakdowns: ScoreBreakdown[]
  analysis_run: AIAnalysisRun | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Pipeline Board (Kanban view)
// ---------------------------------------------------------------------------

export interface PipelineBoardColumn {
  stage: PipelineStage
  applications: Application[]
}

// ---------------------------------------------------------------------------
// Admin: Roles (dynamic)
// ---------------------------------------------------------------------------

export interface RoleDetail {
  id: string
  tenant_id: string
  name: string
  description: string
  is_system: boolean
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface RoleCreate {
  name: string
  description: string
  permissions: string[]
}

export interface RoleUpdate {
  name?: string
  description?: string
  permissions?: string[]
}

export interface PermissionInfo {
  key: string
  label: string
  group: string
}

// ---------------------------------------------------------------------------
// Admin: User Management
// ---------------------------------------------------------------------------

export interface UserAccount {
  id: string
  tenant_id: string
  keycloak_user_id: string
  email: string
  full_name: string
  is_active: boolean
  role: string
  created_at: string
  updated_at: string
}

export interface UserAccountCreate {
  email: string
  full_name: string
  password: string
  role: string
}

export interface UserAccountUpdate {
  full_name?: string
  email?: string
  role?: string
  is_active?: boolean
  password?: string
}

export interface RolePermissions {
  role: string
  description: string
  permissions: string[]
}

export interface CurrentUserProfile {
  id: string
  tenant_id: string
  email: string
  full_name: string
  role: string
  permissions: string[]
}

// ---------------------------------------------------------------------------
// Admin: Tenant
// ---------------------------------------------------------------------------

export interface TenantInfo {
  id: string
  name: string
  slug: string
  domain: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TenantUpdate {
  name?: string
  slug?: string
  domain?: string | null
}
