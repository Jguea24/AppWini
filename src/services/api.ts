import axios from "axios";
import { Platform } from "react-native";
import { getToken } from "../shared/storage/authStorage";

// Ajusta la IP/host según tu entorno:
// - Emulador Android: http://10.0.2.2:8000/
// - iOS simulador / escritorio con backend local: http://localhost:8000/
// - Dispositivo físico: http://<TU-IP-LAN>:8000/
const DEFAULT_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000/"
    : "http://localhost:8000/";

export const api = axios.create({
  baseURL: DEFAULT_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Inserta el JWT en cada petición si existe.
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
