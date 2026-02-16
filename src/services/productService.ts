import api from "./api";
import { API_BASE_URL } from "./api";
import { Product } from "../model/Product";

type ProductApiResponse = Product[] | { results: Product[] };
type ProductDetailApiResponse = Product | { data: Product } | { result: Product };

const productsByCategoryCache = new Map<number, Product[]>();
const productsByCategoryPromise = new Map<number, Promise<Product[]>>();

const normalizeProductsResponse = (data: ProductApiResponse): Product[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.results)) {
    return data.results;
  }

  return [];
};

export const getProductsService = async (token?: string): Promise<Product[]> => {
  const response = await api.get<ProductApiResponse>("products/", token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined);

  return normalizeProductsResponse(response.data);
};

export const getProductsByCategory = async (
  categoryId: number,
  force = false
): Promise<Product[]> => {
  if (!force && productsByCategoryCache.has(categoryId)) {
    return productsByCategoryCache.get(categoryId) ?? [];
  }

  if (!force && productsByCategoryPromise.has(categoryId)) {
    return productsByCategoryPromise.get(categoryId) ?? [];
  }

  const endpoint =
    categoryId > 0 ? `products/?category_id=${categoryId}` : "products/";

  const request = api
    .get<ProductApiResponse>(endpoint)
    .then(({ data }) => {
      const normalized = normalizeProductsResponse(data);
      productsByCategoryCache.set(categoryId, normalized);
      return normalized;
    })
    .finally(() => {
      productsByCategoryPromise.delete(categoryId);
    });

  productsByCategoryPromise.set(categoryId, request);
  return request;
};

export const clearProductsByCategoryCache = () => {
  productsByCategoryCache.clear();
  productsByCategoryPromise.clear();
};

export const getProductDetailService = async (
  productId: number | string
): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/`);
  const data = (await response.json().catch(() => ({}))) as ProductDetailApiResponse;

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  if ("id" in data) {
    return data as Product;
  }

  if ("data" in data && data.data) {
    return data.data as Product;
  }

  if ("result" in data && data.result) {
    return data.result as Product;
  }

  throw new Error("Respuesta invalida del producto");
};
