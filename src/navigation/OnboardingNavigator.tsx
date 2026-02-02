import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WelcomeScreen } from "../presentation/screens/WelcomeScreen";
import { BenefitsScreen } from "../presentation/screens/BenefitsScreen";
import { PermissionsScreen } from "../presentation/screens/PermissionsScreen";
import { AccessScreen } from "../presentation/screens/AccessScreen";

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
