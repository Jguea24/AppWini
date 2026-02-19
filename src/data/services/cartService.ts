import { API_BASE_URL } from "./api";

export type CartApiResponse = {
  message?: string;
  [key: string]: unknown;
};

export type CartCountResponse = {
  count: number;
  distinct_items: number;
};

const readJsonSafely = async (
  response: Response
): Promise<CartApiResponse | null> => {
  try {
    return (await response.json()) as CartApiResponse;
  } catch {
    return null;
  }
};

const extractApiErrorMessage = (
  data: CartApiResponse | null,
  fallback: string
): string => {
  if (!data) {
    return fallback;
  }

  if (typeof data.message === "string" && data.message.trim().length > 0) {
    return data.message;
  }

  const detail = data.detail;
  if (typeof detail === "string" && detail.trim().length > 0) {
    return detail;
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

export const addToCartService = async (
  productId: number,
  token: string,
  quantity = 1
) => {
  const response = await fetch(`${API_BASE_URL}/cart/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      product: productId,
      quantity,
    }),
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractApiErrorMessage(data, "Error al agregar al carrito"));
  }

  return data ?? {};
};

export const getCartService = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/cart/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractApiErrorMessage(data, "Error cargando carrito"));
  }

  return data ?? {};
};

export const getCartCountService = async (
  token: string
): Promise<CartCountResponse> => {
  const response = await fetch(`${API_BASE_URL}/cart/count/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(JSON.stringify(data ?? {}));
  }

  return {
    count: Number(data?.count ?? 0),
    distinct_items: Number(data?.distinct_items ?? 0),
  };
};

export const clearCartService = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/cart/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractApiErrorMessage(data, "Error al vaciar carrito"));
  }

  return data ?? {};
};

export const updateCartItemService = async (
  itemId: number | string,
  token: string,
  quantity: number,
  productId?: number | string
) => {
  void productId;
  const normalizedQuantity = Math.max(1, Math.trunc(Number(quantity) || 1));
  const response = await fetch(`${API_BASE_URL}/cart/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: itemId,
      quantity: normalizedQuantity,
    }),
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractApiErrorMessage(data, "Error al actualizar cantidad"));
  }

  return data ?? {};
};

export const removeCartItemService = async (
  itemId: number | string,
  token: string,
  productId?: number | string
) => {
  void productId;
  const encodedId = encodeURIComponent(String(itemId));
  const response = await fetch(`${API_BASE_URL}/cart/?id=${encodedId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(
      extractApiErrorMessage(data, "Error al eliminar producto del carrito")
    );
  }

  return data ?? {};
};

