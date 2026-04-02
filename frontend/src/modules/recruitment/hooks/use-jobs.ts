import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { jobsApi, type JobListParams } from "@/api/jobs"
import type { JobOpeningCreate, JobOpeningUpdate } from "@/types"

export function useJobs(params: JobListParams = {}) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => jobsApi.list(params).then((r) => r.data),
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => jobsApi.get(id).then((r) => r.data),
    enabled: Boolean(id),
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: JobOpeningCreate) =>
      jobsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: JobOpeningUpdate
    }) => jobsApi.update(id, data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      queryClient.invalidateQueries({ queryKey: ["jobs", variables.id] })
    },
  })
}
