import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"
import type { UserAccountCreate, UserAccountUpdate } from "@/types"

export function useUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.listUsers(),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => adminApi.getUser(id),
    enabled: Boolean(id),
  })
}

export function useMe() {
  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => adminApi.getMe(),
  })
}

export function useRoles() {
  return useQuery({
    queryKey: ["admin", "roles"],
    queryFn: () => adminApi.getRoles(),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserAccountCreate) => adminApi.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserAccountUpdate }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}
