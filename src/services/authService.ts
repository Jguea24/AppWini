import { api } from "./api";

export const registerService = async (
  username: string,
  email: string,
  password: string
) => {
  const response = await api.post("register/", {
    username,
    email,
    password,
  });
  return response.data;
};

export const loginService = async (
  username: string,
  password: string
) => {
  const response = await api.post("login/", {
    username,
    password,
  });
  return response.data;
};

export const refreshTokenService = async (refresh: string) => {
  const response = await api.post("token/refresh/", { refresh });
  return response.data;
};
