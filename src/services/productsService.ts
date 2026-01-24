import { apiClient } from './apiClient';
import { Product } from '../models/Product';

type ProductFilters = {
  type?: string;
  cacaoMin?: number;
  cacaoMax?: number;
};

function toQuery(params: Record<string, string | number | undefined>) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return query ? `?${query}` : '';
}

export const productsService = {
  async list(filters: ProductFilters = {}) {
    const query = toQuery({
      type: filters.type,
      cacaoMin: filters.cacaoMin,
      cacaoMax: filters.cacaoMax,
    });
    return apiClient.get<Product[]>(`/products${query}`);
  },
  async getById(id: number) {
    return apiClient.get<Product>(`/products/${id}`);
  },
};
