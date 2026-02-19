import axios from "axios";
import { Platform } from "react-native";
import { getToken } from "../../shared/storage/authStorage";

// Ajusta la IP/host segun tu entorno:
// - Emulador Android: http://10.0.2.2:8000
// - Dispositivo fisico: http://192.168.1.3:8000
// - iOS simulador / escritorio local: http://localhost:8000
const API_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api, API_BASE_URL };
export default api;


