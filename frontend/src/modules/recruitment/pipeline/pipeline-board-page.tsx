import { useEffect, useState } from "react"
import { Kanban } from "lucide-react"
import {
  PageHeader,
  Select,
  LoadingSpinner,
  EmptyState,
} from "@/shared/components"
import {
  usePipelines,
  usePipelineBoard,
} from "@/modules/recruitment/hooks"
import { PipelineColumn } from "./pipeline-column"

export function PipelineBoardPage() {
  const { data: pipelines, isLoading: pipelinesLoading } = usePipelines()
  const [selectedId, setSelectedId] = useState("")

  useEffect(() => {
    if (!selectedId && pipelines && pipelines.length > 0) {
      const defaultPipeline = pipelines.find((p) => p.is_default) ?? pipelines[0]
      setSelectedId(defaultPipeline.id)
    }
  }, [pipelines, selectedId])

  const selectedPipeline = pipelines?.find((p) => p.id === selectedId)
  const { data: board, isLoading: boardLoading } = usePipelineBoard(selectedId)

  const allStages =
    selectedPipeline?.stages ?? board?.map((col) => col.stage) ?? []

  if (pipelinesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!pipelines || pipelines.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pipeline Board"
          description="Visualize your recruitment pipeline"
        />
        <EmptyState
          icon={Kanban}
          title="No Pipelines"
          description="Create a pipeline to start tracking candidates through your recruitment stages."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Pipeline Board"
          description="Track candidates through recruitment stages"
        />
        {pipelines.length > 1 && (
          <div className="w-full sm:w-64">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Pipeline
            </label>
            <Select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.is_default ? " (Default)" : ""}
                </option>
              ))}
            </Select>
          </div>
        )}
        {pipelines.length === 1 && selectedPipeline && (
          <div className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
            {selectedPipeline.name}
          </div>
        )}
      </div>

      {boardLoading && (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {board && board.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.map((column) => (
            <PipelineColumn
              key={column.stage.id}
              stage={column.stage}
              applications={column.applications}
              allStages={allStages}
            />
          ))}
        </div>
      )}

      {board && board.length === 0 && !boardLoading && (
        <EmptyState
          icon={Kanban}
          title="No stages found"
          description="This pipeline doesn't have any stages configured yet."
        />
      )}
    </div>
  )
}
