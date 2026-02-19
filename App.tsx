import React, { useEffect, useMemo, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { enableScreens } from "react-native-screens";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppNavigator } from "./src/presentation/navigation/AppNavigator";
import { getToken } from "./src/shared/storage/authStorage";
import { ThemeProvider, useThemeMode } from "./src/shared/theme/ThemeContext";

enableScreens(true);

const ONBOARDING_KEY = "onboarding_done";

function AppContent() {
  const { isDarkMode, ready: themeReady } = useThemeMode();
  const [checkingSession, setCheckingSession] = useState(true);
  const [initialRoute, setInitialRoute] =
    useState<"Onboarding" | "Auth" | "Home">("Onboarding");

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await getToken();
        const onboardingDone =
          (await AsyncStorage.getItem(ONBOARDING_KEY)) === "true";

        if (!onboardingDone) {
          setInitialRoute("Onboarding");
        } else if (token) {
          setInitialRoute("Home");
        } else {
          setInitialRoute("Auth");
        }
      } finally {
        setCheckingSession(false);
      }
    };

    loadSession();
  }, []);

  const navigationTheme = useMemo<Theme>(() => {
    if (!isDarkMode) {
      return {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: "#6F4E37",
          background: "#F3EEE8",
        },
      };
    }

    return {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: "#C19A6B",
        background: "#121214",
        card: "#1A1A1E",
        border: "#2E2E33",
        text: "#F1F1F3",
      },
    };
  }, [isDarkMode]);

  if (checkingSession || !themeReady) {
    return (
      <View
        style={[
          styles.loaderContainer,
          isDarkMode && styles.loaderContainerDark,
        ]}
      >
        <ActivityIndicator size="large" color={isDarkMode ? "#C19A6B" : "#6F4E37"} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <AppNavigator initialRouteName={initialRoute} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3EEE8",
  },
  loaderContainerDark: {
    backgroundColor: "#121214",
  },
});
