
import { ReactNode, CSSProperties } from "react";

/**
 * Sidebar context object and provider interface.
 * See migration guide in ./index.ts for advanced usage/integration tips.
 */
export interface SidebarContextProps {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (val: boolean) => void;
}
/**
 * Props for SidebarProvider
 */
export interface SidebarProviderProps {
  children: ReactNode;
}

/**
 * Main sidebar props.
 */
export interface SidebarProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Sidebar content area props.
 */
export interface SidebarContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Item container, for each menu or group.
 */
export interface SidebarMenuItemProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragEnd?: () => void;
}

/**
 * Props for menu buttons in the sidebar.
 * Use asChild + <NavLink> or <Link> for routing.
 */
export interface SidebarMenuButtonProps {
  asChild?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/** 
 * Deprecated - do not use SidebarGroup patterns, use your own wrappers.
 * These are included for backwards TS compatibility only.
 */
export interface SidebarGroupProps {
  children: ReactNode;
  className?: string;
}
export interface SidebarGroupLabelProps {
  children: ReactNode;
  className?: string;
}
export interface SidebarGroupContentProps {
  children: ReactNode;
  className?: string;
}
