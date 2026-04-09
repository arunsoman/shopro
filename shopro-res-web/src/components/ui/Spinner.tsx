import React from 'react'
import { cn } from "@/lib/utils"

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-4",
  }

  return (
    <div className={cn(
      "animate-spin rounded-full border-t-primary border-r-transparent border-b-transparent border-l-transparent",
      sizeClasses[size],
      className
    )} />
  )
}
