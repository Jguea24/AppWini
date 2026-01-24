import { useSyncExternalStore } from 'react';
import { authStore } from '../services/authStore';

export function useAuthSession() {
  return useSyncExternalStore(authStore.subscribe.bind(authStore), authStore.getSnapshot.bind(authStore));
}
