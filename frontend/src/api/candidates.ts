import apiClient from "@/api/client"
import type {
  Candidate,
  CandidateCreate,
  CandidateUpdate,
  CandidateDocument,
  PaginatedResponse,
} from "@/types"

export interface CandidateListParams {
  page?: number
  page_size?: number
  search?: string
}

export const candidatesApi = {
  list: (params: CandidateListParams = {}) =>
    apiClient.get<PaginatedResponse<Candidate>>("/candidates", { params }),

  get: (id: string) =>
    apiClient.get<Candidate>(`/candidates/${id}`),

  create: (data: CandidateCreate) =>
    apiClient.post<Candidate>("/candidates", data),

  update: (id: string, data: CandidateUpdate) =>
    apiClient.patch<Candidate>(`/candidates/${id}`, data),

  uploadCv: (candidateId: string, file: File, applicationId?: string) => {
    const formData = new FormData()
    formData.append("file", file)

    return apiClient.post<CandidateDocument>(
      `/candidates/${candidateId}/documents/cv`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        params: applicationId ? { application_id: applicationId } : undefined,
      },
    )
  },
}
