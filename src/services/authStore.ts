import { SessionPayload, saveSession, loadSession, clearSession } from './sessionService';

type Listener = () => void;

type AuthSnapshot = {
  user: SessionPayload['user'] | null;
  token: string | null;
  hydrated: boolean;
};

class AuthStore {
  private user: SessionPayload['user'] | null = null;
  private token: string | null = null;
  private hydrated = false;
  private snapshot: AuthSnapshot = { user: null, token: null, hydrated: false };
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach(l => l());
  }

  getSnapshot(): AuthSnapshot {
    return this.snapshot;
  }

  private updateSnapshot() {
    this.snapshot = { user: this.user, token: this.token, hydrated: this.hydrated };
  }

  setSession(session: SessionPayload) {
    this.user = session.user;
    this.token = session.token;
    this.updateSnapshot();
    this.emit();
    saveSession(session).catch(() => undefined);
  }

  async hydrate() {
    if (this.hydrated) return;
    const session = await loadSession();
    if (session) {
      this.user = session.user;
      this.token = session.token;
    }
    this.hydrated = true;
    this.updateSnapshot();
    this.emit();
  }

  clear() {
    this.user = null;
    this.token = null;
    this.updateSnapshot();
    clearSession().catch(() => undefined);
    this.emit();
  }
}

export const authStore = new AuthStore();
