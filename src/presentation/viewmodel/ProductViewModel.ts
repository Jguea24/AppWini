import { useEffect, useState } from "react";
import { getProductsService } from "../../data/services/productService";
import { getToken } from "../../shared/storage/authStorage";
import { Product } from "../../domain/entities/Product";

export function useProductViewModel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const data = await getProductsService(token);
        setProducts(data);
      } catch {
        setError("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return { products, loading, error };
}


