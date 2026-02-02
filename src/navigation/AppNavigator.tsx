import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { HomeScreen } from "../presentation/screens/HomeScreen";

/* 👇 Tipado del stack */

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppNavigatorProps = {
  initialRouteName?: keyof RootStackParamList;
};

export function AppNavigator({
  initialRouteName = "Onboarding",
}: AppNavigatorProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingNavigator}
      />
      <Stack.Screen
        name="Auth"
        component={AuthNavigator}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />
    </Stack.Navigator>
  );
}
