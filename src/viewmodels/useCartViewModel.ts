import { useSyncExternalStore } from 'react';
import { cartStore } from '../services/cartService';

export function useCartViewModel() {
  const snapshot = useSyncExternalStore(
    cartStore.subscribe.bind(cartStore),
    cartStore.getSnapshot.bind(cartStore)
  );

  return {
    items: snapshot.items,
    total: snapshot.total,
    updateQuantity: cartStore.updateQuantity.bind(cartStore),
    remove: cartStore.remove.bind(cartStore),
    clear: cartStore.clear.bind(cartStore),
  };
}
