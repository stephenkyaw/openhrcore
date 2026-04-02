import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Search } from "lucide-react"
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
} from "@/shared/components"
import { useToast } from "@/shared/components/toast"
import type { Column } from "@/shared/components"
import { useCandidates, useCreateCandidate } from "@/modules/recruitment/hooks"
import type { Candidate } from "@/types"
import { formatDate } from "@/lib/utils"

type CandidateRow = Candidate & Record<string, unknown>

const candidateSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  headline: z.string().optional(),
  summary: z.string().optional(),
  source: z.enum(["direct", "referral", "linkedin", "job_board", "agency", "other"]).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
})

type CandidateFormData = z.infer<typeof candidateSchema>

const columns: Column<CandidateRow>[] = [
  {
    key: "name",
    header: "Name",
    render: (c) => (
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
          {c.first_name[0]}{c.last_name[0]}
        </div>
        <div>
          <span className="font-medium text-foreground">{c.first_name} {c.last_name}</span>
          {c.headline && (
            <p className="max-w-[200px] truncate text-xs text-muted-foreground">{c.headline}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "email",
    header: "Email",
    render: (c) => {
      const primary = c.emails?.find((e) => e.is_primary)
      const email = primary?.email ?? c.emails?.[0]?.email
      return <span className="text-muted-foreground">{email ?? "—"}</span>
    },
  },
  {
    key: "source",
    header: "Source",
    render: (c) => <Badge variant="secondary">{c.source}</Badge>,
  },
  {
    key: "created_at",
    header: "Added",
    render: (c) => <span className="text-muted-foreground">{formatDate(c.created_at)}</span>,
  },
]

export function CandidatesListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "")
  const { toast } = useToast()

  const search = searchParams.get("search") || undefined
  const page = Number(searchParams.get("page")) || 1

  const { data, isLoading } = useCandidates({ search, page, page_size: 10 })
  const createCandidate = useCreateCandidate()

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema) as never,
    defaultValues: { source: "direct" },
  })

  const onSubmit = async (values: CandidateFormData) => {
    try {
      const payload: Parameters<typeof createCandidate.mutateAsync>[0] = {
        first_name: values.first_name,
        last_name: values.last_name,
        headline: values.headline || undefined,
        summary: values.summary || undefined,
        source: values.source || "direct",
      }
      if (values.email) {
        payload.emails = [{ email: values.email, is_primary: true, label: "work" }]
      }
      if (values.phone) {
        payload.phones = [{ phone: values.phone, is_primary: true, label: "mobile" }]
      }
      await createCandidate.mutateAsync(payload)
      setDialogOpen(false)
      form.reset()
      toast("Candidate added successfully")
    } catch {
      toast("Failed to add candidate", "error")
    }
  }

  const handleSearch = () => {
    const next = new URLSearchParams(searchParams)
    if (searchValue.trim()) {
      next.set("search", searchValue.trim())
    } else {
      next.delete("search")
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
        title="Candidates"
        description="Manage your talent pool"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" /> Add Candidate
          </Button>
        }
      />

      <div className="flex gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search candidates..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={(data?.items ?? []) as CandidateRow[]}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/candidates/${row.id}`)}
        emptyMessage="No candidates found."
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Candidate</DialogTitle>
            <DialogDescription>Enter the candidate's information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit as never)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  First Name <span className="text-destructive">*</span>
                </label>
                <Input {...form.register("first_name")} />
                {form.formState.errors.first_name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <Input {...form.register("last_name")} />
                {form.formState.errors.last_name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.last_name.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Headline</label>
              <Input
                {...form.register("headline")}
                placeholder="e.g. Senior Developer at Acme"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input type="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input {...form.register("phone")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Source</label>
              <Select {...form.register("source")}>
                <option value="direct">Direct</option>
                <option value="referral">Referral</option>
                <option value="linkedin">LinkedIn</option>
                <option value="job_board">Job Board</option>
                <option value="agency">Agency</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCandidate.isPending}>
                {createCandidate.isPending ? "Adding..." : "Add Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
