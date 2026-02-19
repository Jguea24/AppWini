import { AxiosError } from "axios";
import api from "./api";

export type TrackingStatus =
  | "assigned"
  | "picked_up"
  | "on_the_way"
  | "nearby"
  | "delivered"
  | "cancelled";

export type DriverLocationPayload = {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  status?: TrackingStatus;
  eta_minutes?: number;
};

export type TrackingPoint = {
  latitude: number | string;
  longitude: number | string;
  recorded_at?: string;
};

export type TrackingShipment = {
  current_latitude?: number | string | null;
  current_longitude?: number | string | null;
  eta_minutes?: number | string | null;
  status?: string;
  driver?: Record<string, unknown> | null;
  locations?: TrackingPoint[];
  [key: string]: unknown;
};

export type OrderTrackingResponse = {
  shipment?: TrackingShipment;
  [key: string]: unknown;
};

type AssignDriverBodyOptions = {
  driverId?: number | null;
  autoAssign?: boolean;
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

const buildAssignDriverBody = ({
  driverId,
  autoAssign = false,
}: AssignDriverBodyOptions): Record<string, unknown> => {
  if (autoAssign) {
    if (typeof driverId === "number") {
      throw new Error("No envies driver_id y auto_assign=true al mismo tiempo.");
    }
    return { auto_assign: true };
  }

  if (driverId === null) {
    return { driver_id: null };
  }

  if (typeof driverId === "number") {
    return { driver_id: driverId };
  }

  return {};
};

export const getOrderTrackingService = async (
  orderId: number,
  points = 80,
  token?: string
): Promise<OrderTrackingResponse> => {
  try {
    const { data } = await api.get<OrderTrackingResponse>(
      `/orders/${orderId}/tracking/`,
      {
        params: { points },
        ...(token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined),
      }
    );

    return data ?? {};
  } catch (error) {
    handleAxiosError(error, "No se pudo cargar tracking");
  }
};

export const postDriverLocationService = async (
  orderId: number,
  payload: DriverLocationPayload,
  token?: string
): Promise<Record<string, unknown>> => {
  try {
    const { data } = await api.post<Record<string, unknown>>(
      `/orders/${orderId}/tracking/location/`,
      payload,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );

    return data ?? {};
  } catch (error) {
    handleAxiosError(error, "No se pudo enviar ubicacion");
  }
};

export const assignDriverService = async (
  orderId: number,
  driverId: number,
  token?: string
): Promise<Record<string, unknown>> => {
  try {
    const { data } = await api.post<Record<string, unknown>>(
      `/orders/${orderId}/tracking/assign-driver/`,
      buildAssignDriverBody({ driverId }),
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );

    return data ?? {};
  } catch (error) {
    handleAxiosError(error, "No se pudo asignar repartidor");
  }
};

export const unassignDriverService = async (
  orderId: number,
  token?: string
): Promise<Record<string, unknown>> => {
  try {
    const { data } = await api.post<Record<string, unknown>>(
      `/orders/${orderId}/tracking/assign-driver/`,
      buildAssignDriverBody({ driverId: null }),
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );

    return data ?? {};
  } catch (error) {
    handleAxiosError(error, "No se pudo desasignar repartidor");
  }
};

export const autoAssignDriverService = async (
  orderId: number,
  useAutoAssignPayload = false,
  token?: string
): Promise<Record<string, unknown>> => {
  try {
    const payload = useAutoAssignPayload
      ? buildAssignDriverBody({ autoAssign: true })
      : buildAssignDriverBody({});
    const { data } = await api.post<Record<string, unknown>>(
      `/orders/${orderId}/tracking/assign-driver/`,
      payload,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );

    return data ?? {};
  } catch (error) {
    handleAxiosError(error, "No se pudo asignar repartidor automaticamente");
  }
};
