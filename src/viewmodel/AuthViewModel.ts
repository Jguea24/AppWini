import { useState } from "react";
import { loginService, registerService } from "../services/authService";
import {
  saveAuthTokens,
  saveDisplayName,
  saveUsername,
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

  // ✅ REGISTER ACTUALIZADO
  const register = async (
    fullName: string,
    email: string,
    password: string,
    phone: string,
    address: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      await registerService({
        full_name: fullName,
        email,
        password,
        phone,
        address,
      });

      await saveUsername(email);
      await saveDisplayName(fullName);

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

      if (data.access) {
        await saveAuthTokens(data.access, data.refresh);
        await saveUsername(username);
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
