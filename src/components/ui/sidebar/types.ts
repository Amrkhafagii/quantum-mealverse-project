
import { ReactNode, ComponentType } from "react";

export interface SidebarContextProps {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (val: boolean) => void;
}

export interface SidebarProviderProps {
  children: ReactNode;
}

export interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarMenuItemProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarMenuButtonProps {
  children: ReactNode;
  className?: string;
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
