import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'wini.session';

export type SessionPayload = {
  token: string;
  user: { id: string; name: string; email: string; role: string };
};

export async function saveSession(session: SessionPayload) {
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<SessionPayload | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(KEY);
}
