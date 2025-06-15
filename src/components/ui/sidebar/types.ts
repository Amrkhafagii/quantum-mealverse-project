
import { ReactNode, CSSProperties } from "react";

/**
 * Sidebar context object and provider interface.
 * @public
 */
export interface SidebarContextProps {
  /** Sidebar collapsed state */
  collapsed: boolean;
  /** Toggles the collapsed state */
  toggle: () => void;
  /** Set collapsed state directly */
  setCollapsed: (val: boolean) => void;
}

/**
 * Props for SidebarProvider
 * @public
 */
export interface SidebarProviderProps {
  /** Children components */
  children: ReactNode;
}

/**
 * Main sidebar props.
 * @public
 */
export interface SidebarProps {
  /** Sidebar content (typically SidebarContent and grouped menu) */
  children: ReactNode;
  /** Additional style for sidebar container */
  className?: string;
  /** Inline style for sidebar container */
  style?: CSSProperties;
}

/**
 * Sidebar content area props.
 * @public
 */
export interface SidebarContentProps {
  /** Main sidebar children (sidebar body) */
  children: ReactNode;
  /** Additional class for content */
  className?: string;
  /** Optional inline style */
  style?: CSSProperties;
}

/**
 * Item container, for each menu or group.
 * @public
 */
export interface SidebarMenuItemProps {
  /** Item children (usually SidebarMenuButton or custom) */
  children: ReactNode;
  /** Custom classes */
  className?: string;
  /** Inline style */
  style?: CSSProperties;
}

/**
 * Props for menu buttons in the sidebar.
 * @public
 */
export interface SidebarMenuButtonProps {
  /** Show child as root, or render directly as button */
  asChild?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * Sidebar group for grouping menu items or sections.
 * @public
 */
export interface SidebarGroupProps {
  children: ReactNode;
  className?: string;
}

/**
 * Sidebar group label.
 * @public
 */
export interface SidebarGroupLabelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Sidebar group content (usually wraps SidebarMenu).
 * @public
 */
export interface SidebarGroupContentProps {
  children: ReactNode;
  className?: string;
}
