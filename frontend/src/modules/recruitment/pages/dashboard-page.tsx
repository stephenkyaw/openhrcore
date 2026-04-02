import { Link } from "react-router-dom"
import {
  Briefcase,
  Users,
  Brain,
  FileText,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react"
import {
  Card,
  CardContent,
  Button,
} from "@/shared/components"
import { useJobs, useCandidates, useApplications } from "@/modules/recruitment/hooks"

export function DashboardPage() {
  const { data: jobs } = useJobs({ status: "open", page_size: 1 })
  const { data: allJobs } = useJobs({ page_size: 1 })
  const { data: candidates } = useCandidates({ page_size: 1 })
  const { data: applications } = useApplications({ page_size: 5 })

  const stats = [
    {
      label: "Open Positions",
      value: jobs?.total ?? 0,
      icon: Briefcase,
      href: "/jobs?status=open",
      color: "bg-indigo-50 text-indigo-600",
      iconBg: "bg-indigo-100",
    },
    {
      label: "Total Candidates",
      value: candidates?.total ?? 0,
      icon: Users,
      href: "/candidates",
      color: "bg-emerald-50 text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      label: "Applications",
      value: applications?.total ?? 0,
      icon: FileText,
      href: "/jobs",
      color: "bg-violet-50 text-violet-600",
      iconBg: "bg-violet-100",
    },
    {
      label: "All Jobs",
      value: allJobs?.total ?? 0,
      icon: TrendingUp,
      href: "/jobs",
      color: "bg-amber-50 text-amber-600",
      iconBg: "bg-amber-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Here&apos;s an overview of your recruitment activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="group transition-all hover:shadow-md hover:border-slate-300">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex size-11 items-center justify-center rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`size-5 ${stat.color.split(" ")[1]}`} />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
              <p className="text-xs text-muted-foreground">Common tasks at your fingertips</p>
            </div>
          </div>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link to="/jobs">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-indigo-200 hover:bg-indigo-50/50">
                <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-100">
                  <Plus className="size-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Create Job</p>
                  <p className="text-xs text-muted-foreground">Post a new position</p>
                </div>
              </div>
            </Link>
            <Link to="/candidates">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-emerald-200 hover:bg-emerald-50/50">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100">
                  <Users className="size-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Add Candidate</p>
                  <p className="text-xs text-muted-foreground">Register new talent</p>
                </div>
              </div>
            </Link>
            <Link to="/pipeline">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-violet-200 hover:bg-violet-50/50">
                <div className="flex size-9 items-center justify-center rounded-lg bg-violet-100">
                  <Brain className="size-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">View Pipeline</p>
                  <p className="text-xs text-muted-foreground">Kanban board view</p>
                </div>
              </div>
            </Link>
            <Link to="/jobs">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-amber-200 hover:bg-amber-50/50">
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100">
                  <Briefcase className="size-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Browse Jobs</p>
                  <p className="text-xs text-muted-foreground">All positions</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent Applications</h2>
              <p className="text-xs text-muted-foreground">Latest incoming applications</p>
            </div>
            <Link to="/jobs" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <CardContent>
            {applications?.items && applications.items.length > 0 ? (
              <div className="space-y-3">
                {applications.items.slice(0, 5).map((app) => (
                  <Link
                    key={app.id}
                    to={`/applications/${app.id}`}
                    className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {app.candidate
                          ? `${app.candidate.first_name[0]}${app.candidate.last_name[0]}`
                          : "??"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {app.candidate
                            ? `${app.candidate.first_name} ${app.candidate.last_name}`
                            : "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.job_opening?.title ?? "Unknown job"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {app.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                No applications yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
