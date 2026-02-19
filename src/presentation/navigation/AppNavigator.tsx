import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { HomeScreen } from "../screens/HomeScreen";
import { CartScreen } from "../screens/CartScreen";
import { NewAddressScreen } from "../screens/NewAddressScreen";
import { PaymentMethodScreen } from "../screens/PaymentMethodScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { ShipmentsScreen } from "../screens/ShipmentsScreen";
import { TrackingScreen } from "../screens/TrackingScreen";

/* ðŸ‘‡ Tipado del stack */

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Home: undefined;
  Cart: undefined;
  NewAddress: undefined;
  PaymentMethod: undefined;
  Profile: undefined;
  ProductDetail: { productId: number };
  Orders: undefined;
  Shipments: undefined;
  Tracking: { orderId: number };
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
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="NewAddress"
        component={NewAddressScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Shipments"
        component={ShipmentsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

