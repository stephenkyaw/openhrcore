import type { Application, PipelineStage } from "@/types"
import { CandidateCard } from "./candidate-card"

interface PipelineColumnProps {
  stage: PipelineStage
  applications: Application[]
  allStages: PipelineStage[]
}

export function PipelineColumn({ stage, applications, allStages }: PipelineColumnProps) {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-slate-50/70">
      <div className="flex items-center justify-between border-b border-border px-3.5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
        <span className="flex size-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-600">
          {applications.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2.5">
        {applications.length === 0 && (
          <p className="py-10 text-center text-xs text-muted-foreground">
            No applications
          </p>
        )}
        {applications.map((app) => (
          <CandidateCard
            key={app.id}
            application={app}
            stages={allStages}
            currentStageId={stage.id}
          />
        ))}
      </div>
    </div>
  )
}
