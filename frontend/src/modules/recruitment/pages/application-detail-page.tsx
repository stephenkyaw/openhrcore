import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Brain, Clock, FileText, User } from "lucide-react"
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  LoadingSpinner,
  EmptyState,
} from "@/shared/components"
import { useToast } from "@/shared/components/toast"
import {
  useApplication,
  useStageHistory,
  useScreeningResult,
  useRunScreening,
} from "@/modules/recruitment/hooks"
import type { ApplicationStatus } from "@/types"
import { formatDate, formatDateTime } from "@/lib/utils"
import { ScreeningCard } from "@/modules/recruitment/screening/screening-card"
import { NotesPanel } from "@/modules/recruitment/notes/notes-panel"

const statusVariant: Record<
  ApplicationStatus,
  "default" | "secondary" | "destructive" | "success" | "warning"
> = {
  active: "success",
  hired: "default",
  rejected: "destructive",
  withdrawn: "secondary",
}

export function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const { toast } = useToast()

  const { data: application, isLoading } = useApplication(applicationId!)
  const { data: stageHistory } = useStageHistory(applicationId!)
  const {
    data: screeningResult,
    isError: screeningError,
    isLoading: screeningLoading,
  } = useScreeningResult(applicationId!)
  const runScreening = useRunScreening()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="space-y-4">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
        <p className="text-muted-foreground">Application not found.</p>
      </div>
    )
  }

  const candidateName = application.candidate
    ? `${application.candidate.first_name} ${application.candidate.last_name}`
    : "Unknown Candidate"
  const jobTitle = application.job_opening?.title ?? "Unknown Job"

  const handleRunScreening = () => {
    runScreening.mutate(applicationId!, {
      onSuccess: () => toast("Screening triggered — results will appear shortly"),
      onError: () => toast("Failed to run screening", "error"),
    })
  }

  return (
    <div className="space-y-6">
      <Link
        to={
          application.job_opening_id
            ? `/jobs/${application.job_opening_id}`
            : "/jobs"
        }
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Job
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
            {application.candidate
              ? `${application.candidate.first_name[0]}${application.candidate.last_name[0]}`
              : "??"}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{candidateName}</h1>
            <p className="text-sm text-muted-foreground">{jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[application.status]} className="px-2.5 py-1">
            {application.status}
          </Badge>
          {application.current_stage && (
            <Badge variant="outline" className="px-2.5 py-1">
              {application.current_stage.stage_name}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="screening">AI Screening</TabsTrigger>
          <TabsTrigger value="timeline">Timeline & Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" /> Candidate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{candidateName}</span>
                </div>
                {application.candidate?.headline && (
                  <div className="flex justify-between gap-4">
                    <span className="shrink-0 text-muted-foreground">Headline</span>
                    <span className="text-right font-medium">
                      {application.candidate.headline}
                    </span>
                  </div>
                )}
                {application.candidate && (
                  <Link
                    to={`/candidates/${application.candidate.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    View full profile →
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" /> Application Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job</span>
                  <span className="font-medium">{jobTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusVariant[application.status]}>
                    {application.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Stage</span>
                  <span className="font-medium">
                    {application.current_stage?.stage_name ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applied</span>
                  <span className="font-medium">{formatDate(application.applied_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="screening">
          {screeningLoading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : screeningResult && !screeningError ? (
            <ScreeningCard result={screeningResult} />
          ) : (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={Brain}
                  title="No Screening Results"
                  description="Run an AI screening to evaluate this candidate against the job requirements."
                  action={
                    <Button
                      onClick={handleRunScreening}
                      disabled={runScreening.isPending}
                    >
                      <Brain className="size-4" />
                      {runScreening.isPending ? "Running..." : "Run AI Screening"}
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" /> Stage History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stageHistory && stageHistory.length > 0 ? (
                  <div className="space-y-0">
                    {stageHistory.map((transition, idx) => (
                      <div key={transition.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="mt-1.5 size-2.5 rounded-full bg-indigo-500" />
                          {idx < stageHistory.length - 1 && (
                            <div className="w-px flex-1 bg-border" />
                          )}
                        </div>
                        <div className="pb-5">
                          <p className="text-sm font-medium">
                            {transition.from_stage_name ? (
                              <>
                                {transition.from_stage_name} → {transition.to_stage_name}
                              </>
                            ) : (
                              <>Entered {transition.to_stage_name}</>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(transition.transitioned_at)}
                          </p>
                          {transition.notes && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {transition.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No stage history yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <NotesPanel applicationId={applicationId!} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
