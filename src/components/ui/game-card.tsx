import React from "react"
import { cn } from "@/lib/utils"

interface GameCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "purple" | "beige"
}

const GameCard = React.forwardRef<HTMLDivElement, GameCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-card text-card-foreground border shadow-lg",
      purple: "bg-game-purple text-game-beige shadow-xl",
      beige: "bg-game-beige-light text-foreground shadow-md border-2 border-game-purple/20"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 space-y-4 transition-all duration-300 hover:shadow-xl",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
GameCard.displayName = "GameCard"

const GameCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5", className)} {...props} />
))
GameCardHeader.displayName = "GameCardHeader"

const GameCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-bold leading-none tracking-tight", className)}
    {...props}
  />
))
GameCardTitle.displayName = "GameCardTitle"

const GameCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-base", className)} {...props} />
))
GameCardContent.displayName = "GameCardContent"

export { GameCard, GameCardHeader, GameCardTitle, GameCardContent }