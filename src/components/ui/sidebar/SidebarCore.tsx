
import React from "react";
import type { SidebarProps } from "./types";
import { useSidebar } from "./SidebarProvider";
import { cn } from "@/lib/utils";

export function Sidebar({ children, className }: SidebarProps) {
  const { collapsed } = useSidebar();
  return (
    <aside
      className={cn(
        "bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-64",
        className
      )}
      aria-label="Sidebar"
    >
      {children}
    </aside>
  );
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar();
  return (
    <button
      className={cn("absolute top-4 left-4 z-40 rounded p-2 bg-muted", className)}
      onClick={toggle}
      aria-label="Toggle sidebar"
      type="button"
    >
      <span className="sr-only">Toggle sidebar</span>
      {/* sidebar icon - could be a chevron */}
      <svg width="20" height="20" fill="none" stroke="currentColor">
        <path d="M7 4l6 6-6 6" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </button>
  );
}
