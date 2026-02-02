import { api } from "./api";

export const getProductsService = async (token: string) => {
  const response = await api.get("products/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
