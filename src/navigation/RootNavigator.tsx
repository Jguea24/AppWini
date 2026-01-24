import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthView } from '../views/AuthView';
import { ProductDetailView } from '../views/ProductDetailView';
import { QrScannerView } from '../views/QrScannerView';
import { TraceabilityView } from '../views/TraceabilityView';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Auth" component={AuthView} options={{ title: 'Acceso' }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailView} options={{ title: 'Producto' }} />
        <Stack.Screen name="QrScanner" component={QrScannerView} options={{ title: 'Escaner QR' }} />
        <Stack.Screen name="Traceability" component={TraceabilityView} options={{ title: 'Trazabilidad' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
