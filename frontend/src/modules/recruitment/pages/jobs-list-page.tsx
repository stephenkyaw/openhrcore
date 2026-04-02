import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Textarea,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components"
import { useToast } from "@/shared/components/toast"
import type { Column } from "@/shared/components"
import { useJobs, useCreateJob } from "@/modules/recruitment/hooks"
import type { JobOpening, JobOpeningStatus } from "@/types"
import { formatDate } from "@/lib/utils"

type JobRow = JobOpening & Record<string, unknown>

const statusVariant: Record<
  JobOpeningStatus,
  "default" | "secondary" | "destructive" | "success" | "warning"
> = {
  draft: "secondary",
  open: "success",
  on_hold: "warning",
  closed: "destructive",
}

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  employment_type: z.enum(["full_time", "part_time", "contract", "internship"]),
  experience_level: z.enum(["entry", "mid", "senior", "lead", "executive"]),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  currency: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

const columns: Column<JobRow>[] = [
  {
    key: "title",
    header: "Position",
    render: (job) => (
      <div>
        <span className="font-medium text-foreground">{job.title}</span>
        {job.department && (
          <span className="ml-2 text-xs text-muted-foreground">{job.department}</span>
        )}
      </div>
    ),
  },
  {
    key: "location",
    header: "Location",
    render: (job) => (
      <span className="text-muted-foreground">{job.location || "—"}</span>
    ),
  },
  {
    key: "employment_type",
    header: "Type",
    render: (job) => (
      <Badge variant="secondary">{job.employment_type.replace("_", " ")}</Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (job) => (
      <Badge variant={statusVariant[job.status]}>{job.status.replace("_", " ")}</Badge>
    ),
  },
  {
    key: "application_count",
    header: "Applicants",
    render: (job) => (
      <span className="font-medium text-foreground">{job.application_count ?? 0}</span>
    ),
  },
  {
    key: "created_at",
    header: "Created",
    render: (job) => (
      <span className="text-muted-foreground">{formatDate(job.created_at)}</span>
    ),
  },
]

export function JobsListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const statusFilter =
    (searchParams.get("status") as JobOpeningStatus) || undefined
  const page = Number(searchParams.get("page")) || 1

  const { data, isLoading } = useJobs({ status: statusFilter, page, page_size: 10 })
  const createJob = useCreateJob()

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema) as never,
    defaultValues: {
      employment_type: "full_time",
      experience_level: "mid",
      currency: "USD",
    },
  })

  const onSubmit = async (values: JobFormData) => {
    try {
      await createJob.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        department: values.department || undefined,
        location: values.location || undefined,
        employment_type: values.employment_type,
        experience_level: values.experience_level,
        salary_min: values.salary_min ? Number(values.salary_min) : undefined,
        salary_max: values.salary_max ? Number(values.salary_max) : undefined,
        currency: values.currency || undefined,
      })
      setDialogOpen(false)
      form.reset()
      toast("Job opening created successfully")
    } catch {
      toast("Failed to create job opening", "error")
    }
  }

  const handleStatusChange = (status: string) => {
    const next = new URLSearchParams(searchParams)
    if (status === "all") {
      next.delete("status")
    } else {
      next.set("status", status)
    }
    next.delete("page")
    setSearchParams(next)
  }

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set("page", String(p))
    setSearchParams(next)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Openings"
        description="Manage and track your open positions"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" /> New Job
          </Button>
        }
      />

      <Tabs
        defaultValue={statusFilter || "all"}
        value={statusFilter || "all"}
        onValueChange={handleStatusChange}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="on_hold">On Hold</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={(data?.items ?? []) as JobRow[]}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/jobs/${row.id}`)}
        emptyMessage="No job openings found. Create your first one!"
      />

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.total_pages} ({data.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => setPage(data.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.total_pages}
              onClick={() => setPage(data.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Job Opening</DialogTitle>
            <DialogDescription>
              Fill in the details for the new position.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit as never)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                {...form.register("title")}
                placeholder="e.g. Senior Frontend Developer"
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                {...form.register("description")}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Department</label>
                <Input
                  {...form.register("department")}
                  placeholder="e.g. Engineering"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input
                  {...form.register("location")}
                  placeholder="e.g. Remote"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Employment Type</label>
                <Select {...form.register("employment_type")}>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Experience Level</label>
                <Select {...form.register("experience_level")}>
                  <option value="entry">Entry</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Min Salary</label>
                <Input
                  type="number"
                  {...form.register("salary_min")}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Max Salary</label>
                <Input
                  type="number"
                  {...form.register("salary_max")}
                  placeholder="80000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Currency</label>
                <Input {...form.register("currency")} placeholder="USD" />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createJob.isPending}>
                {createJob.isPending ? "Creating..." : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
