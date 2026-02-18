import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { clearCartService, getCartService } from "../../services/cartService";
import { listAddressesService, type AddressItem } from "../../services/addressService";
import { createOrderService } from "../../services/orderService";
import { getToken } from "../../shared/storage/authStorage";

type CartItem = {
  id?: number | string;
  product?: number | string;
  product_id?: number | string;
  product_name?: string;
  name?: string;
  product_price?: number | string;
  price?: number | string;
  quantity?: number | string;
  cantidad?: number | string;
};

type PaymentMethodId = "cash" | "transfer";

const DELIVERY_ZONE_LABEL = "Periferia Cercana";
const DELIVERY_FEE = 1.5;
const MULTI_VENDOR_SURCHARGE = 0.3;

const PAYMENT_METHODS: Array<{
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: "cash",
    label: "Efectivo",
    description: "Paga al recibir tu pedido",
    icon: "cash-multiple",
  },
  {
    id: "transfer",
    label: "Transferencia",
    description: "Pago bancario inmediato",
    icon: "bank-transfer",
  },
];

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

const getOrderIdentifier = (order: Record<string, unknown>): string | null => {
  const candidateKeys = ["id", "order_id", "number", "code"];
  for (const key of candidateKeys) {
    const value = order[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return null;
};

export function PaymentMethodScreen({ navigation, route }: any) {
  const routeAddressParam = route?.params?.address as AddressItem | undefined;
  const routeDeliveryInstructionsParam: string =
    typeof route?.params?.deliveryInstructions === "string"
      ? route.params.deliveryInstructions
      : "";

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [address, setAddress] = useState<AddressItem | null>(null);
  const [instructions, setInstructions] = useState<string>(routeDeliveryInstructionsParam);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("cash");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setError("Sesion no valida");
        setCartItems([]);
        setAddresses([]);
        setAddress(null);
        return;
      }

      const [cartData, addressesData] = await Promise.all([
        getCartService(token),
        listAddressesService(token),
      ]);

      const normalizedCart = normalizeCartResponse(cartData);
      setCartItems(normalizedCart);
      setAddresses(addressesData);

      const defaultAddress =
        routeAddressParam ??
        addressesData.find((item) => item.is_default) ??
        addressesData[0] ??
        null;
      setAddress(defaultAddress);

      if (routeDeliveryInstructionsParam) {
        setInstructions((current) => current || routeDeliveryInstructionsParam);
      } else if (typeof routeAddressParam?.delivery_instructions === "string") {
        setInstructions((current) => current || routeAddressParam.delivery_instructions || "");
      }
    } catch (err) {
      if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError("No se pudo cargar la pantalla de pago");
      }
    } finally {
      setLoading(false);
    }
  }, [routeAddressParam, routeDeliveryInstructionsParam]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const handleClearCart = () => {
    if (!cartItems.length || clearing) {
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
              setClearing(true);
              setError(null);

              const token = await getToken();
              if (!token) {
                setError("Sesion no valida");
                return;
              }

              await clearCartService(token);
              await loadData();
            } catch (err) {
              if (err instanceof Error && err.message.trim().length > 0) {
                setError(err.message);
              } else {
                setError("No se pudo vaciar el carrito");
              }
            } finally {
              setClearing(false);
            }
          })();
        },
      },
    ]);
  };

  const handleSwitchAddress = () => {
    if (!addresses.length) {
      navigation.navigate("NewAddress");
      return;
    }

    if (addresses.length === 1) {
      navigation.navigate("NewAddress");
      return;
    }

    const currentIndex = Math.max(
      0,
      addresses.findIndex((item) => item.id === address?.id)
    );
    const nextIndex = (currentIndex + 1) % addresses.length;
    setAddress(addresses[nextIndex]);
  };

  const subtotalProducts = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        const price = toNumber(item.product_price ?? item.price, 0);
        const qty = Math.max(1, toNumber(item.quantity ?? item.cantidad, 1));
        return acc + price * qty;
      }, 0),
    [cartItems]
  );

  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => acc + Math.max(1, toNumber(item.quantity ?? item.cantidad, 1)),
        0
      ),
    [cartItems]
  );

  const shippingFee = cartItems.length > 0 ? DELIVERY_FEE : 0;
  const surcharge = cartItems.length > 0 ? MULTI_VENDOR_SURCHARGE : 0;
  const totalToPay = subtotalProducts + shippingFee + surcharge;
  const canConfirm = cartItems.length > 0 && !!address && !confirming;

  const selectedMethodLabel =
    PAYMENT_METHODS.find((method) => method.id === selectedMethod)?.label ?? "Pago";

  const handleConfirmOrder = async () => {
    if (!canConfirm) {
      Alert.alert("Pedido", "Debes tener productos y direccion seleccionada");
      return;
    }

    try {
      setConfirming(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setError("Sesion no valida");
        return;
      }

      const deliveryInstructions = instructions.trim();
      const productItems = cartItems
        .map((item) => {
          const productId = Number(item.product_id ?? item.product);
          const quantity = Math.max(1, toNumber(item.quantity ?? item.cantidad, 1));
          if (!Number.isFinite(productId) || productId <= 0) {
            return null;
          }
          return { product: productId, quantity };
        })
        .filter((item): item is { product: number; quantity: number } => item !== null);

      const commonFields: Record<string, unknown> = {};
      if (deliveryInstructions.length > 0) {
        commonFields.delivery_instructions = deliveryInstructions;
      }

      const addressId = address?.id;
      const payloadCandidates: Array<Record<string, unknown>> = [];

      if (addressId !== undefined) {
        payloadCandidates.push(
          { ...commonFields, address: addressId, payment_method: selectedMethod },
          { ...commonFields, address_id: addressId, payment_method: selectedMethod },
          { ...commonFields, address: addressId, payment_type: selectedMethod },
          { ...commonFields, address_id: addressId, payment_type: selectedMethod }
        );
      }

      payloadCandidates.push(
        { ...commonFields, payment_method: selectedMethod },
        { ...commonFields, payment_type: selectedMethod }
      );

      if (productItems.length > 0) {
        if (addressId !== undefined) {
          payloadCandidates.push(
            {
              ...commonFields,
              address: addressId,
              payment_method: selectedMethod,
              items: productItems,
            },
            {
              ...commonFields,
              address_id: addressId,
              payment_method: selectedMethod,
              items: productItems,
            }
          );
        }

        payloadCandidates.push({
          ...commonFields,
          payment_method: selectedMethod,
          items: productItems,
        });
      }

      let createdOrder: Record<string, unknown> | null = null;
      let lastError: Error | null = null;
      for (const payload of payloadCandidates) {
        try {
          createdOrder = await createOrderService(payload, token);
          break;
        } catch (err) {
          if (err instanceof Error) {
            lastError = err;
          } else {
            lastError = new Error("No se pudo crear la orden");
          }
        }
      }

      if (!createdOrder) {
        throw lastError ?? new Error("No se pudo crear la orden");
      }

      try {
        const updatedCartResponse = await getCartService(token);
        const updatedCartItems = normalizeCartResponse(updatedCartResponse);
        if (updatedCartItems.length > 0) {
          await clearCartService(token);
        }
      } catch {
        // Si no se puede verificar/limpiar, mantenemos la orden creada.
      }

      const orderId = getOrderIdentifier(createdOrder);
      Alert.alert(
        "Pedido confirmado",
        `${orderId ? `Orden #${orderId}\n` : ""}Metodo: ${selectedMethodLabel}\nTotal: ${formatMoney(
          totalToPay
        )}`,
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );
    } catch (err) {
      if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError("No se pudo confirmar el pedido");
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        >
          <MaterialCommunityIcons name="chevron-left" size={36} color="#6F4E37" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Metodo de Pago</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={handleClearCart}
          disabled={clearing || !cartItems.length}
          accessibilityLabel="Vaciar carrito"
        >
          {clearing ? (
            <ActivityIndicator color="#d74a4a" />
          ) : (
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={30}
              color={cartItems.length ? "#d74a4a" : "#cccccc"}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.summaryTopBar}>
        <View style={styles.summaryTopLeft}>
          <MaterialCommunityIcons name="cart-outline" size={30} color="#6F4E37" />
          <Text style={styles.summaryTopText}>
            {cartItems.length} {cartItems.length === 1 ? "producto" : "productos"}
          </Text>
        </View>
        <Text style={styles.summaryTopSecondary}>{totalItems} items</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#6F4E37" />
            <Text style={styles.loadingText}>Cargando resumen...</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color="#6F4E37" />
                <Text style={styles.sectionTitle}>Direccion de entrega</Text>
              </View>

              {address ? (
                <View style={styles.addressCard}>
                  <View style={styles.addressIconWrap}>
                    <MaterialCommunityIcons name="map-marker" size={22} color="#6F4E37" />
                  </View>
                  <View style={styles.addressTextWrap}>
                    <Text style={styles.addressMain}>
                      {[address.main_address, address.city].filter(Boolean).join(", ")}
                    </Text>
                    {!!address.secondary_street && (
                      <Text style={styles.addressSecondary}>{address.secondary_street}</Text>
                    )}
                    {address.is_default && (
                      <Text style={styles.defaultTag}>Predeterminada</Text>
                    )}
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyText}>No hay direccion seleccionada.</Text>
              )}

              <TouchableOpacity style={styles.secondaryButton} onPress={handleSwitchAddress}>
                <MaterialCommunityIcons name="refresh" size={18} color="#6F4E37" />
                <Text style={styles.secondaryButtonText}>
                  {addresses.length > 1 ? "Cambiar direccion" : "Elegir direccion"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="text-box-edit-outline" size={20} color="#6F4E37" />
                <Text style={styles.sectionTitle}>Instrucciones de entrega</Text>
              </View>
              <TextInput
                style={styles.instructionsInput}
                placeholder="Ej: llamar al llegar"
                placeholderTextColor="#bcbcc2"
                value={instructions}
                onChangeText={setInstructions}
                multiline
                maxLength={180}
                textAlignVertical="top"
              />
              <Text style={styles.counterText}>{instructions.length}/180</Text>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="credit-card-outline" size={20} color="#6F4E37" />
                <Text style={styles.sectionTitle}>Metodo de pago</Text>
              </View>
              {PAYMENT_METHODS.map((method) => {
                const active = selectedMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.methodCard, active && styles.methodCardActive]}
                    onPress={() => setSelectedMethod(method.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.methodIconWrap, active && styles.methodIconWrapActive]}>
                      <MaterialCommunityIcons
                        name={method.icon}
                        size={20}
                        color={active ? "#ffffff" : "#6F4E37"}
                      />
                    </View>
                    <View style={styles.methodTextWrap}>
                      <Text style={[styles.methodTitle, active && styles.methodTitleActive]}>
                        {method.label}
                      </Text>
                      <Text
                        style={[styles.methodDescription, active && styles.methodDescriptionActive]}
                      >
                        {method.description}
                      </Text>
                    </View>
                    {active && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={22}
                        color="#6F4E37"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="receipt-text-outline" size={20} color="#6F4E37" />
                <Text style={styles.sectionTitle}>Productos</Text>
              </View>
              {cartItems.length === 0 ? (
                <Text style={styles.emptyText}>No hay productos en el carrito.</Text>
              ) : (
                cartItems.map((item, index) => {
                  const productName = item.product_name ?? item.name ?? `Producto ${index + 1}`;
                  const qty = Math.max(1, toNumber(item.quantity ?? item.cantidad, 1));
                  const unitPrice = toNumber(item.product_price ?? item.price, 0);
                  return (
                    <View
                      key={`${productName}-${index}`}
                      style={[styles.productRow, index > 0 && styles.productRowBorder]}
                    >
                      <Text style={styles.productName}>{productName}</Text>
                      <View style={styles.productRight}>
                        <Text style={styles.productQty}>x{qty}</Text>
                        <Text style={styles.productPrice}>{formatMoney(unitPrice * qty)}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <View style={styles.totalsBlock}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabelStrong}>Subtotal productos</Text>
                <Text style={styles.totalValueStrong}>{formatMoney(subtotalProducts)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabelMuted}>Zona de entrega</Text>
                <Text style={styles.totalValueStrong}>{DELIVERY_ZONE_LABEL}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Envio</Text>
                <Text style={styles.totalValueStrong}>{formatMoney(shippingFee)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Recargo multi-proveedor</Text>
                <Text style={styles.totalValueStrong}>{formatMoney(surcharge)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalPayLabel}>Total a pagar</Text>
                <Text style={styles.totalPayValue}>{formatMoney(totalToPay)}</Text>
              </View>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
          disabled={!canConfirm}
          onPress={handleConfirmOrder}
        >
          {confirming ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirmar pedido</Text>
          )}
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
  header: {
    height: 92,
    backgroundColor: "#F3EEE8",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  headerIconButton: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
  },
  summaryTopBar: {
    height: 72,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E6DCCF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryTopLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryTopText: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "800",
    color: "#111111",
  },
  summaryTopSecondary: {
    fontSize: 15,
    color: "#8c8c92",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#7d7d82",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3D8CE",
    padding: 14,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
  },
  addressCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8DED4",
    padding: 12,
    backgroundColor: "#FCFAF8",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3E8DD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  addressTextWrap: {
    flex: 1,
  },
  addressMain: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  addressSecondary: {
    marginTop: 2,
    color: "#6f6f75",
    fontSize: 14,
  },
  defaultTag: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#F2E5D8",
    color: "#6F4E37",
    fontWeight: "700",
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  emptyText: {
    color: "#8D7A6B",
    fontSize: 14,
  },
  secondaryButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F2E5D8",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryButtonText: {
    marginLeft: 6,
    color: "#6F4E37",
    fontWeight: "700",
    fontSize: 14,
  },
  instructionsInput: {
    minHeight: 84,
    borderRadius: 12,
    backgroundColor: "#f7f2ec",
    borderWidth: 1,
    borderColor: "#e7ddd2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111111",
  },
  counterText: {
    marginTop: 6,
    alignSelf: "flex-end",
    color: "#8D7A6B",
    fontSize: 12,
  },
  methodCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5D9CD",
    backgroundColor: "#FCFAF8",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  methodCardActive: {
    borderColor: "#6F4E37",
    backgroundColor: "#F4E6D8",
  },
  methodIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFE2D4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  methodIconWrapActive: {
    backgroundColor: "#6F4E37",
  },
  methodTextWrap: {
    flex: 1,
  },
  methodTitle: {
    color: "#3d2f24",
    fontWeight: "800",
    fontSize: 16,
  },
  methodTitleActive: {
    color: "#3d2f24",
  },
  methodDescription: {
    marginTop: 2,
    color: "#8D7A6B",
    fontSize: 13,
  },
  methodDescriptionActive: {
    color: "#6F4E37",
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  productRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#ece2d8",
  },
  productName: {
    flex: 1,
    color: "#1d1d1f",
    fontSize: 15,
    paddingRight: 8,
  },
  productRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  productQty: {
    color: "#8D7A6B",
    marginRight: 10,
    fontSize: 15,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },
  totalsBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3D8CE",
    padding: 14,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabelStrong: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a1d",
  },
  totalLabelMuted: {
    fontSize: 15,
    color: "#8c8c92",
  },
  totalLabel: {
    fontSize: 15,
    color: "#1f1f24",
  },
  totalValueStrong: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  divider: {
    marginTop: 8,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#d8cbbf",
  },
  totalPayLabel: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111111",
  },
  totalPayValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
  },
  errorText: {
    color: "#b42318",
    textAlign: "center",
    marginBottom: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E3D8CE",
    backgroundColor: "#F3EEE8",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  confirmButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#7A5230",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.55,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
});
