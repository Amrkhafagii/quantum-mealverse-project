
"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  attribute?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  attribute = "data-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      return defaultTheme;
    }
  })

  useEffect(() => {
    try {
      const root = window.document.documentElement

      if (disableTransitionOnChange) {
        root.classList.add("no-transitions")
      }

      if (attribute === "class") {
        root.classList.remove("light", "dark")

        if (theme !== "system") {
          root.classList.add(theme)
        }
      } else {
        if (theme === "system") {
          root.removeAttribute(attribute)
        } else {
          root.setAttribute(attribute, theme)
        }
      }

      if (disableTransitionOnChange) {
        // Force a reflow
        root.offsetHeight
        root.classList.remove("no-transitions")
      }
    } catch (e) {
      console.error("Error applying theme:", e);
    }
  }, [theme, attribute, disableTransitionOnChange])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch (e) {
        console.error("Error setting theme in localStorage:", e);
      }
      setTheme(newTheme)
    },
  }

  useEffect(() => {
    if (!enableSystem) {
      return
    }

    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

      const handleChange = () => {
        if (theme === "system") {
          document.documentElement.classList.remove("light", "dark")
          document.documentElement.classList.add(
            mediaQuery.matches ? "dark" : "light"
          )
        }
      }

      handleChange()
      mediaQuery.addEventListener("change", handleChange)

      return () => {
        mediaQuery.removeEventListener("change", handleChange)
      }
    } catch (e) {
      console.error("Error setting up media query listener:", e);
    }
  }, [enableSystem, theme])

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
