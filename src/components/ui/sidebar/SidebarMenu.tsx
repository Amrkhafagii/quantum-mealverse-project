
import React from "react";
import type { SidebarMenuItemProps, SidebarMenuButtonProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * SidebarMenu: Container for a group of menu items.
 */
export const SidebarMenu = React.forwardRef<HTMLUListElement, { children: React.ReactNode; className?: string; style?: React.CSSProperties }>(
  function SidebarMenu({ children, className, style }, ref) {
    return <ul ref={ref} className={cn("flex flex-col space-y-1", className)} style={style}>{children}</ul>;
  }
);
SidebarMenu.displayName = "SidebarMenu";

/**
 * SidebarMenuItem: Container for a single item.
 */
export const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  function SidebarMenuItem({ children, className = "", style }, ref) {
    return <li ref={ref} className={cn("sidebar-menu-item", className)} style={style}>{children}</li>;
  }
);
SidebarMenuItem.displayName = "SidebarMenuItem";

/**
 * SidebarMenuButton: The main button interface for menu actions. Used alone or with `asChild`.
 */
export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  function SidebarMenuButton({ children, asChild, className, style, ...rest }, ref) {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        className: cn("sidebar-menu-btn", (children as any)?.props?.className, className),
        style,
        ref,
        ...rest,
      });
    }
    return (
      <button ref={ref} className={cn("sidebar-menu-btn", className)} style={style} {...rest}>
        {children}
      </button>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";
