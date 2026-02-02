import { useState } from "react";
import { loginService, registerService } from "../services/authService";
import {
  saveAuthTokens,
  saveUsername, // 👈 NUEVO
} from "../shared/storage/authStorage";

export function useAuthViewModel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractError = (err: any, fallback: string) => {
    if (err?.message && err.message.includes("Network Error")) {
      return "No se pudo conectar al servidor. Revisa IP/puerto.";
    }
    const firstValue = Object.values(err?.response?.data || {})[0];
    const detail =
      err?.response?.data?.detail ||
      (firstValue &&
        (Array.isArray(firstValue)
          ? (firstValue as any[])[0]
          : firstValue));
    return detail || fallback;
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      await registerService(username, email, password);
      return true;
    } catch (err: any) {
      setError(String(extractError(err, "Error al registrar usuario")));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await loginService(username, password);

      // JWT típico en Django REST Framework
      if (data.access) {
        await saveAuthTokens(data.access, data.refresh);
        await saveUsername(username); // 👈 GUARDAMOS EL USUARIO
        return true;
      }

      setError("Respuesta inválida del servidor");
      return false;
    } catch (err: any) {
      setError(String(extractError(err, "Credenciales incorrectas")));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading, error };
}
