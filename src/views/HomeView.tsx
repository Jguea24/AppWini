import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { SectionHeader } from '../components/SectionHeader';
import { ProductCard } from '../components/ProductCard';
import { ActionButton } from '../components/ActionButton';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { cartStore } from '../services/cartService';
import { RootStackParamList } from '../navigation/types';
import { useAuthSession } from '../viewmodels/useAuthSession';

export function HomeView() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuthSession();
  const { headline, tagline, featured, loading } = useHomeViewModel();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>{headline}</Text>
        <Text style={styles.bannerSubtitle}>{tagline}</Text>
        <View style={styles.bannerActions}>
          <ActionButton label="Explorar" onPress={() => navigation.navigate('Catalog')} />
          <ActionButton label="QR" variant="ghost" onPress={() => navigation.navigate('QrScanner')} />
        </View>
        {user ? (
          <View style={styles.sessionRow}>
            <Text style={styles.sessionText}>Sesion: {user.name} ({user.role})</Text>
            <ActionButton label="Cerrar sesion" variant="ghost" onPress={() => navigation.navigate('Auth')} />
          </View>
        ) : (
          <ActionButton
            label="Iniciar sesion"
            variant="ghost"
            onPress={() => navigation.navigate('Auth')}
          />
        )}
      </View>

      <SectionHeader title="Productos destacados" subtitle="Seleccionados por nuestros maestros chocolateros" />
      {loading ? (
        <Text style={styles.loading}>Cargando destacados...</Text>
      ) : (
        <View style={styles.grid}>
          {featured.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
              onAdd={() => (user ? cartStore.add(product) : navigation.navigate('Auth'))}
            />
          ))}
        </View>
      )}

      <SectionHeader title="Experiencia Wini" subtitle="Historia, trazabilidad y origen" />
      <View style={styles.experienceCard}>
        <Text style={styles.experienceTitle}>Del cacao al chocolate</Text>
        <Text style={styles.experienceText}>
          Conoce cada etapa del proceso y sigue la ruta de nuestros granos premium.
        </Text>
        <View style={styles.experienceActions}>
          <ActionButton
            label="Trazabilidad"
            variant="ghost"
            onPress={() => navigation.navigate('Traceability', { productId: 1 })}
          />
          <ActionButton label="Seguimiento" onPress={() => navigation.navigate('Tracking', { orderId: 'ORD-2034' })} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    gap: 24,
  },
  banner: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  bannerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#cbd5f5',
  },
  bannerActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  sessionText: {
    color: '#cbd5f5',
    fontWeight: '600',
  },
  loading: {
    color: '#64748b',
  },
  grid: {
    gap: 16,
  },
  experienceCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 18,
    padding: 20,
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
  },
  experienceText: {
    marginTop: 8,
    color: '#7c2d12',
  },
  experienceActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
});
