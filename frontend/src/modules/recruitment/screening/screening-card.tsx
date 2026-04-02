import { Check, X, Brain, Clock } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ScoreBadge,
  RecommendationBadge,
} from "@/shared/components"
import type { ScreeningResult } from "@/types"
import { cn, formatDateTime } from "@/lib/utils"

interface ScreeningCardProps {
  result: ScreeningResult
}

export function ScreeningCard({ result }: ScreeningCardProps) {
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex flex-col items-center gap-1.5">
            <ScoreBadge score={result.overall_score} className="size-16 text-lg" />
            <span className="text-xs font-medium text-muted-foreground">Overall</span>
          </div>
          <div className="space-y-2">
            <RecommendationBadge recommendation={result.recommendation} />
            <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-emerald-600">
              <Check className="size-4" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  <span>{s}</span>
                </li>
              ))}
              {result.strengths.length === 0 && (
                <li className="text-sm text-muted-foreground">None identified</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-red-600">
              <X className="size-4" /> Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <X className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <span>{w}</span>
                </li>
              ))}
              {result.weaknesses.length === 0 && (
                <li className="text-sm text-muted-foreground">None identified</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {result.breakdowns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.breakdowns.map((b) => {
              const pct = b.max_score > 0 ? (b.score / b.max_score) * 100 : 0
              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{b.criteria}</span>
                    <span className="text-muted-foreground">
                      {b.score}/{b.max_score}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{b.reason}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {result.analysis_run && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Brain className="size-3.5" />
            <span>{result.analysis_run.ai_model} ({result.analysis_run.ai_provider})</span>
          </div>
          {result.analysis_run.completed_at && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>Completed {formatDateTime(result.analysis_run.completed_at)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
