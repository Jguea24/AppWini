import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute, NavigationProp, useNavigation } from '@react-navigation/native';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useTrackingViewModel } from '../viewmodels/useTrackingViewModel';
import { useAuthSession } from '../viewmodels/useAuthSession';
import { ActionButton } from '../components/ActionButton';

type TrackingRoute = RouteProp<MainTabParamList, 'Tracking'>;

export function TrackingView() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<TrackingRoute>();
  const { user } = useAuthSession();
  const orderId = route.params?.orderId || 'ORD-2034';
  const { statuses, loading } = useTrackingViewModel(orderId);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Seguimiento</Text>
        <Text style={styles.subtitle}>Necesitas iniciar sesion para ver el estado.</Text>
        <ActionButton label="Ir a iniciar sesion" onPress={() => navigation.navigate('Auth')} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguimiento</Text>
      <Text style={styles.subtitle}>Pedido {orderId}</Text>

      <View style={styles.timeline}>
        {statuses.map(status => (
          <View key={status.id} style={styles.step}>
            <View style={[styles.dot, status.active && styles.dotActive]} />
            <View>
              <Text style={styles.stepLabel}>{status.label}</Text>
              <Text style={styles.stepTime}>{status.timestamp}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#64748b',
  },
  timeline: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5f5',
    marginTop: 4,
  },
  dotActive: {
    borderColor: '#0f172a',
    backgroundColor: '#0f172a',
  },
  stepLabel: {
    fontWeight: '700',
    color: '#0f172a',
  },
  stepTime: {
    color: '#64748b',
  },
});
