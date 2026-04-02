import apiClient from "@/api/client"
import type { ScreeningResult } from "@/types"

export interface ScreeningTriggerResponse {
  detail: string
  application_id: string
}

export const screeningApi = {
  run: (applicationId: string) =>
    apiClient.post<ScreeningTriggerResponse>(
      `/applications/${applicationId}/screening/run`,
    ),

  getResult: (applicationId: string) =>
    apiClient.get<ScreeningResult>(
      `/applications/${applicationId}/screening-result`,
    ),
}
