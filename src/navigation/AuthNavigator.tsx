import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../presentation/screens/LoginScreen";
import { RegisterScreen } from "../presentation/screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
