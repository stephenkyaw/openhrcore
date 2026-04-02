import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { pipelinesApi } from "@/api/pipelines"
import type { PipelineCreate } from "@/types"

export function usePipelines() {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: () => pipelinesApi.list().then((r) => r.data),
  })
}

export function usePipeline(id: string) {
  return useQuery({
    queryKey: ["pipelines", id],
    queryFn: () => pipelinesApi.get(id).then((r) => r.data),
    enabled: Boolean(id),
  })
}

export function useCreatePipeline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PipelineCreate) =>
      pipelinesApi.create(data).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] })
      queryClient.invalidateQueries({ queryKey: ["pipelines", data.id] })
      queryClient.invalidateQueries({
        queryKey: ["pipelines", data.id, "board"],
      })
    },
  })
}

export function usePipelineBoard(pipelineId: string) {
  return useQuery({
    queryKey: ["pipelines", pipelineId, "board"],
    queryFn: () => pipelinesApi.getBoard(pipelineId).then((r) => r.data),
    enabled: Boolean(pipelineId),
  })
}
