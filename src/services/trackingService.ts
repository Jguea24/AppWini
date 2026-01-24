import { OrderStatus } from '../models/OrderStatus';

export const trackingService = {
  async getTracking(orderId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const statuses: OrderStatus[] = [
      { id: '1', label: 'Pedido confirmado', timestamp: 'Hoy 09:12', active: true },
      { id: '2', label: 'Preparando', timestamp: 'Hoy 10:05', active: true },
      { id: '3', label: 'En ruta', timestamp: 'Hoy 12:30', active: false },
      { id: '4', label: 'Entregado', timestamp: 'Pendiente', active: false },
    ];
    return { orderId, statuses };
  },
};
