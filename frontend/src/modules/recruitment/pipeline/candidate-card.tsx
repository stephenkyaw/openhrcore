import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import {
  Card,
  CardContent,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
} from "@/shared/components"
import { useToast } from "@/shared/components/toast"
import { useMoveStage } from "@/modules/recruitment/hooks"
import type { Application, PipelineStage } from "@/types"

interface CandidateCardProps {
  application: Application
  stages: PipelineStage[]
  currentStageId?: string
}

export function CandidateCard({ application, stages, currentStageId }: CandidateCardProps) {
  const [moveOpen, setMoveOpen] = useState(false)
  const [targetStageId, setTargetStageId] = useState("")
  const moveStage = useMoveStage()
  const { toast } = useToast()

  const candidateName = application.candidate
    ? `${application.candidate.first_name} ${application.candidate.last_name}`
    : "Unknown Candidate"
  const jobTitle = application.job_opening?.title ?? "Unknown Job"
  const availableStages = stages.filter((s) => s.id !== currentStageId)

  const handleMove = async () => {
    if (!targetStageId) return
    try {
      await moveStage.mutateAsync({
        id: application.id,
        data: { to_stage_id: targetStageId },
      })
      setMoveOpen(false)
      setTargetStageId("")
      toast("Candidate moved successfully")
    } catch {
      toast("Failed to move candidate", "error")
    }
  }

  return (
    <>
      <Card className="transition-all hover:shadow-md hover:border-slate-300">
        <CardContent className="space-y-2 p-3">
          <div>
            <Link
              to={`/applications/${application.id}`}
              className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {candidateName}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{jobTitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px]">{application.status}</Badge>
          </div>

          <div className="flex items-center justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setMoveOpen(true)}
            >
              Move <ArrowRight className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move {candidateName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-sm font-medium text-foreground">Select target stage</label>
            <Select
              value={targetStageId}
              onChange={(e) => setTargetStageId(e.target.value)}
            >
              <option value="">Choose a stage...</option>
              {availableStages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={!targetStageId || moveStage.isPending}
            >
              {moveStage.isPending ? "Moving..." : "Move Stage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
