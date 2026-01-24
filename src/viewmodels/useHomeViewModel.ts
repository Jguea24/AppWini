import { useEffect, useState } from 'react';
import { Product } from '../models/Product';
import { productsService } from '../services/productsService';

export function useHomeViewModel() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    productsService
      .list()
      .then(products => {
        if (active) setFeatured(products.slice(0, 3));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return {
    headline: 'Wini Chocolate',
    tagline: 'Arte en cada tableta',
    featured,
    loading,
  };
}
