import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CatalogView } from '../views/CatalogView';
import { CartView } from '../views/CartView';
import { HomeView } from '../views/HomeView';
import { TrackingView } from '../views/TrackingView';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<keyof MainTabParamList, string> = {
            Home: 'home-outline',
            Catalog: 'pricetags-outline',
            Cart: 'cart-outline',
            Tracking: 'trail-sign-outline',
          };
          const name = iconMap[route.name as keyof MainTabParamList] || 'ellipse-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0f172a',
        tabBarInactiveTintColor: '#94a3b8',
      })}
    >
      <Tab.Screen name="Home" component={HomeView} />
      <Tab.Screen name="Catalog" component={CatalogView} />
      <Tab.Screen name="Cart" component={CartView} />
      <Tab.Screen
        name="Tracking"
        component={TrackingView}
        initialParams={{ orderId: 'ORD-2034' }}
      />
    </Tab.Navigator>
  );
}
