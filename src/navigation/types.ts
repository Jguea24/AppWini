import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type MainTabParamList = {
  Home: undefined;
  Catalog: undefined;
  Cart: undefined;
  Tracking: { orderId: string };
};

export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Catalog: undefined;
  Cart: undefined;
  Tracking: { orderId: string };
  Auth: undefined;
  ProductDetail: { productId: number };
  QrScanner: undefined;
  Traceability: { productId: number };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type MainTabScreenProps<Screen extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  Screen
>;
