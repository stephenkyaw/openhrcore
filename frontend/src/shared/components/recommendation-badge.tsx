import { Badge } from "@/shared/components/ui/badge"
import type { BadgeProps } from "@/shared/components/ui/badge"
import { cn } from "@/lib/utils"

type Recommendation = "shortlist" | "review" | "reject"

const config: Record<Recommendation, { label: string; variant: BadgeProps["variant"] }> = {
  shortlist: { label: "Shortlist", variant: "success" },
  review: { label: "Review", variant: "warning" },
  reject: { label: "Reject", variant: "destructive" },
}

interface RecommendationBadgeProps {
  recommendation: Recommendation
  className?: string
}

export function RecommendationBadge({ recommendation, className }: RecommendationBadgeProps) {
  const { label, variant } = config[recommendation]
  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
    </Badge>
  )
}

export type { Recommendation, RecommendationBadgeProps }
