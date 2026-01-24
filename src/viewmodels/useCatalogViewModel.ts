import { useCallback, useEffect, useState } from 'react';
import { Product } from '../models/Product';
import { productsService } from '../services/productsService';

export function useCatalogViewModel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [rangeFilter, setRangeFilter] = useState<[number, number] | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    productsService
      .list({
        type: typeFilter || undefined,
        cacaoMin: rangeFilter ? rangeFilter[0] : undefined,
        cacaoMax: rangeFilter ? rangeFilter[1] : undefined,
      })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [rangeFilter, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    products,
    loading,
    typeFilter,
    rangeFilter,
    setTypeFilter,
    setRangeFilter,
    refresh: load,
  };
}
