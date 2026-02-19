import { useCallback, useState } from "react";
import {
  addToCartService,
  getCartCountService,
} from "../../data/services/cartService";
import { getToken } from "../../shared/storage/authStorage";

export function useCartViewModel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const extractCartError = (err: unknown): string => {
    if (err instanceof Error && err.message.trim().length > 0) {
      return err.message;
    }

    return "Error al agregar al carrito";
  };

  const loadCartCount = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setCartCount(0);
        return;
      }

      const data = await getCartCountService(token);
      const parsedCount = Number.isFinite(data.count) ? data.count : 0;
      setCartCount(Math.max(0, Math.trunc(parsedCount)));
    } catch {
      setCartCount(0);
    }
  }, []);

  const addToCart = async (productId: number, quantity = 1) => {
    try {
      setLoading(true);
      setMessage(null);

      const token = await getToken();
      if (!token) {
        setMessage("Sesion no valida");
        return;
      }

      const data = await addToCartService(productId, token, quantity);
      const backendMessage =
        typeof data.message === "string" && data.message.trim().length > 0
          ? data.message
          : "Accion completada";
      setMessage(backendMessage);
      await loadCartCount();
    } catch (err) {
      setMessage(extractCartError(err));
    } finally {
      setLoading(false);
    }
  };

  return { addToCart, loading, message, cartCount, loadCartCount };
}


