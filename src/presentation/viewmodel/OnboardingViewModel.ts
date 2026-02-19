import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "onboarding_done";

export function useOnboardingViewModel() {
  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  };

  const isOnboardingCompleted = async () => {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === "true";
  };

  return { completeOnboarding, isOnboardingCompleted };
}
