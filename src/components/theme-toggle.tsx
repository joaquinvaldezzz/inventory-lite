import { useEffect, useMemo, useState, type ReactNode } from "react";

import { ThemeContext, type Theme } from "@/lib/theme-context";
import { onChange } from "@/lib/theme-utils";
import { useTheme } from "@/hooks/use-theme";

const isValidTheme = (theme: string | null): theme is Theme => {
  return theme === "light" || theme === "dark" || theme === "system" || theme === null;
};

/**
 * Provider component that manages theme state and provides it to child components
 *
 * @param config The configuration object
 * @param config.children The child components to be rendered
 * @returns The rendered ThemeProvider component
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme != null && isValidTheme(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>;
}

/**
 * Component to toggle the theme
 *
 * @returns The rendered ThemeToggle component
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => {
        onChange(theme === "dark" ? "light" : "dark", setTheme);
      }}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
