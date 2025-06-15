
// SidebarMenu and associated primitives
import React from "react";
import type { SidebarMenuItemProps, SidebarMenuButtonProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * ---- SidebarMenu  ----
 * Groups SidebarMenuItem. Apply drag-and-drop handlers at this layer if needed.
 */
export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  { children: React.ReactNode; className?: string; style?: React.CSSProperties }
>(function SidebarMenu({ children, className, style }, ref) {
  return <ul ref={ref} className={cn("flex flex-col space-y-1", className)} style={style}>{children}</ul>;
});
SidebarMenu.displayName = "SidebarMenu";

/**
 * ---- SidebarMenuItem ----
 * Container for a single menu row. Add drag/drop props to the li if using custom DnD.
 */
export const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  function SidebarMenuItem({ children, className = "", style, draggable, onDragStart, onDragEnter, onDragEnd }, ref) {
    return (
      <li
        ref={ref}
        className={cn("sidebar-menu-item", className)}
        style={style}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragEnd={onDragEnd}
      >
        {children}
      </li>
    );
  }
);
SidebarMenuItem.displayName = "SidebarMenuItem";

/**
 * ---- SidebarMenuButton ----
 * Use as interactive element. For routing, use asChild + <NavLink> or <Link>.
 *
 * Example:
 *   <SidebarMenuButton asChild>
 *      <NavLink to="/yourroute" className="..." />
 *   </SidebarMenuButton>
 *
 * Animations (tailwind css) are supported on hover/active; customize with className.
 */
export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  function SidebarMenuButton({ children, asChild = false, className, style, ...rest }, ref) {
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

// No deprecated patterns here (no SidebarGroup etc)
