import { API_BASE_URL } from "./api";

export type OrderCreatePayload = Record<string, unknown>;
export type OrderRecord = Record<string, unknown>;

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

export const createOrderService = async (
  payload: OrderCreatePayload,
  token: string
): Promise<Record<string, unknown>> => {
  const response = await fetch(`${API_BASE_URL}/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "No se pudo crear la orden"));
  }

  return (data ?? {}) as Record<string, unknown>;
};

const normalizeOrdersResponse = (data: unknown): OrderRecord[] => {
  if (Array.isArray(data)) {
    return data as OrderRecord[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;
  const candidateKeys = ["results", "orders", "data", "items"];
  for (const key of candidateKeys) {
    const nested = record[key];
    if (Array.isArray(nested)) {
      return nested as OrderRecord[];
    }
  }

  return [];
};

export const getOrdersService = async (token: string): Promise<OrderRecord[]> => {
  const response = await fetch(`${API_BASE_URL}/orders/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "No se pudo cargar pedidos"));
  }

  return normalizeOrdersResponse(data);
};

export const getOrderDetailService = async (
  orderId: number | string,
  token: string
): Promise<OrderRecord> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "No se pudo cargar el pedido"));
  }

  return (data ?? {}) as OrderRecord;
};
