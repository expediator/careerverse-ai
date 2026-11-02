import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-indigo-600/20 text-indigo-400 border-indigo-500/30",
        secondary: "border-transparent bg-zinc-800 text-zinc-400",
        destructive: "border-transparent bg-rose-600/20 text-rose-400 border-rose-500/30",
        outline: "border-zinc-700 text-zinc-400",
        success: "border-transparent bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
        warning: "border-transparent bg-amber-600/20 text-amber-400 border-amber-500/30",
        violet: "border-transparent bg-violet-600/20 text-violet-400 border-violet-500/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
