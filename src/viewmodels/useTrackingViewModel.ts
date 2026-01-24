import { useEffect, useState } from 'react';
import { trackingService } from '../services/trackingService';
import { OrderStatus } from '../models/OrderStatus';

export function useTrackingViewModel(orderId: string) {
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    trackingService
      .getTracking(orderId)
      .then(result => {
        if (active) setStatuses(result.statuses);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  return { statuses, loading };
}
