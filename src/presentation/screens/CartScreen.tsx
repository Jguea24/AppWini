import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  addToCartService,
  clearCartService,
  getCartService,
  removeCartItemService,
  updateCartItemService,
} from "../../data/services/cartService";
import { API_BASE_URL } from "../../data/services/api";
import { getToken } from "../../shared/storage/authStorage";
import { useThemeMode } from "../../shared/theme/ThemeContext";

type CartItem = {
  id?: number | string;
  product?: number;
  product_id?: number;
  product_name?: string;
  name?: string;
  product_price?: number | string;
  price?: number | string;
  product_image_url?: string | null;
  image?: string | null;
  quantity?: number | string;
  cantidad?: number | string;
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

const normalizeCartResponse = (payload: unknown): CartItem[] => {
  if (Array.isArray(payload)) {
    return payload as CartItem[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const keys = ["items", "results", "cart", "data"];
  for (const key of keys) {
    const nested = record[key];
    if (Array.isArray(nested)) {
      return nested as CartItem[];
    }
  }

  return [];
};

const resolveImageUrl = (rawImage: string | null | undefined): string | null => {
  if (!rawImage) {
    return null;
  }

  if (/^https?:\/\//i.test(rawImage)) {
    return rawImage;
  }

  const normalizedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL
    : `${API_BASE_URL}/`;
  const normalizedPath = rawImage.startsWith("/")
    ? rawImage.slice(1)
    : rawImage;

  return `${normalizedBase}${normalizedPath}`;
};

const getItemKey = (item: CartItem, index = 0): string =>
  String(item.id ?? item.product_id ?? item.product ?? index);

const getItemId = (item: CartItem): number | string | null =>
  item.id ?? item.product_id ?? item.product ?? null;

const getProductId = (item: CartItem): number | null => {
  const parsed = Number(item.product_id ?? item.product);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return null;
};

const getQuantity = (item: CartItem): number =>
  Math.max(1, toNumber(item.quantity ?? item.cantidad, 1));

const getUnitPrice = (item: CartItem): number =>
  toNumber(item.product_price ?? item.price, 0);

export function CartScreen({ navigation }: any) {
  const { isDarkMode } = useThemeMode();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionItemKey, setActionItemKey] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  const loadCart = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const token = await getToken();
      if (!token) {
        setItems([]);
        return;
      }

      const data = await getCartService(token);
      setItems(normalizeCartResponse(data));
    } catch (err) {
      if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError("No se pudo cargar el carrito");
      }
      if (!silent) {
        setItems([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  const executeItemAction = useCallback(
    async (
      item: CartItem,
      index: number,
      action: (token: string) => Promise<void>
    ) => {
      const key = getItemKey(item, index);
      try {
        setActionItemKey(key);
        setError(null);

        const token = await getToken();
        if (!token) {
          setError("Sesion no valida");
          return;
        }

        await action(token);
        await loadCart(true);
      } catch (err) {
        if (err instanceof Error && err.message.trim().length > 0) {
          setError(err.message);
        } else {
          setError("No se pudo actualizar el carrito");
        }
      } finally {
        setActionItemKey(null);
      }
    },
    [loadCart]
  );

  const handleIncrease = useCallback(
    async (item: CartItem, index: number) => {
      await executeItemAction(item, index, async (token) => {
        const productId = getProductId(item);
        if (productId !== null) {
          await addToCartService(productId, token, 1);
          return;
        }

        const itemId = getItemId(item);
        if (itemId === null) {
          throw new Error("No se pudo identificar el producto");
        }

        const quantity = getQuantity(item);
        await updateCartItemService(itemId, token, quantity + 1, productId ?? undefined);
      });
    },
    [executeItemAction]
  );

  const handleDecrease = useCallback(
    async (item: CartItem, index: number) => {
      const currentQuantity = getQuantity(item);
      if (currentQuantity <= 1) {
        return;
      }

      await executeItemAction(item, index, async (token) => {
        const itemId = getItemId(item);
        const productId = getProductId(item);
        if (itemId === null) {
          throw new Error("No se pudo identificar el producto");
        }
        await updateCartItemService(
          itemId,
          token,
          currentQuantity - 1,
          productId ?? undefined
        );
      });
    },
    [executeItemAction]
  );

  const handleRemove = useCallback(
    async (item: CartItem, index: number) => {
      Alert.alert("Eliminar producto", "Quieres quitar este producto del carrito?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void executeItemAction(item, index, async (token) => {
              const itemId = getItemId(item);
              const productId = getProductId(item);
              if (itemId === null) {
                throw new Error("No se pudo identificar el producto");
              }
              await removeCartItemService(itemId, token, productId ?? undefined);
            });
          },
        },
      ]);
    },
    [executeItemAction]
  );

  const handleClearCart = useCallback(() => {
    if (!items.length || clearingAll) {
      return;
    }

    Alert.alert("Vaciar carrito", "Quieres eliminar todos los productos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Vaciar",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              setClearingAll(true);
              setError(null);
              const token = await getToken();
              if (!token) {
                setError("Sesion no valida");
                return;
              }

              await clearCartService(token);
              await loadCart(true);
            } catch (err) {
              if (err instanceof Error && err.message.trim().length > 0) {
                setError(err.message);
              } else {
                setError("No se pudo vaciar el carrito");
              }
            } finally {
              setClearingAll(false);
            }
          })();
        },
      },
    ]);
  }, [clearingAll, items.length, loadCart]);

  const total = useMemo(
    () =>
      items.reduce((acc, item) => acc + getUnitPrice(item) * getQuantity(item), 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + getQuantity(item), 0),
    [items]
  );

  const distinctProducts = items.length;
  const primaryIcon = isDarkMode ? "#D7B48A" : "#6F4E37";
  const secondaryIcon = isDarkMode ? "#8F8E96" : "#919191";

  return (
    <View style={[styles.screen, isDarkMode && styles.screenDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        >
          <MaterialCommunityIcons name="chevron-left" size={36} color={primaryIcon} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
          Mi Carrito
        </Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={handleClearCart}
          disabled={clearingAll || !items.length}
          accessibilityLabel="Vaciar carrito"
        >
          {clearingAll ? (
            <ActivityIndicator color="#d74a4a" />
          ) : (
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={30}
              color={items.length ? "#d74a4a" : "#cccccc"}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryRow, isDarkMode && styles.summaryRowDark]}>
        <View style={styles.summaryLeft}>
          <MaterialCommunityIcons name="cart-outline" size={34} color={primaryIcon} />
          <Text style={[styles.summaryMainText, isDarkMode && styles.summaryMainTextDark]}>
            {distinctProducts} {distinctProducts === 1 ? "producto" : "productos"}
          </Text>
        </View>
        <Text style={[styles.summarySecondaryText, isDarkMode && styles.summarySecondaryTextDark]}>
          {totalItems} items
        </Text>
      </View>

      <View style={styles.listWrap}>
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={primaryIcon} />
            <Text style={[styles.stateText, isDarkMode && styles.stateTextDark]}>
              Cargando carrito...
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item, index) => getItemKey(item, index)}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.centerState}>
                <Text style={[styles.stateText, isDarkMode && styles.stateTextDark]}>
                  Tu carrito esta vacio
                </Text>
              </View>
            }
            ListFooterComponent={
              <TouchableOpacity
                style={[styles.addMoreButton, isDarkMode && styles.addMoreButtonDark]}
                onPress={() => navigation.navigate("Home")}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={26}
                  color={primaryIcon}
                />
                <Text style={[styles.addMoreText, isDarkMode && styles.addMoreTextDark]}>
                  Agregar mas productos
                </Text>
              </TouchableOpacity>
            }
            renderItem={({ item, index }) => {
              const itemKey = getItemKey(item, index);
              const isUpdating = actionItemKey === itemKey;
              const quantity = getQuantity(item);
              const unitPrice = getUnitPrice(item);
              const subtotal = unitPrice * quantity;
              const name =
                item.product_name ??
                item.name ??
                `Producto ${item.product_id ?? item.product ?? ""}`.trim();
              const imageUrl = resolveImageUrl(
                item.product_image_url ?? item.image ?? null
              );

              return (
                <View style={[styles.itemCard, isDarkMode && styles.itemCardDark]}>
                  <Image
                    source={imageUrl ? { uri: imageUrl } : fallbackProductImage}
                    style={[styles.itemImage, isDarkMode && styles.itemImageDark]}
                  />

                  <View style={styles.itemBody}>
                    <View style={styles.itemTitleRow}>
                      <Text style={[styles.itemName, isDarkMode && styles.itemNameDark]}>
                        {name}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeCircle}
                        onPress={() => void handleRemove(item, index)}
                        disabled={isUpdating}
                        accessibilityLabel="Eliminar item"
                      >
                        <MaterialCommunityIcons name="close" size={20} color="#ffffff" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.unitPriceRow}>
                      <Text style={[styles.unitPriceText, isDarkMode && styles.unitPriceTextDark]}>
                        {formatMoney(unitPrice)}
                      </Text>
                      <Text style={[styles.unitLabel, isDarkMode && styles.unitLabelDark]}>
                        {" "}
                        c/u
                      </Text>
                    </View>

                    <View style={styles.itemBottomRow}>
                      <View style={[styles.qtyControl, isDarkMode && styles.qtyControlDark]}>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => void handleDecrease(item, index)}
                          disabled={isUpdating || quantity <= 1}
                        >
                          <Text
                            style={[
                              styles.qtyButtonText,
                              quantity <= 1 && styles.qtyButtonDisabledText,
                            ]}
                          >
                            -
                          </Text>
                        </TouchableOpacity>

                        <Text style={[styles.qtyValue, isDarkMode && styles.qtyValueDark]}>
                          {quantity}
                        </Text>

                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => void handleIncrease(item, index)}
                          disabled={isUpdating}
                        >
                          <Text style={styles.qtyButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.itemTotalText, isDarkMode && styles.itemTotalTextDark]}>
                        {formatMoney(subtotal)}
                      </Text>
                    </View>

                    {isUpdating && (
                      <ActivityIndicator
                        size="small"
                        color={primaryIcon}
                        style={styles.itemLoader}
                      />
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={[styles.checkoutPanel, isDarkMode && styles.checkoutPanelDark]}>
        <View style={styles.subtotalRow}>
          <Text style={[styles.subtotalLabel, isDarkMode && styles.subtotalLabelDark]}>
            Subtotal:
          </Text>
          <Text style={[styles.subtotalValue, isDarkMode && styles.subtotalValueDark]}>
            {formatMoney(total)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate("NewAddress")}
        >
          <Text style={styles.checkoutButtonText}>Continuar al Pago</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomNav, isDarkMode && styles.bottomNavDark]}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Home")}>
          <MaterialCommunityIcons name="home" size={28} color={primaryIcon} />
          <Text
            style={[
              styles.bottomLabel,
              styles.bottomLabelActive,
              isDarkMode && styles.bottomLabelDark,
              isDarkMode && styles.bottomLabelActiveDark,
            ]}
          >
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate("Shipments")}
        >
          <MaterialCommunityIcons name="cube-outline" size={28} color={secondaryIcon} />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>Envios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate("Orders")}
        >
          <MaterialCommunityIcons name="shopping-outline" size={28} color={secondaryIcon} />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>Pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Profile")}>
          <MaterialCommunityIcons name="account-outline" size={28} color={secondaryIcon} />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3EEE8",
  },
  screenDark: {
    backgroundColor: "#121214",
  },
  header: {
    height: 92,
    backgroundColor: "#F3EEE8",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  headerDark: {
    backgroundColor: "#121214",
  },
  headerIconButton: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 45 / 2,
    fontWeight: "800",
    color: "#111111",
  },
  headerTitleDark: {
    color: "#F2F2F4",
  },
  summaryRow: {
    height: 74,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E6DCCF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryRowDark: {
    backgroundColor: "#1A1A1E",
    borderColor: "#2E2E33",
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryMainText: {
    marginLeft: 12,
    fontSize: 21 / 2,
    fontWeight: "800",
    color: "#111111",
  },
  summaryMainTextDark: {
    color: "#F2F2F4",
  },
  summarySecondaryText: {
    fontSize: 20 / 2,
    color: "#919191",
  },
  summarySecondaryTextDark: {
    color: "#A0A0A8",
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 38,
  },
  stateText: {
    marginTop: 8,
    fontSize: 14,
    color: "#7d7d82",
  },
  stateTextDark: {
    color: "#A0A0A8",
  },
  itemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCCFC3",
    padding: 14,
    flexDirection: "row",
    marginBottom: 14,
  },
  itemCardDark: {
    backgroundColor: "#1A1A1E",
    borderColor: "#2E2E33",
  },
  itemImage: {
    width: 94,
    height: 94,
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
  },
  itemImageDark: {
    backgroundColor: "#2A2A30",
  },
  itemBody: {
    flex: 1,
    marginLeft: 14,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 20 / 2,
    fontWeight: "800",
    color: "#111111",
    paddingRight: 8,
  },
  itemNameDark: {
    color: "#F2F2F4",
  },
  removeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#c8c8ce",
    alignItems: "center",
    justifyContent: "center",
  },
  unitPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  unitPriceText: {
    color: "#6F4E37",
    fontWeight: "800",
    fontSize: 20 / 2,
  },
  unitPriceTextDark: {
    color: "#E1C29F",
  },
  unitLabel: {
    color: "#9a9aa0",
    fontSize: 16 / 2,
  },
  unitLabelDark: {
    color: "#A0A0A8",
  },
  itemBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyControl: {
    width: 208 / 2,
    height: 52 / 2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D4C3B2",
    backgroundColor: "#F8F2EA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  qtyControlDark: {
    borderColor: "#34343B",
    backgroundColor: "#232329",
  },
  qtyButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    fontSize: 34 / 2,
    color: "#6F4E37",
    fontWeight: "500",
  },
  qtyButtonDisabledText: {
    color: "#c8c8cf",
  },
  qtyValue: {
    minWidth: 22,
    textAlign: "center",
    fontSize: 20 / 2,
    fontWeight: "800",
    color: "#111111",
  },
  qtyValueDark: {
    color: "#F2F2F4",
  },
  itemTotalText: {
    fontSize: 26 / 2,
    fontWeight: "900",
    color: "#111111",
  },
  itemTotalTextDark: {
    color: "#F2F2F4",
  },
  itemLoader: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  addMoreButton: {
    marginTop: 2,
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: "#EFE4D8",
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreButtonDark: {
    backgroundColor: "#2A211A",
  },
  addMoreText: {
    color: "#6F4E37",
    marginLeft: 8,
    fontSize: 18 / 2,
    fontWeight: "800",
  },
  addMoreTextDark: {
    color: "#E1C29F",
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
  checkoutPanel: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E3D8CE",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  checkoutPanelDark: {
    backgroundColor: "#1A1A1E",
    borderTopColor: "#2E2E33",
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subtotalLabel: {
    color: "#8D7A6B",
    fontSize: 22 / 2,
  },
  subtotalLabelDark: {
    color: "#A0A0A8",
  },
  subtotalValue: {
    color: "#111111",
    fontSize: 34 / 2,
    fontWeight: "900",
  },
  subtotalValueDark: {
    color: "#F2F2F4",
  },
  checkoutButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#7A5230",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 20 / 2,
    fontWeight: "800",
  },
  bottomNav: {
    height: 80,
    borderTopWidth: 1,
    borderTopColor: "#E3D8CE",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 4,
  },
  bottomNavDark: {
    borderTopColor: "#2E2E33",
    backgroundColor: "#1A1A1E",
  },
  bottomItem: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLabel: {
    marginTop: 2,
    color: "#8D7A6B",
    fontSize: 16 / 2,
    fontWeight: "500",
  },
  bottomLabelDark: {
    color: "#A0A0A8",
  },
  bottomLabelActive: {
    color: "#6F4E37",
    fontWeight: "700",
  },
  bottomLabelActiveDark: {
    color: "#D7B48A",
  },
});



