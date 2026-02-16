import { api } from "./api";

export const registerService = async (payload: {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}) => {
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
