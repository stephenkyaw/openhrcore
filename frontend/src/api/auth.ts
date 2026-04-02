import axios from "axios"

const authClient = axios.create({
  baseURL: "/api/v1/openhrcore/admin/auth",
  headers: { "Content-Type": "application/json" },
})

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: string
  tenant_id: string
  permissions: string[]
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export const authApi = {
  login: (email: string, password: string) =>
    authClient
      .post<LoginResponse>("/login", { email, password })
      .then((r) => r.data),

  getSession: () => {
    const token = localStorage.getItem("access_token")
    if (!token) return Promise.reject(new Error("No token"))
    return authClient
      .get<AuthUser>("/session", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => r.data)
  },

  logout: () => {
    localStorage.removeItem("access_token")
  },
}
