
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      // Mobile-friendly improvements
      "min-h-[44px] sm:min-h-[40px]", // iOS minimum touch target height
      "w-full overflow-x-auto scrollbar-hide", // Enable horizontal scrolling
      "gap-1", // Add consistent spacing between tabs
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      // Enhanced touch targets and responsive sizing
      "min-h-[40px] sm:min-h-[36px]", // Proper touch target height
      "min-w-[80px] sm:min-w-[100px]", // Minimum width to prevent cramping
      "px-2 py-1.5 sm:px-3 sm:py-2", // Responsive padding
      "text-xs sm:text-sm", // Responsive text size
      "flex-shrink-0", // Prevent tab shrinking in flex container
      "touch-manipulation", // Optimize for touch interactions
      "select-none", // Prevent text selection on mobile
      // Better active state for mobile
      "active:scale-95 transition-transform duration-100",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      // Mobile-friendly content spacing
      "mt-2 sm:mt-4", // Responsive top margin
      "px-1 sm:px-0", // Add padding on mobile for better content spacing
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
