import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/shared/auth/auth-context"

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@openhrcore.dev", role: "Full access" },
  { label: "Recruiter", email: "sarah.chen@openhrcore.dev", role: "Manage recruitment" },
  { label: "Hiring Manager", email: "michael.torres@openhrcore.dev", role: "Review & notes" },
  { label: "Viewer", email: "julia.park@openhrcore.dev", role: "Read-only" },
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      navigate("/", { replace: true })
    } catch {
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword("password123")
    setError("")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left: branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white">
            HR
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            OpenHRCore
          </span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight text-white">
            AI-Powered Recruitment Platform
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-400">
            Manage job postings, track candidates, automate screening, and make
            data-driven hiring decisions — all in one place.
          </p>

          <div className="mt-8 space-y-3">
            {["Multi-tenant SaaS", "Role-based access control", "AI CV screening", "Pipeline management"].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                <div className="flex size-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                  <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          OpenHRCore v0.1.0
        </p>
      </div>

      {/* Right: login form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white">
              HR
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              OpenHRCore
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your credentials to access your account
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogIn className="size-4" />
              )}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 px-3 text-xs text-slate-500">
                  Demo accounts (password: password123)
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.email}
                  type="button"
                  onClick={() => fillDemo(acct.email)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
                >
                  <p className="text-sm font-medium text-slate-900">{acct.label}</p>
                  <p className="text-[11px] text-slate-500">{acct.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
