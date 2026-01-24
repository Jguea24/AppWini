import { useEffect, useState } from 'react';
import { Product } from '../models/Product';
import { cartStore } from '../services/cartService';
import { productsService } from '../services/productsService';

export function useProductDetailViewModel(productId: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    productsService
      .getById(productId)
      .then(data => {
        if (active) setProduct(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  return {
    product,
    loading,
    addToCart: product ? () => cartStore.add(product) : undefined,
  };
}
