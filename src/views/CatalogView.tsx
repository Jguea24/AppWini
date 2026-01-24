import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ActionButton } from '../components/ActionButton';
import { ProductCard } from '../components/ProductCard';
import { cartStore } from '../services/cartService';
import { useCatalogViewModel } from '../viewmodels/useCatalogViewModel';
import { RootStackParamList } from '../navigation/types';
import { useAuthSession } from '../viewmodels/useAuthSession';

const TYPES = ['oscuro', 'leche', 'blanco'];
const RANGES: Array<{ label: string; value: [number, number] }> = [
  { label: '30-50%', value: [30, 50] },
  { label: '51-70%', value: [51, 70] },
  { label: '71-90%', value: [71, 90] },
];

export function CatalogView() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuthSession();
  const { products, loading, typeFilter, rangeFilter, setTypeFilter, setRangeFilter } =
    useCatalogViewModel();

  const goAuth = () => navigation.navigate('Auth');

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Text style={styles.filterTitle}>Tipo</Text>
        <View style={styles.row}>
          {TYPES.map(type => (
            <ActionButton
              key={type}
              label={type}
              variant={typeFilter === type ? 'primary' : 'ghost'}
              onPress={() => setTypeFilter(typeFilter === type ? '' : type)}
            />
          ))}
        </View>
        <Text style={styles.filterTitle}>Porcentaje cacao</Text>
        <View style={styles.row}>
          {RANGES.map(range => (
            <ActionButton
              key={range.label}
              label={range.label}
              variant={rangeFilter?.[0] === range.value[0] ? 'primary' : 'ghost'}
              onPress={() =>
                setRangeFilter(rangeFilter?.[0] === range.value[0] ? null : range.value)
              }
            />
          ))}
        </View>
      </View>

      {loading ? (
        <Text style={styles.loading}>Cargando catalogo...</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              onAdd={() => (user ? cartStore.add(item) : goAuth())}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filters: {
    padding: 16,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  filterTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: '#64748b',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  loading: {
    padding: 24,
    color: '#64748b',
  },
  list: {
    padding: 16,
    gap: 16,
  },
});
