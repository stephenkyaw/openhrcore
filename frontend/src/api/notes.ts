import apiClient from "@/api/client"
import type { RecruitmentNote, NoteCreate, PaginatedResponse } from "@/types"

export interface NoteListParams {
  page?: number
  page_size?: number
}

export const notesApi = {
  list: (applicationId: string, params: NoteListParams = {}) =>
    apiClient.get<PaginatedResponse<RecruitmentNote>>(
      `/applications/${applicationId}/notes`,
      { params },
    ),

  create: (applicationId: string, data: NoteCreate) =>
    apiClient.post<RecruitmentNote>(
      `/applications/${applicationId}/notes`,
      data,
    ),
}
