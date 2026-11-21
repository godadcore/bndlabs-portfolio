import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });
const CHOICE_KEY = "bndlabs-theme-choice";

function systemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [choice, setChoice] = useState("");
  const [system, setSystem] = useState(systemTheme);
  const theme = choice || system;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystem = () => setSystem(media.matches ? "dark" : "light");
    const followSystem = () => {
      applySystem();
      setChoice("");
      try {
        localStorage.removeItem(CHOICE_KEY);
      } catch {
        /* storage can be blocked */
      }
    };
    applySystem();
    try {
      localStorage.removeItem(CHOICE_KEY);
      localStorage.removeItem("bndlabs-theme");
    } catch {
      /* storage can be blocked */
    }
    if (media.addEventListener) media.addEventListener("change", followSystem);
    else media.addListener(followSystem);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", followSystem);
      else media.removeListener(followSystem);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = (next) => {
    const value = next === "dark" ? "dark" : "light";
    setChoice(value);
    try {
      localStorage.removeItem(CHOICE_KEY);
      localStorage.removeItem("bndlabs-theme");
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
