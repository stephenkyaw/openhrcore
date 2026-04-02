import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { screeningApi } from "@/api/screening"

export function useRunScreening() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (applicationId: string) =>
      screeningApi.run(applicationId).then((r) => r.data),
    onSuccess: (_data, applicationId) => {
      queryClient.invalidateQueries({
        queryKey: ["screening", "result", applicationId],
      })
      queryClient.invalidateQueries({
        queryKey: ["applications", applicationId],
      })
    },
  })
}

export function useScreeningResult(applicationId: string) {
  return useQuery({
    queryKey: ["screening", "result", applicationId],
    queryFn: () =>
      screeningApi.getResult(applicationId).then((r) => r.data),
    enabled: Boolean(applicationId),
  })
}
