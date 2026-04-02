import { cn } from "@/lib/utils"

interface ScoreBadgeProps {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))

  let colorClasses: string
  if (clamped >= 70) {
    colorClasses = "bg-emerald-50 text-emerald-700 ring-emerald-200"
  } else if (clamped >= 40) {
    colorClasses = "bg-amber-50 text-amber-700 ring-amber-200"
  } else {
    colorClasses = "bg-red-50 text-red-700 ring-red-200"
  }

  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full text-xs font-bold ring-1",
        colorClasses,
        className,
      )}
    >
      {clamped}
    </span>
  )
}
