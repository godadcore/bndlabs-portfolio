import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });
const CHOICE_KEY = "bndlabs-theme-choice";

function systemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedChoice() {
  try {
    const value = localStorage.getItem(CHOICE_KEY);
    return value === "dark" || value === "light" ? value : "";
  } catch {
    return "";
  }
}

export function ThemeProvider({ children }) {
  const [choice, setChoice] = useState(storedChoice);
  const [system, setSystem] = useState(systemTheme);
  const theme = choice || system;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setSystem(media.matches ? "dark" : "light");
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = (next) => {
    const value = next === "dark" ? "dark" : "light";
    setChoice(value);
    try {
      localStorage.setItem(CHOICE_KEY, value);
    } catch {
      /* storage can be blocked */
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
