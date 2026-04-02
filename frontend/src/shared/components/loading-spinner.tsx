import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "default" | "lg"
}

const sizeClasses = {
  sm: "size-4",
  default: "size-6",
  lg: "size-8",
}

export function LoadingSpinner({ className, size = "default" }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
    />
  )
}
