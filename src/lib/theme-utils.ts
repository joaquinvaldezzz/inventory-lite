import type { Theme } from "@/lib/theme-context";

interface CustomWindow extends Window {
  _updateTheme?: (theme: string) => void;
}

/**
 * Updates the theme in localStorage and applies it to the document
 *
 * @param theme The theme to apply
 * @param setTheme Function to update the theme state
 */
export function onChange(theme: Theme, setTheme: (theme: Theme) => void) {
  if (theme != null) {
    localStorage.setItem("theme", theme);
  } else {
    localStorage.removeItem("theme");
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme != null) {
    (window as CustomWindow)._updateTheme?.(savedTheme);
  }

  setTheme(theme);
}
