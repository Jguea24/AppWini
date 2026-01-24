import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { RootStackScreenProps } from '../navigation/types';
import { useTraceabilityViewModel } from '../viewmodels/useTraceabilityViewModel';

export function TraceabilityView({ route }: RootStackScreenProps<'Traceability'>) {
  const { productId } = route.params;
  const { data, loading } = useTraceabilityViewModel(productId);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loading}>
        <Text>No hay informacion disponible.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trazabilidad</Text>
      <Text style={styles.subtitle}>Origen: {data.origin}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cooperativas</Text>
        {data.cooperatives.map(item => (
          <Text key={item} style={styles.text}>• {item}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Proceso</Text>
        {data.process.map(step => (
          <Text key={step} style={styles.text}>• {step}</Text>
        ))}
      </View>

      <View style={styles.mapBox}>
        <Text style={styles.mapText}>Mapa: {data.coordinates.lat}, {data.coordinates.lng}</Text>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  text: {
    color: '#475569',
  },
  mapBox: {
    height: 160,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  mapText: {
    color: '#64748b',
  },
});
