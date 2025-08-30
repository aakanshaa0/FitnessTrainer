import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 focus:ring-offset-black",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg shadow-green-400/25 hover:from-green-500 hover:to-green-700 hover:shadow-xl hover:shadow-green-400/40",
        secondary:
          "border-transparent bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-600/25 hover:from-gray-500 hover:to-gray-600 hover:shadow-xl hover:shadow-gray-500/40",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/40",
        outline: "border-green-400/30 text-green-400 bg-black/20 hover:border-green-400/60 hover:bg-green-400/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
