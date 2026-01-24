import { useEffect, useState } from 'react';
import { useSyncExternalStore } from 'react';
import { authService } from '../services/authService';
import { authStore } from '../services/authStore';

export function useAuthSession() {
  const snapshot = useSyncExternalStore(
    authStore.subscribe.bind(authStore),
    authStore.getSnapshot.bind(authStore)
  );
  return snapshot;
}

export function useAuthBootstrap() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authStore
      .hydrate()
      .finally(() => setLoading(false));
  }, []);

  return loading;
}

export function useAuthViewModel() {
  const snapshot = useAuthSession();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState('cliente');

  const toggleMode = () => {
    setMode(current => (current === 'login' ? 'register' : 'login'));
    setError(null);
  };

  const submit = async (payload: { name?: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        const session = await authService.login(payload.email, payload.password);
        authStore.setSession(session);
      } else {
        const session = await authService.register(
          payload.name || '',
          payload.email,
          payload.password,
          role
        );
        authStore.setSession(session);
      }
    } catch (err: any) {
      setError(err?.message || 'Error de autenticacion');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => authStore.clear();

  return {
    mode,
    loading,
    error,
    role,
    setRole,
    user: snapshot.user,
    token: snapshot.token,
    hydrated: snapshot.hydrated,
    toggleMode,
    submit,
    logout,
  };
}
