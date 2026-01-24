import { CartItem } from '../models/CartItem';
import { Product } from '../models/Product';

type Listener = () => void;

type CartSnapshot = {
  items: CartItem[];
  total: number;
};

class CartStore {
  private items: CartItem[] = [];
  private snapshot: CartSnapshot = { items: [], total: 0 };
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach(listener => listener());
  }

  getSnapshot(): CartSnapshot {
    return this.snapshot;
  }

  private updateSnapshot() {
    const total = this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    this.snapshot = { items: [...this.items], total };
  }

  add(product: Product) {
    const existing = this.items.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ product, quantity: 1 });
    }
    this.updateSnapshot();
    this.emit();
  }

  updateQuantity(productId: number, quantity: number) {
    const target = this.items.find(item => item.product.id === productId);
    if (!target) return;
    target.quantity = Math.max(1, quantity);
    this.updateSnapshot();
    this.emit();
  }

  remove(productId: number) {
    this.items = this.items.filter(item => item.product.id !== productId);
    this.updateSnapshot();
    this.emit();
  }

  clear() {
    this.items = [];
    this.updateSnapshot();
    this.emit();
  }
}

export const cartStore = new CartStore();
