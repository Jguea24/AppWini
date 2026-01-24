import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { RootStackScreenProps } from '../navigation/types';
import { useProductDetailViewModel } from '../viewmodels/useProductDetailViewModel';

export function ProductDetailView({ route, navigation }: RootStackScreenProps<'ProductDetail'>) {
  const { productId } = route.params;
  const { product, loading, addToCart } = useProductDetailViewModel(productId);

  if (loading) {
    return <Text style={styles.loading}>Cargando producto...</Text>;
  }

  if (!product) {
    return <Text style={styles.loading}>Producto no encontrado.</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.subtitle}>{product.cacao_percent}% cacao � {product.type}</Text>

      <Text style={styles.sectionTitle}>Descripcion</Text>
      <Text style={styles.text}>{product.description}</Text>

      <Text style={styles.sectionTitle}>Ingredientes</Text>
      <Text style={styles.text}>{product.ingredients}</Text>

      <Text style={styles.price}>$ {product.price.toFixed(2)}</Text>
      <ActionButton label="Agregar al carrito" onPress={addToCart ?? (() => {})} />

      <ActionButton
        label="Ver trazabilidad"
        variant="ghost"
        onPress={() => navigation.navigate('Traceability', { productId })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
    color: '#64748b',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#64748b',
  },
  sectionTitle: {
    marginTop: 8,
    fontWeight: '700',
    color: '#0f172a',
  },
  text: {
    color: '#475569',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
  },
});
