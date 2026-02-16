import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Product } from "../../model/Product";
import { API_BASE_URL } from "../../services/api";
import { getProductDetailService } from "../../services/productService";
import { useCartViewModel } from "../../viewmodel/CartViewModel";

type ProductDetailRoute = {
  params?: {
    productId?: number;
  };
};

const fallbackProductImage = require("../../shared/assets/product.png");

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return fallback;
};

const formatMoney = (value: number): string => `$${value.toFixed(2)}`;

const resolveImageUrl = (rawImage?: string | null): string | null => {
  if (!rawImage) {
    return null;
  }

  if (/^https?:\/\//i.test(rawImage)) {
    return rawImage;
  }

  const normalizedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL
    : `${API_BASE_URL}/`;
  const normalizedPath = rawImage.startsWith("/") ? rawImage.slice(1) : rawImage;
  return `${normalizedBase}${normalizedPath}`;
};

export function ProductDetailScreen({ navigation, route }: { navigation: any; route: ProductDetailRoute }) {
  const productId = Number(route?.params?.productId ?? 0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart, loading: addingToCart, message: cartMessage } = useCartViewModel();

  useEffect(() => {
    if (!productId) {
      setError("Producto invalido");
      setLoading(false);
      return;
    }

    let active = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductDetailService(productId);
        if (active) {
          setProduct(data);
        }
      } catch (err) {
        if (!active) {
          return;
        }
        if (err instanceof Error && err.message.trim().length > 0) {
          setError(err.message);
        } else {
          setError("No se pudo cargar el producto");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!cartMessage) {
      return;
    }
    Alert.alert("Carrito", cartMessage);
  }, [cartMessage]);

  const unitPrice = useMemo(() => toNumber(product?.price, 0), [product?.price]);
  const oldPriceRaw = (product as any)?.old_price;
  const oldPrice = useMemo(() => {
    const parsed = toNumber(oldPriceRaw, 0);
    return parsed > unitPrice ? parsed : 0;
  }, [oldPriceRaw, unitPrice]);
  const total = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const productImage = useMemo(() => {
    const imageUrl = resolveImageUrl(product?.image_url ?? product?.image);
    return imageUrl ? { uri: imageUrl } : fallbackProductImage;
  }, [product?.image, product?.image_url]);

  const storeName = (product as any)?.store_name ?? "Wini Store";
  const rating = toNumber((product as any)?.rating, 5);
  const reviewsCount = Math.max(0, toNumber((product as any)?.reviews_count, 0));
  const categoryLabel =
    String(
      product?.category_name ??
        product?.categoryName ??
        (typeof product?.category === "string" ? product.category : "") ??
        "Chocolate premium"
    )
      .trim()
      .toUpperCase() || "CHOCOLATE PREMIUM";

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const handleAddToCart = async () => {
    if (!product?.id) {
      return;
    }

    await addToCart(product.id, quantity);
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#6F4E37" size="large" />
        <Text style={styles.stateText}>Cargando producto...</Text>
      </View>
    );
  }

  if (!product || error) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>{error ?? "Producto no disponible"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.replace("ProductDetail", { productId })}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroWrap}>
          <Image source={productImage} style={styles.heroImage} />
          <View style={styles.heroOverlay} />

          <TouchableOpacity
            style={[styles.heroIconButton, styles.heroBackButton]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={34} color="#6F4E37" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heroIconButton, styles.heroCartButton]}
            onPress={() => navigation.navigate("Cart")}
          >
            <MaterialCommunityIcons name="cart-outline" size={28} color="#6F4E37" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{categoryLabel}</Text>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.storeRow}>
            <View style={styles.storeIconWrap}>
              <MaterialCommunityIcons name="storefront-outline" size={22} color="#ffffff" />
            </View>
            <Text style={styles.storeName}>{storeName}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#b9b9bf" />
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.starsWrap}>
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <MaterialCommunityIcons
                  key={`star-${starIndex}`}
                  name={starIndex <= Math.round(rating) ? "star" : "star-outline"}
                  size={22}
                  color="#f5a623"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewsText}>{`${reviewsCount} resenas`}</Text>
          </View>

          <View style={styles.priceRow}>
            <View>
              {oldPrice > 0 && <Text style={styles.oldPrice}>{formatMoney(oldPrice)}</Text>}
              <Text style={styles.newPrice}>{formatMoney(unitPrice)}</Text>
            </View>

            <View style={styles.qtyControl}>
              <TouchableOpacity onPress={decreaseQuantity} style={styles.qtyButton}>
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity onPress={increaseQuantity} style={styles.qtyButton}>
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.separator} />

          <Text style={styles.descriptionTitle}>Descripcion</Text>
          <Text style={styles.descriptionText}>
            {product.description?.trim() || "Producto sin descripcion disponible"}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomActionBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatMoney(total)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, addingToCart && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialCommunityIcons name="cart-plus" size={22} color="#ffffff" />
              <Text style={styles.addToCartText}>Agregar al carrito</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F1EA",
  },
  content: {
    paddingBottom: 132,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F1EA",
    paddingHorizontal: 20,
  },
  stateText: {
    marginTop: 10,
    color: "#7E746A",
    fontSize: 14,
  },
  errorText: {
    color: "#B42318",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#6F4E37",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  heroWrap: {
    height: 332,
    backgroundColor: "#E9DFD4",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(42, 29, 19, 0.12)",
  },
  heroIconButton: {
    position: "absolute",
    top: 50,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E7DDD2",
  },
  heroBackButton: {
    left: 14,
  },
  heroCartButton: {
    right: 14,
  },
  detailCard: {
    marginTop: -14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FDFBF8",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#E8DED4",
  },
  categoryPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#EFE2D2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  categoryPillText: {
    color: "#6F4E37",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  productName: {
    fontSize: 30 / 1.2,
    fontWeight: "800",
    color: "#1F1711",
    marginBottom: 12,
  },
  storeRow: {
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7DDD2",
    backgroundColor: "#FBF7F2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  storeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4B2F1B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  storeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#241A13",
  },
  ratingRow: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7DDD2",
    backgroundColor: "#FBF7F2",
    paddingHorizontal: 12,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
  },
  starsWrap: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2B1F17",
    marginRight: 8,
  },
  reviewsText: {
    color: "#8A8076",
    fontSize: 15,
    fontWeight: "600",
  },
  priceRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  oldPrice: {
    color: "#A69A8E",
    fontSize: 14,
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  newPrice: {
    color: "#6F4E37",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  qtyControl: {
    width: 146,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0D4C8",
    backgroundColor: "#F6EFE7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  qtyButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    fontSize: 22 / 2,
    color: "#8C7E72",
    fontWeight: "700",
  },
  qtyValue: {
    fontSize: 22 / 2,
    color: "#2B2119",
    fontWeight: "800",
  },
  separator: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E4D8CC",
  },
  descriptionTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "800",
    color: "#1F1711",
    marginBottom: 8,
  },
  descriptionText: {
    color: "#776C62",
    fontSize: 16 / 1.1,
    lineHeight: 22,
    marginBottom: 18,
  },
  bottomActionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#E3D7CB",
    backgroundColor: "#FDFBF8",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: "#8B7E72",
    fontSize: 14,
    marginBottom: 1,
  },
  totalValue: {
    color: "#6F4E37",
    fontSize: 30 / 1.1,
    fontWeight: "900",
  },
  addToCartButton: {
    height: 54,
    flex: 1,
    marginLeft: 14,
    borderRadius: 14,
    backgroundColor: "#6F4E37",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  addToCartButtonDisabled: {
    opacity: 0.65,
  },
  addToCartText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 16 / 1.1,
    fontWeight: "800",
  },
});
