import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { BenefitsScreen } from "../screens/BenefitsScreen";
import { PermissionsScreen } from "../screens/PermissionsScreen";
import { AccessScreen } from "../screens/AccessScreen";

const Stack = createNativeStackNavigator();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Benefits" component={BenefitsScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="Access" component={AccessScreen} />
    </Stack.Navigator>
  );
}

