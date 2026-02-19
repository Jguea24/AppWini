import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  getOrderDetailService,
  getOrdersService,
  type OrderRecord,
} from "../../services/orderService";
import { getToken } from "../../shared/storage/authStorage";

type OrderSummary = {
  id: string;
  status: string;
  createdAtLabel: string;
  total: number;
  itemsCount: number;
  raw: OrderRecord;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatMoney = (value: number): string => `$${value.toFixed(2)}`;

const toStatusLabel = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Sin estado";
  }

  const normalized = value.trim().toLowerCase().replace(/_/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getOrderId = (order: OrderRecord): string => {
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

  return "N/A";
};

const getOrderTotal = (order: OrderRecord): number => {
  const candidateKeys = ["total", "total_amount", "amount", "grand_total", "subtotal"];
  for (const key of candidateKeys) {
    const value = toNumber(order[key], Number.NaN);
    if (Number.isFinite(value)) {
      return value;
    }
  }
  return 0;
};

const getOrderDate = (order: OrderRecord): string => {
  const candidateKeys = ["created_at", "createdAt", "date", "order_date"];
  for (const key of candidateKeys) {
    const value = order[key];
    if (typeof value === "string" && value.trim().length > 0) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString("es-EC", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return value;
    }
  }
  return "Sin fecha";
};

const getOrderItemsCount = (order: OrderRecord): number => {
  const directCount = toNumber(order.total_items ?? order.items_count, Number.NaN);
  if (Number.isFinite(directCount)) {
    return Math.max(0, Math.trunc(directCount));
  }

  const list = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.order_items)
    ? order.order_items
    : Array.isArray(order.products)
    ? order.products
    : [];

  if (list.length === 0) {
    return 0;
  }

  return list.reduce((acc, item) => {
    if (!item || typeof item !== "object") {
      return acc;
    }
    const record = item as Record<string, unknown>;
    return acc + Math.max(1, Math.trunc(toNumber(record.quantity, 1)));
  }, 0);
};

const mapOrderSummary = (order: OrderRecord): OrderSummary => ({
  id: getOrderId(order),
  status: toStatusLabel(order.status ?? order.state),
  createdAtLabel: getOrderDate(order),
  total: getOrderTotal(order),
  itemsCount: getOrderItemsCount(order),
  raw: order,
});

const getOrderItems = (order: OrderRecord): Array<Record<string, unknown>> => {
  if (Array.isArray(order.items)) {
    return order.items as Array<Record<string, unknown>>;
  }
  if (Array.isArray(order.order_items)) {
    return order.order_items as Array<Record<string, unknown>>;
  }
  if (Array.isArray(order.products)) {
    return order.products as Array<Record<string, unknown>>;
  }
  return [];
};

