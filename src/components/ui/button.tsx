import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-green-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg shadow-green-400/25 hover:from-green-500 hover:to-green-700 hover:shadow-xl hover:shadow-green-400/40 hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5",
        outline:
          "border-2 border-green-400/30 bg-black/20 text-green-400 shadow-lg shadow-green-400/10 hover:border-green-400/60 hover:bg-green-400/10 hover:shadow-green-400/20 hover:-translate-y-0.5",
        secondary:
          "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-600/25 hover:from-gray-500 hover:to-gray-600 hover:shadow-xl hover:shadow-gray-500/40 hover:-translate-y-0.5",
        ghost:
          "text-green-400 hover:bg-green-400/10 hover:text-green-300",
        link: "text-green-400 underline-offset-4 hover:underline hover:text-green-300",
      },
      size: {
        default: "h-10 px-6 py-2.5 has-[>svg]:px-4",
        sm: "h-8 rounded-lg gap-1.5 px-4 py-2 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-8 py-3 has-[>svg]:px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
