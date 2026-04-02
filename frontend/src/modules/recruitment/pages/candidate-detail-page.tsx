import { useRef } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Upload,
  User,
  Briefcase,
} from "lucide-react"
import {
  PageHeader,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingSpinner,
  EmptyState,
  Separator,
} from "@/shared/components"
import { useToast } from "@/shared/components/toast"
import { useCandidate, useUploadCv } from "@/modules/recruitment/hooks"
import { formatDate } from "@/lib/utils"

export function CandidateDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const { data: candidate, isLoading } = useCandidate(candidateId!)
  const uploadCv = useUploadCv()

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !candidateId) return
    uploadCv.mutate(
      { candidateId, file },
      {
        onSuccess: () => toast("CV uploaded successfully"),
        onError: () => toast("Failed to upload CV", "error"),
      },
    )
    e.target.value = ""
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="space-y-4">
        <Link
          to="/candidates"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Candidates
        </Link>
        <p className="text-muted-foreground">Candidate not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/candidates"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Candidates
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700">
          {candidate.first_name[0]}{candidate.last_name[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {candidate.first_name} {candidate.last_name}
          </h1>
          {candidate.headline && (
            <p className="mt-0.5 text-sm text-muted-foreground">{candidate.headline}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">{candidate.source}</Badge>
            <span className="text-xs text-muted-foreground">
              Added {formatDate(candidate.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" /> Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.summary && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Summary</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{candidate.summary}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Source</p>
                <p className="mt-1 text-sm capitalize">{candidate.source.replace("_", " ")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" /> Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.emails?.length > 0 ? (
                candidate.emails.map((em) => (
                  <div key={em.id} className="flex items-center gap-2 text-sm">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>{em.email}</span>
                    {em.is_primary && (
                      <Badge variant="secondary" className="text-[10px]">Primary</Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No emails</p>
              )}
              <Separator />
              {candidate.phones?.length > 0 ? (
                candidate.phones.map((ph) => (
                  <div key={ph.id} className="flex items-center gap-2 text-sm">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>{ph.phone}</span>
                    {ph.is_primary && (
                      <Badge variant="secondary" className="text-[10px]">Primary</Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No phone numbers</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="size-4 text-muted-foreground" /> Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Briefcase}
                title="No applications"
                description="Navigate to a Job Opening to create an application for this candidate."
                className="py-8"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" /> Documents
              </CardTitle>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadCv.isPending}
                >
                  <Upload className="size-4" />
                  {uploadCv.isPending ? "Uploading..." : "Upload CV"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={FileText}
                title="No documents"
                description="Upload a CV or other documents to get started."
                className="py-8"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
