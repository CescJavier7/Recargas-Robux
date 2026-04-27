"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

// 1. Creamos el contexto
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // Al cargar la app, leemos si el usuario ya tenía un tema guardado
    const savedTheme = (localStorage.getItem("nexus_theme") as Theme) || "dark";
    setTheme(savedTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("nexus_theme", newTheme); // Guardamos la preferencia
    
    // Inyectamos o quitamos la clase 'dark' del HTML maestro
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Exportamos nuestro propio Hook
export const useTheme = () => useContext(ThemeContext);