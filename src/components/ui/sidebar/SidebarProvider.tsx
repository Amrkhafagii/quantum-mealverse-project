import React, { createContext, useContext, useState, useCallback } from "react";
import type { SidebarContextProps, SidebarProviderProps } from "./types";
import { useSidebarState } from "./useSidebarState";

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export function SidebarProvider({ children }: SidebarProviderProps) {
  const { collapsed, toggle, setCollapsed } = useSidebarState();

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