export function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const loadOrders = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = await getToken();
      if (!token) {
        setOrders([]);
        setError("Sesion no valida");
        return;
      }

      const response = await getOrdersService(token);
      setOrders(response.map(mapOrderSummary));
    } catch (err) {
      if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError("No se pudo cargar pedidos");
      }
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const pendingCount = useMemo(
    () =>
      orders.filter((order) =>
        /pendiente|proces|cread|prepar|en curso/i.test(order.status)
      ).length,
    [orders]
  );

  const openOrderDetail = async (order: OrderSummary) => {
    try {
      setDetailVisible(true);
      setDetailLoading(true);
      setDetailError(null);
      setSelectedOrder(order.raw);

      const token = await getToken();
      if (!token) {
        setDetailError("Sesion no valida");
        return;
      }

      const detail = await getOrderDetailService(order.id, token);
      setSelectedOrder(detail);
    } catch (err) {
      if (err instanceof Error && err.message.trim().length > 0) {
        setDetailError(err.message);
      } else {
        setDetailError("No se pudo cargar detalle del pedido");
      }
    } finally {
      setDetailLoading(false);
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
          <MaterialCommunityIcons name="chevron-left" size={34} color="#6F4E37" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mis Pedidos</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => loadOrders(true)}
          accessibilityLabel="Actualizar pedidos"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#6F4E37" />
          ) : (
            <MaterialCommunityIcons name="refresh" size={23} color="#6F4E37" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders.length}</Text>
          <Text style={styles.summaryLabel}>Pedidos</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{pendingCount}</Text>
          <Text style={styles.summaryLabel}>Pendientes</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#6F4E37" />
          <Text style={styles.stateText}>Cargando pedidos...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderCard}
              activeOpacity={0.86}
              onPress={() => openOrderDetail(item)}
            >
              <View style={styles.orderTopRow}>
                <Text style={styles.orderId}>{`Pedido #${item.id}`}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.orderDate}>{item.createdAtLabel}</Text>

              <View style={styles.orderBottomRow}>
                <Text style={styles.orderMeta}>{`${item.itemsCount} items`}</Text>
                <Text style={styles.orderTotal}>{formatMoney(item.total)}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.stateText}>Aun no tienes pedidos registrados</Text>
            </View>
          }
          ListFooterComponent={
            error ? <Text style={styles.errorText}>{error}</Text> : null
          }
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Home")}>
          <MaterialCommunityIcons name="home-outline" size={28} color="#919191" />
          <Text style={styles.bottomLabel}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate("Shipments")}
        >
          <MaterialCommunityIcons name="cube-outline" size={28} color="#919191" />
          <Text style={styles.bottomLabel}>Envios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem} activeOpacity={0.85}>
          <MaterialCommunityIcons name="clipboard-text" size={28} color="#25B5E7" />
          <Text style={[styles.bottomLabel, styles.bottomLabelActive]}>Pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Profile")}>
          <MaterialCommunityIcons name="account-outline" size={28} color="#919191" />
          <Text style={styles.bottomLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={detailVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del pedido</Text>
              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#6F4E37" />
              </TouchableOpacity>
            </View>

            {detailLoading ? (
              <View style={styles.centerStateCompact}>
                <ActivityIndicator color="#6F4E37" />
                <Text style={styles.stateText}>Cargando detalle...</Text>
              </View>
            ) : detailError ? (
              <Text style={styles.errorText}>{detailError}</Text>
            ) : selectedOrder ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.detailMain}>
                  {`Pedido #${getOrderId(selectedOrder)}`}
                </Text>
                <Text style={styles.detailSecondary}>
                  {`Estado: ${toStatusLabel(selectedOrder.status ?? selectedOrder.state)}`}
                </Text>
                <Text style={styles.detailSecondary}>
                  {`Fecha: ${getOrderDate(selectedOrder)}`}
                </Text>
                <Text style={styles.detailSecondary}>
                  {`Total: ${formatMoney(getOrderTotal(selectedOrder))}`}
                </Text>

                <Text style={styles.itemsTitle}>Productos</Text>
                {getOrderItems(selectedOrder).map((item, index) => {
                  const name =
                    String(item.product_name ?? item.name ?? item.product ?? "Producto");
                  const quantity = Math.max(1, Math.trunc(toNumber(item.quantity, 1)));
                  const price = toNumber(item.price ?? item.unit_price ?? item.product_price, 0);
                  return (
                    <View key={`${name}-${index}`} style={styles.detailItemRow}>
                      <Text style={styles.detailItemName}>{name}</Text>
                      <Text style={styles.detailItemMeta}>
                        {`x${quantity}  ${price > 0 ? formatMoney(price) : ""}`}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6DCCF",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E8DED4",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#6F4E37",
  },
  summaryLabel: {
    marginTop: 2,
    color: "#8D7A6B",
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 98,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6DCCF",
    padding: 13,
    marginBottom: 10,
  },
  orderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderId: {
    color: "#111111",
    fontWeight: "800",
    fontSize: 15,
  },
  statusBadge: {
    backgroundColor: "#F0E7DD",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusText: {
    color: "#7A5230",
    fontWeight: "700",
    fontSize: 11,
  },
  orderDate: {
    color: "#8d7a6b",
    marginTop: 6,
    fontSize: 12,
  },
  orderBottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderMeta: {
    color: "#7f7f86",
    fontSize: 12,
  },
  orderTotal: {
    color: "#6F4E37",
    fontSize: 16,
    fontWeight: "800",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerStateCompact: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  stateText: {
    marginTop: 8,
    color: "#7f7f86",
  },
  errorText: {
    marginTop: 10,
    color: "#b42318",
    textAlign: "center",
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
  bottomItem: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLabel: {
    marginTop: 2,
    color: "#8D7A6B",
    fontSize: 8,
    fontWeight: "500",
  },
  bottomLabelActive: {
    color: "#25B5E7",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "100%",
    maxHeight: "75%",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
  },
  detailMain: {
    color: "#111111",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 6,
  },
  detailSecondary: {
    color: "#6f6f76",
    marginBottom: 2,
    fontSize: 13,
  },
  itemsTitle: {
    marginTop: 10,
    marginBottom: 6,
    color: "#111111",
    fontWeight: "800",
    fontSize: 14,
  },
  detailItemRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE5DB",
  },
  detailItemName: {
    color: "#1b1b1f",
    fontSize: 13,
    fontWeight: "600",
  },
  detailItemMeta: {
    marginTop: 2,
    color: "#8D7A6B",
    fontSize: 12,
  },
});
