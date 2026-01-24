import { useEffect, useState } from 'react';
import { traceabilityService } from '../services/traceabilityService';

export function useTraceabilityViewModel(productId: number) {
  const [data, setData] = useState<null | {
    origin: string;
    cooperatives: string[];
    process: string[];
    coordinates: { lat: number; lng: number };
  }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    traceabilityService
      .getTraceability(productId)
      .then(result => {
        if (active) setData(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  return { data, loading };
}
