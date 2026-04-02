import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  applicationsApi,
  type ApplicationListParams,
} from "@/api/applications"
import type { ApplicationCreate, MoveStageRequest } from "@/types"

export function useApplications(params: ApplicationListParams = {}) {
  return useQuery({
    queryKey: ["applications", params],
    queryFn: () => applicationsApi.list(params).then((r) => r.data),
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["applications", id],
    queryFn: () => applicationsApi.get(id).then((r) => r.data),
    enabled: Boolean(id),
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ApplicationCreate) =>
      applicationsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.invalidateQueries({ queryKey: ["pipelines"] })
    },
  })
}

export function useMoveStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: MoveStageRequest
    }) => applicationsApi.moveStage(id, data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.invalidateQueries({
        queryKey: ["applications", variables.id],
      })
      queryClient.invalidateQueries({
        queryKey: ["applications", variables.id, "stageHistory"],
      })
      queryClient.invalidateQueries({ queryKey: ["pipelines"] })
    },
  })
}

export function useStageHistory(applicationId: string) {
  return useQuery({
    queryKey: ["applications", applicationId, "stageHistory"],
    queryFn: () =>
      applicationsApi.getStageHistory(applicationId).then((r) => r.data),
    enabled: Boolean(applicationId),
  })
}
