
import { ReactNode, ComponentType, CSSProperties } from "react";

/**
 * Sidebar context object and provider interface.
 */
export interface SidebarContextProps {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (val: boolean) => void;
}

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
 * Sidebar content block.
 */
export interface SidebarContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Item container.
 */
export interface SidebarMenuItemProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Button interface, can be rendered as a button or pass asChild to render as anchor, etc.
 */
export interface SidebarMenuButtonProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  asChild?: boolean;
  onClick?: () => void;
}

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

