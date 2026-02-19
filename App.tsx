import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { enableScreens } from "react-native-screens";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppNavigator } from "./src/presentation/navigation/AppNavigator";
import { getToken } from "./src/shared/storage/authStorage";

// Mejora rendimiento de navegación nativa

enableScreens(true);

const ONBOARDING_KEY = "onboarding_done";

export default function App() {
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

  if (checkingSession) {
    return (
      <SafeAreaProvider>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator initialRouteName={initialRoute} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

