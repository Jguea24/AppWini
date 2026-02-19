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
import { clearCartService, getCartService } from "../../data/services/cartService";
import { listAddressesService, type AddressItem } from "../../data/services/addressService";
import { createOrderService } from "../../data/services/orderService";
import { getToken } from "../../shared/storage/authStorage";
import { useThemeMode } from "../../shared/theme/ThemeContext";

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
  const { isDarkMode } = useThemeMode();
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
  const primaryIcon = isDarkMode ? "#D7B48A" : "#6F4E37";

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
          Metodo de Pago
        </Text>

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

      <View style={[styles.summaryTopBar, isDarkMode && styles.summaryTopBarDark]}>
        <View style={styles.summaryTopLeft}>
          <MaterialCommunityIcons name="cart-outline" size={30} color={primaryIcon} />
          <Text style={[styles.summaryTopText, isDarkMode && styles.summaryTopTextDark]}>
            {cartItems.length} {cartItems.length === 1 ? "producto" : "productos"}
          </Text>
        </View>
        <Text style={[styles.summaryTopSecondary, isDarkMode && styles.summaryTopSecondaryDark]}>
          {totalItems} items
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={primaryIcon} />
            <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
              Cargando resumen...
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons
                  name="map-marker-radius-outline"
                  size={20}
                  color={primaryIcon}
                />
                <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                  Direccion de entrega
                </Text>
              </View>

              {address ? (
                <View style={[styles.addressCard, isDarkMode && styles.addressCardDark]}>
                  <View style={[styles.addressIconWrap, isDarkMode && styles.addressIconWrapDark]}>
                    <MaterialCommunityIcons name="map-marker" size={22} color={primaryIcon} />
                  </View>
                  <View style={styles.addressTextWrap}>
                    <Text style={[styles.addressMain, isDarkMode && styles.addressMainDark]}>
                      {[address.main_address, address.city].filter(Boolean).join(", ")}
                    </Text>
                    {!!address.secondary_street && (
                      <Text
                        style={[styles.addressSecondary, isDarkMode && styles.addressSecondaryDark]}
                      >
                        {address.secondary_street}
                      </Text>
                    )}
                    {address.is_default && (
                      <Text style={[styles.defaultTag, isDarkMode && styles.defaultTagDark]}>
                        Predeterminada
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
                  No hay direccion seleccionada.
                </Text>
              )}

              <TouchableOpacity
                style={[styles.secondaryButton, isDarkMode && styles.secondaryButtonDark]}
                onPress={handleSwitchAddress}
              >
                <MaterialCommunityIcons name="refresh" size={18} color={primaryIcon} />
                <Text
                  style={[styles.secondaryButtonText, isDarkMode && styles.secondaryButtonTextDark]}
                >
                  {addresses.length > 1 ? "Cambiar direccion" : "Elegir direccion"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons
                  name="text-box-edit-outline"
                  size={20}
                  color={primaryIcon}
                />
                <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                  Instrucciones de entrega
                </Text>
              </View>
              <TextInput
                style={[styles.instructionsInput, isDarkMode && styles.instructionsInputDark]}
                placeholder="Ej: llamar al llegar"
                placeholderTextColor={isDarkMode ? "#8F8E96" : "#bcbcc2"}
                value={instructions}
                onChangeText={setInstructions}
                multiline
                maxLength={180}
                textAlignVertical="top"
              />
              <Text style={[styles.counterText, isDarkMode && styles.counterTextDark]}>
                {instructions.length}/180
              </Text>
            </View>

            <View style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="credit-card-outline" size={20} color={primaryIcon} />
                <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                  Metodo de pago
                </Text>
              </View>
              {PAYMENT_METHODS.map((method) => {
                const active = selectedMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodCard,
                      active && styles.methodCardActive,
                      isDarkMode && styles.methodCardDark,
                      active && isDarkMode && styles.methodCardActiveDark,
                    ]}
                    onPress={() => setSelectedMethod(method.id)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.methodIconWrap,
                        active && styles.methodIconWrapActive,
                        isDarkMode && styles.methodIconWrapDark,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={method.icon}
                        size={20}
                        color={active ? "#ffffff" : primaryIcon}
                      />
                    </View>
                    <View style={styles.methodTextWrap}>
                      <Text
                        style={[
                          styles.methodTitle,
                          active && styles.methodTitleActive,
                          isDarkMode && styles.methodTitleDark,
                        ]}
                      >
                        {method.label}
                      </Text>
                      <Text
                        style={[
                          styles.methodDescription,
                          active && styles.methodDescriptionActive,
                          isDarkMode && styles.methodDescriptionDark,
                        ]}
                      >
                        {method.description}
                      </Text>
                    </View>
                    {active && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={22}
                        color={primaryIcon}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons
                  name="receipt-text-outline"
                  size={20}
                  color={primaryIcon}
                />
                <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                  Productos
                </Text>
              </View>
              {cartItems.length === 0 ? (
                <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
                  No hay productos en el carrito.
                </Text>
              ) : (
                cartItems.map((item, index) => {
                  const productName = item.product_name ?? item.name ?? `Producto ${index + 1}`;
                  const qty = Math.max(1, toNumber(item.quantity ?? item.cantidad, 1));
                  const unitPrice = toNumber(item.product_price ?? item.price, 0);
                  return (
                    <View
                      key={`${productName}-${index}`}
                      style={[
                        styles.productRow,
                        index > 0 && styles.productRowBorder,
                        index > 0 && isDarkMode && styles.productRowBorderDark,
                      ]}
                    >
                      <Text style={[styles.productName, isDarkMode && styles.productNameDark]}>
                        {productName}
                      </Text>
                      <View style={styles.productRight}>
                        <Text style={[styles.productQty, isDarkMode && styles.productQtyDark]}>
                          x{qty}
                        </Text>
                        <Text style={[styles.productPrice, isDarkMode && styles.productPriceDark]}>
                          {formatMoney(unitPrice * qty)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <View style={[styles.totalsBlock, isDarkMode && styles.totalsBlockDark]}>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabelStrong, isDarkMode && styles.totalLabelStrongDark]}>
                  Subtotal productos
                </Text>
                <Text style={[styles.totalValueStrong, isDarkMode && styles.totalValueStrongDark]}>
                  {formatMoney(subtotalProducts)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabelMuted, isDarkMode && styles.totalLabelMutedDark]}>
                  Zona de entrega
                </Text>
                <Text style={[styles.totalValueStrong, isDarkMode && styles.totalValueStrongDark]}>
                  {DELIVERY_ZONE_LABEL}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, isDarkMode && styles.totalLabelDark]}>Envio</Text>
                <Text style={[styles.totalValueStrong, isDarkMode && styles.totalValueStrongDark]}>
                  {formatMoney(shippingFee)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, isDarkMode && styles.totalLabelDark]}>
                  Recargo multi-proveedor
                </Text>
                <Text style={[styles.totalValueStrong, isDarkMode && styles.totalValueStrongDark]}>
                  {formatMoney(surcharge)}
                </Text>
              </View>
              <View style={[styles.divider, isDarkMode && styles.dividerDark]} />
              <View style={styles.totalRow}>
                <Text style={[styles.totalPayLabel, isDarkMode && styles.totalPayLabelDark]}>
                  Total a pagar
                </Text>
                <Text style={[styles.totalPayValue, isDarkMode && styles.totalPayValueDark]}>
                  {formatMoney(totalToPay)}
                </Text>
              </View>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, isDarkMode && styles.footerDark]}>
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
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
  },
  headerTitleDark: {
    color: "#F2F2F4",
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
  summaryTopBarDark: {
    backgroundColor: "#1A1A1E",
    borderColor: "#2E2E33",
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
  summaryTopTextDark: {
    color: "#F2F2F4",
  },
  summaryTopSecondary: {
    fontSize: 15,
    color: "#8c8c92",
  },
  summaryTopSecondaryDark: {
    color: "#A0A0A8",
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
  loadingTextDark: {
    color: "#A0A0A8",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3D8CE",
    padding: 14,
    marginBottom: 12,
  },
  sectionCardDark: {
    backgroundColor: "#1A1A1E",
    borderColor: "#2E2E33",
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
  sectionTitleDark: {
    color: "#F2F2F4",
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
  addressCardDark: {
    borderColor: "#34343B",
    backgroundColor: "#232329",
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
  addressIconWrapDark: {
    backgroundColor: "#2A211A",
  },
  addressTextWrap: {
    flex: 1,
  },
  addressMain: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  addressMainDark: {
    color: "#F2F2F4",
  },
  addressSecondary: {
    marginTop: 2,
    color: "#6f6f75",
    fontSize: 14,
  },
  addressSecondaryDark: {
    color: "#B6B6BC",
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
  defaultTagDark: {
    backgroundColor: "#2A211A",
    color: "#E1C29F",
  },
  emptyText: {
    color: "#8D7A6B",
    fontSize: 14,
  },
  emptyTextDark: {
    color: "#B6B6BC",
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
  secondaryButtonDark: {
    backgroundColor: "#2A211A",
  },
  secondaryButtonText: {
    marginLeft: 6,
    color: "#6F4E37",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButtonTextDark: {
    color: "#E1C29F",
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
  instructionsInputDark: {
    backgroundColor: "#232329",
    borderColor: "#34343B",
    color: "#F2F2F4",
  },
  counterText: {
    marginTop: 6,
    alignSelf: "flex-end",
    color: "#8D7A6B",
    fontSize: 12,
  },
  counterTextDark: {
    color: "#A0A0A8",
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
  methodCardDark: {
    borderColor: "#34343B",
    backgroundColor: "#232329",
  },
  methodCardActive: {
    borderColor: "#6F4E37",
    backgroundColor: "#F4E6D8",
  },
  methodCardActiveDark: {
    borderColor: "#D7B48A",
    backgroundColor: "#2A211A",
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
  methodIconWrapDark: {
    backgroundColor: "#2C2C31",
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
  methodTitleDark: {
    color: "#F2F2F4",
  },
  methodTitleActive: {
    color: "#3d2f24",
  },
  methodDescription: {
    marginTop: 2,
    color: "#8D7A6B",
    fontSize: 13,
  },
  methodDescriptionDark: {
    color: "#A0A0A8",
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
  productRowBorderDark: {
    borderTopColor: "#34343B",
  },
  productName: {
    flex: 1,
    color: "#1d1d1f",
    fontSize: 15,
    paddingRight: 8,
  },
  productNameDark: {
    color: "#F2F2F4",
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
  productQtyDark: {
    color: "#A0A0A8",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },
  productPriceDark: {
    color: "#F2F2F4",
  },
  totalsBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3D8CE",
    padding: 14,
    marginBottom: 8,
  },
  totalsBlockDark: {
    backgroundColor: "#1A1A1E",
    borderColor: "#2E2E33",
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
  totalLabelStrongDark: {
    color: "#F2F2F4",
  },
  totalLabelMuted: {
    fontSize: 15,
    color: "#8c8c92",
  },
  totalLabelMutedDark: {
    color: "#A0A0A8",
  },
  totalLabel: {
    fontSize: 15,
    color: "#1f1f24",
  },
  totalLabelDark: {
    color: "#D6D6DC",
  },
  totalValueStrong: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  totalValueStrongDark: {
    color: "#F2F2F4",
  },
  divider: {
    marginTop: 8,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#d8cbbf",
  },
  dividerDark: {
    borderTopColor: "#34343B",
  },
  totalPayLabel: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111111",
  },
  totalPayLabelDark: {
    color: "#F2F2F4",
  },
  totalPayValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
  },
  totalPayValueDark: {
    color: "#D7B48A",
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
  footerDark: {
    borderTopColor: "#2E2E33",
    backgroundColor: "#121214",
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


