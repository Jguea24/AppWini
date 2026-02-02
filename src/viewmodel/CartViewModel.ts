import { useState } from "react";
import { addToCartService } from "../services/cartService";
import { getToken } from "../shared/storage/authStorage";

export function useCartViewModel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const addToCart = async (productId: number) => {
    try {
      setLoading(true);
      setMessage(null);

      const token = await getToken();
      if (!token) {
        setMessage("Sesión no válida");
        return;
      }

      await addToCartService(productId, token);
      setMessage("Producto agregado al carrito");
    } catch {
      setMessage("Error al agregar al carrito");
    } finally {
      setLoading(false);
    }
  };

  return { addToCart, loading, message };
}
