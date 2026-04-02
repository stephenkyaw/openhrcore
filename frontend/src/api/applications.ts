import apiClient from "@/api/client"
import type {
  Application,
  ApplicationCreate,
  MoveStageRequest,
  StageTransition,
  PaginatedResponse,
} from "@/types"

export interface ApplicationListParams {
  page?: number
  page_size?: number
  job_opening_id?: string
}

export const applicationsApi = {
  list: (params: ApplicationListParams = {}) =>
    apiClient.get<PaginatedResponse<Application>>("/applications", { params }),

  get: (id: string) =>
    apiClient.get<Application>(`/applications/${id}`),

  create: (data: ApplicationCreate) =>
    apiClient.post<Application>("/applications", data),

  moveStage: (id: string, data: MoveStageRequest) =>
    apiClient.post<StageTransition>(`/applications/${id}/move-stage`, data),

  getStageHistory: (id: string) =>
    apiClient.get<StageTransition[]>(`/applications/${id}/stage-history`),
}
