import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"
import type { TenantUpdate } from "@/types"

export function useTenant() {
  return useQuery({
    queryKey: ["admin", "tenant"],
    queryFn: () => adminApi.getTenant(),
  })
}

export function useUpdateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TenantUpdate) => adminApi.updateTenant(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tenant"] })
    },
  })
}
