
import React from "react";
import type { SidebarMenuItemProps, SidebarMenuButtonProps } from "./types";
import { cn } from "@/lib/utils";

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col space-y-1">{children}</ul>;
}

export function SidebarMenuItem({ children, className }: SidebarMenuItemProps) {
  return <li className={cn("sidebar-menu-item", className)}>{children}</li>;
}

export function SidebarMenuButton({
  children,
  asChild,
  className,
  ...rest
}: SidebarMenuButtonProps) {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      className: cn("sidebar-menu-btn", (children as any)?.props?.className, className),
      ...rest,
    });
  }
  return (
    <button className={cn("sidebar-menu-btn", className)} {...rest}>
      {children}
    </button>
  );
}
