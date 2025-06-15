
import { useState, useCallback, useEffect } from "react";

// Type for the sidebar state
export interface SidebarState {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggle: () => void;
}

// Key for localStorage (can be made configurable)
const SIDEBAR_COLLAPSED_KEY = "sidebar:collapsed";

export function useSidebarState(): SidebarState {
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored !== null ? stored === "true" : false;
  });

  // Sync with localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
  }, []);

  const toggle = useCallback(() => {
    setCollapsedState((c) => !c);
  }, []);

  return { collapsed, setCollapsed, toggle };
}
