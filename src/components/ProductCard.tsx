import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Product } from '../models/Product';

type Props = {
  product: Product;
  onPress?: () => void;
  onAdd?: () => void;
};

export function ProductCard({ product, onPress, onAdd }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{product.cacao_percent}% cacao</Text>
      </View>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.subtitle}>{product.type.toUpperCase()}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {product.description}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.price}>$ {product.price.toFixed(2)}</Text>
        <Pressable onPress={onAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>Agregar</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    letterSpacing: 1.6,
    color: '#64748b',
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    color: '#475569',
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  addButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 12,
  },
});
