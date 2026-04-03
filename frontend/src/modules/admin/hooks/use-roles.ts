import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"
import type { RoleCreate, RoleUpdate } from "@/types"

export function useDynamicRoles() {
  return useQuery({
    queryKey: ["admin", "dynamic-roles"],
    queryFn: () => adminApi.listRoles(),
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: () => adminApi.listPermissions(),
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleCreate) => adminApi.createRole(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "dynamic-roles"] })
      qc.invalidateQueries({ queryKey: ["admin", "roles"] })
    },
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleUpdate }) =>
      adminApi.updateRole(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "dynamic-roles"] })
      qc.invalidateQueries({ queryKey: ["admin", "roles"] })
    },
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "dynamic-roles"] })
      qc.invalidateQueries({ queryKey: ["admin", "roles"] })
    },
  })
}
