import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom"
import { AppLayout } from "@/shared/layouts"
import { useAuth } from "@/shared/auth/auth-context"
import { DashboardPage } from "@/modules/recruitment/pages/dashboard-page"
import { JobsListPage } from "@/modules/recruitment/pages/jobs-list-page"
import { JobDetailPage } from "@/modules/recruitment/pages/job-detail-page"
import { CandidatesListPage } from "@/modules/recruitment/pages/candidates-list-page"
import { CandidateDetailPage } from "@/modules/recruitment/pages/candidate-detail-page"
import { ApplicationDetailPage } from "@/modules/recruitment/pages/application-detail-page"
import { PipelineBoardPage } from "@/modules/recruitment/pipeline/pipeline-board-page"
import { SettingsPage } from "@/modules/recruitment/pages/settings-page"
import { UsersPage } from "@/modules/admin/pages/users-page"
import { LoginPage } from "@/pages/login-page"

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-3 border-slate-200 border-t-indigo-500" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="size-8 animate-spin rounded-full border-3 border-slate-200 border-t-indigo-500" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <LoginPage />
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <PublicRoute />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "jobs", element: <JobsListPage /> },
      { path: "jobs/:jobId", element: <JobDetailPage /> },
      { path: "candidates", element: <CandidatesListPage /> },
      { path: "candidates/:candidateId", element: <CandidateDetailPage /> },
      {
        path: "applications/:applicationId",
        element: <ApplicationDetailPage />,
      },
      { path: "pipeline", element: <PipelineBoardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
