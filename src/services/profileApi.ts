import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "../shared/storage/authStorage";
import { API_BASE_URL } from "./api";

export type MeResponse = {
  id?: number;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string | null;
  [key: string]: unknown;
};

export type UpdateMePayload = {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: unknown;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  new_password2: string;
};

export type RoleRequestPayload = {
  requested_role: "provider" | "driver" | string;
  reason: string;
};

export type RoleRequestItem = {
  id?: number;
  requested_role?: string;
  reason?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
};

const readJsonSafely = async (response: Response): Promise<any> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const extractErrorMessage = (data: any, fallback: string): string => {
  if (!data) {
    return fallback;
  }

  if (typeof data === "string" && data.trim().length > 0) {
    return data;
  }

  if (typeof data.error === "string" && data.error.trim().length > 0) {
    return data.error;
  }

  if (typeof data.message === "string" && data.message.trim().length > 0) {
    return data.message;
  }

  if (typeof data.detail === "string" && data.detail.trim().length > 0) {
    return data.detail;
  }

  const firstValue = Object.values(data)[0];
  if (typeof firstValue === "string" && firstValue.trim().length > 0) {
    return firstValue;
  }

  if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
    return firstValue[0];
  }

  return fallback;
};

const getAccessToken = async (): Promise<string> => {
  const storedToken = await getToken();
  if (storedToken) {
    return storedToken;
  }

  const authRaw = await AsyncStorage.getItem("auth");
  if (authRaw) {
    try {
      const parsed = JSON.parse(authRaw) as { access?: string };
      if (typeof parsed.access === "string" && parsed.access.trim().length > 0) {
        return parsed.access;
      }
    } catch {
      // Ignoramos formato invalido para mantener compatibilidad.
    }
  }

  throw new Error("Sesion no valida");
};

const apiFetch = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const access = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
      ...(options.headers || {}),
    },
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "Error de solicitud"));
  }

  return (data ?? {}) as T;
};

export const getMe = () => apiFetch<MeResponse>("/me/");

export const updateMe = (payload: UpdateMePayload) =>
  apiFetch<MeResponse>("/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const changePassword = (payload: ChangePasswordPayload) =>
  apiFetch<Record<string, unknown>>("/me/change-password/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getRoleRequests = async (): Promise<RoleRequestItem[]> => {
  const data = await apiFetch<any>("/role-requests/");
  if (Array.isArray(data)) {
    return data as RoleRequestItem[];
  }

  if (Array.isArray(data?.results)) {
    return data.results as RoleRequestItem[];
  }

  if (Array.isArray(data?.data)) {
    return data.data as RoleRequestItem[];
  }

  return [];
};

export const createRoleRequest = (payload: RoleRequestPayload) =>
  apiFetch<Record<string, unknown>>("/role-requests/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
