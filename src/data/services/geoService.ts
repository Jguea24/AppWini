import { AxiosError } from "axios";
import api from "./api";

export type GeoAutocompletePayload = {
  q: string;
  country?: string;
  limit?: number;
};

export type GeoGeocodePayload = {
  place_id?: string;
  q?: string;
  lat?: number;
  lng?: number;
};

export type ValidateAddressPayload = {
  address: string;
  city?: string;
  region?: string;
  country?: string;
};

export type RouteCoordinate = {
  lat: number;
  lng: number;
};

export type EstimateRoutePayload = {
  origin: RouteCoordinate;
  destination: RouteCoordinate;
  travel_mode?: "DRIVE" | "BICYCLE" | "WALK" | "TWO_WHEELER";
  routing_preference?:
    | "TRAFFIC_AWARE"
    | "TRAFFIC_AWARE_OPTIMAL"
    | "TRAFFIC_UNAWARE";
  alternatives?: boolean;
};

export type GeoResponse = Record<string, unknown>;
export type GeoAutocompleteResponse = {
  results?: Record<string, unknown>[];
  provider?: string;
  [key: string]: unknown;
};
export type GeoGeocodeResponse = {
  results?: Record<string, unknown>[];
  [key: string]: unknown;
};

const extractErrorMessage = (data: unknown, fallback: string): string => {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const record = data as Record<string, unknown>;
  const keys = ["error", "message", "detail"];
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  const firstValue = Object.values(record)[0];
  if (typeof firstValue === "string" && firstValue.trim().length > 0) {
    return firstValue;
  }

  if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
    return firstValue[0];
  }

  return fallback;
};

const handleAxiosError = (error: unknown, fallback: string): never => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    throw new Error(extractErrorMessage(data, fallback));
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    throw new Error(error.message);
  }

  throw new Error(fallback);
};

export const validateAddressService = async (
  payload: ValidateAddressPayload
): Promise<GeoResponse> => {
  try {
    const { data } = await api.post<GeoResponse>("/geo/validate-address/", payload);
    return data ?? {};
  } catch (error) {
    return handleAxiosError(error, "No se pudo validar direccion");
  }
};

export const geoAutocompleteService = async (
  q: string,
  country = "ec",
  limit = 5
): Promise<GeoAutocompleteResponse> => {
  try {
    const { data } = await api.get<GeoAutocompleteResponse>("/geo/autocomplete/", {
      params: { q, country, limit },
    });
    return data ?? {};
  } catch (error) {
    return handleAxiosError(error, "No se pudo buscar direccion");
  }
};

export const geoGeocodeService = async (
  params: GeoGeocodePayload
): Promise<GeoGeocodeResponse> => {
  try {
    const { data } = await api.get<GeoGeocodeResponse>("/geo/geocode/", {
      params,
    });
    return data ?? {};
  } catch (error) {
    return handleAxiosError(error, "No se pudo geocodificar direccion");
  }
};

export const estimateRouteService = async (
  payload: EstimateRoutePayload
): Promise<GeoResponse> => {
  try {
    const { data } = await api.post<GeoResponse>("/geo/routes/estimate/", payload);
    return data ?? {};
  } catch (error) {
    return handleAxiosError(error, "No se pudo calcular ruta");
  }
};

