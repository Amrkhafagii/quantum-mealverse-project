
import React from "react";
import type { SidebarContentProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * SidebarContent provides the main content area inside the sidebar.
 * @param {SidebarContentProps} props
 */
export const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  function SidebarContent({ children, className = "", style }, ref) {
    return (
      <div ref={ref} className={cn("flex flex-col flex-1 px-2 py-4", className)} style={style}>
        {children}
      </div>
    );
  }
);
SidebarContent.displayName = "SidebarContent";
