import { api } from "./api";

export type RegisterRole = "client" | "driver" | "provider";

export type RegisterPayload = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  password2: string;
  role?: RegisterRole;
  role_reason?: string;
};

export const registerService = async (payload: RegisterPayload) => {
  const response = await api.post("register/", payload);
  return response.data;
};

export const loginService = async (
  identifier: string,
  password: string
) => {
  const response = await api.post("login/", {
    identifier,
    password,
  });
  return response.data;
};

export const refreshTokenService = async (refresh: string) => {
  const response = await api.post("token/refresh/", { refresh });
  return response.data;
};

