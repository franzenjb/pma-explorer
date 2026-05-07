"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";
type ThemeContextValue = {
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  const [resolvedTheme, setResolvedTheme] = useState<Theme>("light");

  useEffect(() => {
    // Default to light. System preference is intentionally ignored — the
    // PMA palette is designed for the cream/ink light theme. Users can
    // still opt in to dark via the toggle, which is persisted.
    const stored = localStorage.getItem("pma-theme");
    const nextTheme: Theme = stored === "dark" ? "dark" : "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted browser theme after mount
    setResolvedTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    localStorage.setItem("pma-theme", theme);
    setResolvedTheme(theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const value = useMemo(
    () => ({ resolvedTheme, setTheme }),
    [resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
