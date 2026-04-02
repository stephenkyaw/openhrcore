import apiClient from "@/api/client"
import type { Pipeline, PipelineCreate, PipelineBoardColumn } from "@/types"

export const pipelinesApi = {
  list: () => apiClient.get<Pipeline[]>("/pipelines"),

  get: (id: string) => apiClient.get<Pipeline>(`/pipelines/${id}`),

  create: (data: PipelineCreate) =>
    apiClient.post<Pipeline>("/pipelines", data),

  getBoard: (id: string) =>
    apiClient.get<PipelineBoardColumn[]>(`/pipelines/${id}/board`),
}
