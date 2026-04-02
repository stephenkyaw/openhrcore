import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { candidatesApi, type CandidateListParams } from "@/api/candidates"
import type { CandidateCreate, CandidateUpdate } from "@/types"

export function useCandidates(params: CandidateListParams = {}) {
  return useQuery({
    queryKey: ["candidates", params],
    queryFn: () => candidatesApi.list(params).then((r) => r.data),
  })
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ["candidates", id],
    queryFn: () => candidatesApi.get(id).then((r) => r.data),
    enabled: Boolean(id),
  })
}

export function useCreateCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CandidateCreate) =>
      candidatesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
    },
  })
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: CandidateUpdate
    }) => candidatesApi.update(id, data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      queryClient.invalidateQueries({
        queryKey: ["candidates", variables.id],
      })
    },
  })
}

export function useUploadCv() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      candidateId,
      file,
      applicationId,
    }: {
      candidateId: string
      file: File
      applicationId?: string
    }) =>
      candidatesApi
        .uploadCv(candidateId, file, applicationId)
        .then((r) => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      queryClient.invalidateQueries({
        queryKey: ["candidates", variables.candidateId],
      })
    },
  })
}
