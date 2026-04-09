"use client"

import * as React from "react"
import * as SlideOverPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const SlideOver = SlideOverPrimitive.Root

const SlideOverTrigger = SlideOverPrimitive.Trigger

const SlideOverClose = SlideOverPrimitive.Close

const SlideOverPortal = SlideOverPrimitive.Portal

const SlideOverOverlay = React.forwardRef<
  React.ElementRef<typeof SlideOverPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SlideOverPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SlideOverPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/90  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SlideOverOverlay.displayName = SlideOverPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 top-14 h-[calc(100vh-3.5rem)] w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 top-14 h-[calc(100vh-3.5rem)] w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SlideOverContentProps
  extends React.ComponentPropsWithoutRef<typeof SlideOverPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SlideOverContent = React.forwardRef<
  React.ElementRef<typeof SlideOverPrimitive.Content>,
  SlideOverContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SlideOverPortal>
    <SlideOverOverlay />
    <SlideOverPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SlideOverPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SlideOverPrimitive.Close>
    </SlideOverPrimitive.Content>
  </SlideOverPortal>
))
SlideOverContent.displayName = SlideOverPrimitive.Content.displayName

const SlideOverHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SlideOverHeader.displayName = "SlideOverHeader"

const SlideOverFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SlideOverFooter.displayName = "SlideOverFooter"

const SlideOverTitle = React.forwardRef<
  React.ElementRef<typeof SlideOverPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SlideOverPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SlideOverPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SlideOverTitle.displayName = SlideOverPrimitive.Title.displayName

const SlideOverDescription = React.forwardRef<
  React.ElementRef<typeof SlideOverPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SlideOverPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SlideOverPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SlideOverDescription.displayName = SlideOverPrimitive.Description.displayName

export {
  SlideOver,
  SlideOverPortal,
  SlideOverOverlay,
  SlideOverTrigger,
  SlideOverClose,
  SlideOverContent,
  SlideOverHeader,
  SlideOverFooter,
  SlideOverTitle,
  SlideOverDescription,
}
