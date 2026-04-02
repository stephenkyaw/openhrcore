import axios from "axios"
import type {
  CurrentUserProfile,
  RolePermissions,
  TenantInfo,
  TenantUpdate,
  UserAccount,
  UserAccountCreate,
  UserAccountUpdate,
} from "@/types"

const adminClient = axios.create({
  baseURL: "/api/v1/openhrcore/admin",
  headers: { "Content-Type": "application/json" },
})

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const adminApi = {
  // Users
  listUsers: () =>
    adminClient.get<UserAccount[]>("/users").then((r) => r.data),

  createUser: (data: UserAccountCreate) =>
    adminClient.post<UserAccount>("/users", data).then((r) => r.data),

  getUser: (id: string) =>
    adminClient.get<UserAccount>(`/users/${id}`).then((r) => r.data),

  updateUser: (id: string, data: UserAccountUpdate) =>
    adminClient.patch<UserAccount>(`/users/${id}`, data).then((r) => r.data),

  deactivateUser: (id: string) =>
    adminClient.delete<UserAccount>(`/users/${id}`).then((r) => r.data),

  getMe: () =>
    adminClient.get<CurrentUserProfile>("/users/me").then((r) => r.data),

  getRoles: () =>
    adminClient.get<RolePermissions[]>("/users/roles/list").then((r) => r.data),

  // Tenant
  getTenant: () =>
    adminClient.get<TenantInfo>("/tenant").then((r) => r.data),

  updateTenant: (data: TenantUpdate) =>
    adminClient.patch<TenantInfo>("/tenant", data).then((r) => r.data),
}
