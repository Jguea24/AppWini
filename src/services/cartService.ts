import { api } from "./api";

export const addToCartService = async (
  productId: number,
  token: string
) => {
  const response = await api.post(
    "cart/",
    { product_id: productId, quantity: 1 },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};