
import React from "react";
import type { SidebarContentProps } from "./types";
import { cn } from "@/lib/utils";

export function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div className={cn("flex flex-col flex-1 px-2 py-4", className)}>
      {children}
    </div>
  );
}
