import { useState } from "react";
import {
  loginService,
  registerService,
  type RegisterRole,
} from "../services/authService";
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

  const normalizeRole = (role?: string): RegisterRole | undefined => {
    if (!role) {
      return undefined;
    }

    const normalized = role.trim().toLowerCase();
    if (normalized === "admin") {
      return undefined;
    }
    if (normalized === "driver" || normalized === "repartidor") {
      return "driver";
    }
    if (normalized === "provider" || normalized === "proveedor") {
      return "provider";
    }
    if (normalized === "client" || normalized === "cliente") {
      return "client";
    }
    return undefined;
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    phone: string,
    role?: string,
    roleReason?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (role?.trim().toLowerCase() === "admin") {
        setError("El rol admin no esta permitido");
        return false;
      }

      const normalizedRole = normalizeRole(role);
      const payload: {
        full_name: string;
        email: string;
        phone: string;
        password: string;
        password2: string;
        role?: RegisterRole;
        role_reason?: string;
      } = {
        full_name: fullName,
        email,
        phone,
        password,
        password2: password,
      };

      if (normalizedRole) {
        payload.role = normalizedRole;
      }

      if (
        normalizedRole &&
        normalizedRole !== "client" &&
        roleReason &&
        roleReason.trim().length > 0
      ) {
        payload.role_reason = roleReason.trim();
      }

      await registerService(payload);

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

  const login = async (identifier: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await loginService(identifier, password);

      if (data.access) {
        await saveAuthTokens(data.access, data.refresh);
        await saveUsername(identifier);
        return true;
      }

      setError("Respuesta invalida del servidor");
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
