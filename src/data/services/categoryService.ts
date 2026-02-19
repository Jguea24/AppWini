import api from "./api";
import { Category } from "../../domain/entities/category";

type CategoriesApiResponse = Category[] | { results: Category[] };

let categoriesCache: Category[] | null = null;
let categoriesPromise: Promise<Category[]> | null = null;

const normalizeCategoriesResponse = (data: CategoriesApiResponse): Category[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.results)) {
    return data.results;
  }

  return [];
};

export const getCategories = async (force = false): Promise<Category[]> => {
  if (!force && categoriesCache) {
    return categoriesCache;
  }

  if (!force && categoriesPromise) {
    return categoriesPromise;
  }

  categoriesPromise = api
    .get<CategoriesApiResponse>("categories/")
    .then(({ data }) => {
      const normalized = normalizeCategoriesResponse(data);
      categoriesCache = normalized;
      return normalized;
    })
    .finally(() => {
      categoriesPromise = null;
    });

  return categoriesPromise;
};

export const clearCategoriesCache = () => {
  categoriesCache = null;
  categoriesPromise = null;
};


