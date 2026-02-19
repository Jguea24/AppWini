import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  ready: boolean;
  setDarkMode: (value: boolean) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const THEME_MODE_KEY = "app_theme_mode";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (!mounted) {
          return;
        }

        if (stored === "dark" || stored === "light") {
          setThemeMode(stored);
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const setDarkMode = useCallback(async (value: boolean) => {
    const nextMode: ThemeMode = value ? "dark" : "light";
    setThemeMode(nextMode);
    await AsyncStorage.setItem(THEME_MODE_KEY, nextMode);
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextMode);
    await AsyncStorage.setItem(THEME_MODE_KEY, nextMode);
  }, [themeMode]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      isDarkMode: themeMode === "dark",
      ready,
      setDarkMode,
      toggleTheme,
    }),
    [ready, setDarkMode, themeMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode debe usarse dentro de ThemeProvider");
  }

  return context;
}
