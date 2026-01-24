import { apiClient } from './apiClient';

export const authService = {
  async login(email: string, password: string) {
    return apiClient.post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      '/auth/login',
      { email, password }
    );
  },
  async register(name: string, email: string, password: string, role: string) {
    return apiClient.post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      '/auth/register',
      { name, email, password, role }
    );
  },
};
