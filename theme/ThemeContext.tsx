// theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "./colors";

type ThemeType = "light" | "dark";

interface ThemeContextProps {
  theme: ThemeType;
  colors: typeof lightColors;
  toggleTheme: (val: "light" | "dark" | "system") => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme(); // 'light' | 'dark' | null
  const [theme, setTheme] = useState<ThemeType>(
    systemTheme === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    // if theme is set to 'system', follow system theme
    if (systemTheme) {
      setTheme(systemTheme === "dark" ? "dark" : "light");
    }
  }, [systemTheme]);

  const toggleTheme = (val: "light" | "dark" | "system") => {
    if (val === "system") {
      // follow system theme
      setTheme(systemTheme === "dark" ? "dark" : "light");
    } else {
      setTheme(val);
    }
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
