import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ActionButton } from '../components/ActionButton';
import { useCartViewModel } from '../viewmodels/useCartViewModel';
import { useAuthSession } from '../viewmodels/useAuthSession';
import { RootStackParamList } from '../navigation/types';

export function CartView() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuthSession();
  const { items, total, updateQuantity, remove, clear } = useCartViewModel();

  if (!user) {
    return (
      <View style={styles.container}> 
        <Text style={styles.title}>Tu carrito</Text>
        <Text style={styles.empty}>Inicia sesion para ver tu carrito.</Text>
        <ActionButton label="Ir a iniciar sesion" onPress={() => navigation.navigate('Auth')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu carrito</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>Aun no hay productos.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.product.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.product.name}</Text>
                <Text style={styles.itemSubtitle}>{item.product.cacao_percent}% cacao</Text>
              </View>
              <View style={styles.itemActions}>
                <ActionButton
                  label="-"
                  variant="ghost"
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                />
                <Text style={styles.qty}>{item.quantity}</Text>
                <ActionButton
                  label="+"
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                />
                <ActionButton label="Eliminar" variant="ghost" onPress={() => remove(item.product.id)} />
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.summary}>
        <Text style={styles.total}>Total: $ {total.toFixed(2)}</Text>
        <ActionButton label="Pagar" onPress={clear} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  empty: {
    color: '#64748b',
  },
  list: {
    gap: 12,
  },
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  itemInfo: {
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemSubtitle: {
    color: '#64748b',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  qty: {
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
    gap: 12,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
});
