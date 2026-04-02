import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/shared/auth/auth-context"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban,
  Settings,
  Menu,
  X,
  Bell,
  ChevronLeft,
  LogOut,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: Kanban },
  { label: "Settings", href: "/settings", icon: Settings },
]

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  recruiter: "Recruiter",
  hiring_manager: "Hiring Manager",
  viewer: "Viewer",
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const { pathname: currentPath } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const initials = user
    ? user.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-200 lg:static lg:z-auto",
          collapsed ? "lg:w-[68px]" : "lg:w-60",
          mobileOpen ? "w-60 translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className={cn(
          "flex h-14 items-center border-b border-white/[0.08] px-4",
          collapsed && "justify-center",
        )}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-xs font-bold text-white">
              HR
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight text-white whitespace-nowrap">
                OpenHRCore
              </span>
            )}
          </div>

          <button
            type="button"
            className="ml-auto rounded-md p-1 text-sidebar-foreground/60 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== "/" && currentPath.startsWith(item.href))
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-sidebar-foreground/70 hover:bg-white/[0.06] hover:text-white",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="size-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section + collapse */}
        <div className="border-t border-white/[0.08]">
          {/* User info */}
          {user && (
            <div className={cn(
              "flex items-center gap-2.5 px-4 py-3",
              collapsed && "justify-center px-2",
            )}>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-bold text-indigo-300">
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white">
                    {user.full_name}
                  </p>
                  <p className="truncate text-[11px] text-sidebar-foreground/50">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className={cn(
            "flex items-center gap-1 px-3 pb-3",
            collapsed && "justify-center",
          )}>
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground/60 transition-colors hover:bg-white/[0.06] hover:text-white",
                collapsed && "px-2",
              )}
              onClick={handleLogout}
              title={collapsed ? "Sign out" : undefined}
            >
              <LogOut className="size-4 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </button>

            <div className="flex-1" />

            <button
              type="button"
              className={cn(
                "hidden items-center rounded-lg p-2 text-sidebar-foreground/60 transition-colors hover:text-white lg:flex",
              )}
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1" />

          <button
            type="button"
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-[18px]" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-indigo-500" />
          </button>

          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
              {initials}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium leading-none text-foreground">
                {user?.full_name ?? "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
