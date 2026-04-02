import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft,
  Edit,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react"
import {
  PageHeader,
  Badge,
  Button,
  Card,
  CardContent,
  DataTable,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Textarea,
  Select,
  LoadingSpinner,
  Separator,
} from "@/shared/components"
import { useToast } from "@/shared/components/toast"
import type { Column } from "@/shared/components"
import { useJob, useUpdateJob, useApplications } from "@/modules/recruitment/hooks"
import type { Application, JobOpeningStatus } from "@/types"
import { formatDate } from "@/lib/utils"

type AppRow = Application & Record<string, unknown>

const statusVariant: Record<
  JobOpeningStatus,
  "default" | "secondary" | "destructive" | "success" | "warning"
> = {
  draft: "secondary",
  open: "success",
  on_hold: "warning",
  closed: "destructive",
}

const editSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  employment_type: z.enum(["full_time", "part_time", "contract", "internship"]),
  experience_level: z.enum(["entry", "mid", "senior", "lead", "executive"]),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  currency: z.string().optional(),
  status: z.enum(["draft", "open", "on_hold", "closed"]),
})

type EditFormData = z.infer<typeof editSchema>

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const { toast } = useToast()

  const { data: job, isLoading } = useJob(jobId!)
  const { data: applications, isLoading: appsLoading } = useApplications({
    job_opening_id: jobId,
  })
  const updateJob = useUpdateJob()

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema) as never,
  })

  const openEdit = () => {
    if (!job) return
    form.reset({
      title: job.title,
      description: job.description ?? "",
      department: job.department ?? "",
      location: job.location ?? "",
      employment_type: job.employment_type,
      experience_level: job.experience_level,
      salary_min: job.salary_min?.toString() ?? "",
      salary_max: job.salary_max?.toString() ?? "",
      currency: job.currency ?? "",
      status: job.status,
    })
    setEditOpen(true)
  }

  const onEditSubmit = async (values: EditFormData) => {
    try {
      await updateJob.mutateAsync({
        id: jobId!,
        data: {
          title: values.title,
          description: values.description || undefined,
          department: values.department || undefined,
          location: values.location || undefined,
          employment_type: values.employment_type,
          experience_level: values.experience_level,
          salary_min: values.salary_min ? Number(values.salary_min) : undefined,
          salary_max: values.salary_max ? Number(values.salary_max) : undefined,
          currency: values.currency || undefined,
          status: values.status,
        },
      })
      setEditOpen(false)
      toast("Job updated successfully")
    } catch {
      toast("Failed to update job", "error")
    }
  }

  const appColumns: Column<AppRow>[] = [
    {
      key: "candidate_name",
      header: "Candidate",
      render: (app) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
            {app.candidate
              ? `${app.candidate.first_name[0]}${app.candidate.last_name[0]}`
              : "??"}
          </div>
          <span className="font-medium text-foreground">
            {app.candidate
              ? `${app.candidate.first_name} ${app.candidate.last_name}`
              : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (app) => <Badge variant="outline">{app.status}</Badge>,
    },
    {
      key: "current_stage",
      header: "Stage",
      render: (app) => (
        <span className="text-muted-foreground">
          {app.current_stage?.stage_name ?? "—"}
        </span>
      ),
    },
    {
      key: "applied_at",
      header: "Applied",
      render: (app) => (
        <span className="text-muted-foreground">{formatDate(app.applied_at)}</span>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Jobs
        </Link>
        <p className="text-muted-foreground">Job not found.</p>
      </div>
    )
  }

  const salary =
    job.salary_min || job.salary_max
      ? `${job.currency || "USD"} ${job.salary_min?.toLocaleString() ?? "?"} – ${job.salary_max?.toLocaleString() ?? "?"}`
      : null

  return (
    <div className="space-y-6">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Jobs
      </Link>

      <PageHeader
        title={job.title}
        description={job.department || undefined}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[job.status]} className="px-2.5 py-1">
              {job.status.replace("_", " ")}
            </Badge>
            <Button variant="outline" onClick={openEdit}>
              <Edit className="size-4" /> Edit
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="applications">
            Applications{applications ? ` (${applications.total})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
              {job.description && (
                <div className="sm:col-span-2">
                  <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </h4>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">
                    {job.description}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100">
                  <MapPin className="size-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{job.location || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100">
                  <Briefcase className="size-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employment Type</p>
                  <p className="text-sm font-medium capitalize">
                    {job.employment_type.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100">
                  <Users className="size-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Experience Level</p>
                  <p className="text-sm font-medium capitalize">{job.experience_level}</p>
                </div>
              </div>

              {salary && (
                <div className="flex items-start gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100">
                    <DollarSign className="size-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Salary Range</p>
                    <p className="text-sm font-medium">{salary}</p>
                  </div>
                </div>
              )}

              <div className="sm:col-span-2">
                <Separator />
                <div className="mt-4 flex gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Created: {formatDate(job.created_at)}
                  </div>
                  {job.published_at && (
                    <span>Published: {formatDate(job.published_at)}</span>
                  )}
                  {job.closed_at && (
                    <span>Closed: {formatDate(job.closed_at)}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <DataTable
            columns={appColumns}
            data={(applications?.items ?? []) as AppRow[]}
            isLoading={appsLoading}
            onRowClick={(row) => navigate(`/applications/${row.id}`)}
            emptyMessage="No applications yet."
          />
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Job Opening</DialogTitle>
            <DialogDescription>Update the job details below.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onEditSubmit as never)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <Input {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea {...form.register("description")} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Department</label>
                <Input {...form.register("department")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input {...form.register("location")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Type</label>
                <Select {...form.register("employment_type")}>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Level</label>
                <Select {...form.register("experience_level")}>
                  <option value="entry">Entry</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select {...form.register("status")}>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Min Salary</label>
                <Input type="number" {...form.register("salary_min")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Max Salary</label>
                <Input type="number" {...form.register("salary_max")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Currency</label>
                <Input {...form.register("currency")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateJob.isPending}>
                {updateJob.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
