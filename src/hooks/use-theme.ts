import { useContext } from "react";

import { ThemeContext } from "@/lib/theme-context";

/**
 * Hook to access the theme state
 *
 * @returns The theme state and setter
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context == null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
