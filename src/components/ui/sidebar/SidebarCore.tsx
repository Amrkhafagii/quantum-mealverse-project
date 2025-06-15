
import React from "react";
import type { SidebarProps } from "./types";
import { useSidebar } from "./SidebarProvider";
import { cn } from "@/lib/utils";

/**
 * Sidebar main container. Uses context for collapsed state.
 */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  function Sidebar({ children, className, style }, ref) {
    const { collapsed } = useSidebar();
    return (
      <aside
        ref={ref}
        className={cn(
          "bg-sidebar transition-all duration-200",
          collapsed ? "w-16" : "w-64",
          className
        )}
        style={style}
        aria-label="Sidebar"
      >
        {children}
      </aside>
    );
  }
);

Sidebar.displayName = "Sidebar";

/**
 * SidebarTrigger toggles the sidebar open/collapsed state.
 */
export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  { className?: string; style?: React.CSSProperties }
>(function SidebarTrigger({ className, style }, ref) {
  const { toggle } = useSidebar();
  return (
    <button
      ref={ref}
      className={cn("absolute top-4 left-4 z-40 rounded p-2 bg-muted", className)}
      onClick={toggle}
      aria-label="Toggle sidebar"
      type="button"
      style={style}
    >
      <span className="sr-only">Toggle sidebar</span>
      {/* sidebar icon - could be a chevron */}
      <svg width="20" height="20" fill="none" stroke="currentColor">
        <path d="M7 4l6 6-6 6" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";
