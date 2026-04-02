import apiClient from "@/api/client"
import type {
  JobOpening,
  JobOpeningCreate,
  JobOpeningUpdate,
  JobOpeningStatus,
  PaginatedResponse,
} from "@/types"

export interface JobListParams {
  page?: number
  page_size?: number
  status?: JobOpeningStatus
}

export const jobsApi = {
  list: (params: JobListParams = {}) =>
    apiClient.get<PaginatedResponse<JobOpening>>("/jobs", { params }),

  get: (id: string) =>
    apiClient.get<JobOpening>(`/jobs/${id}`),

  create: (data: JobOpeningCreate) =>
    apiClient.post<JobOpening>("/jobs", data),

  update: (id: string, data: JobOpeningUpdate) =>
    apiClient.patch<JobOpening>(`/jobs/${id}`, data),
}
