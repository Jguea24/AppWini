import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getOrdersService, type OrderRecord } from "../../data/services/orderService";
import { getToken } from "../../shared/storage/authStorage";
import { useThemeMode } from "../../shared/theme/ThemeContext";

type ShipmentOrder = {
  id: number;
  status: string;
  dateLabel: string;
  etaMinutes: number | null;
  total: number;
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

const getOrderId = (order: OrderRecord): number | null => {
  const raw = order.id ?? order.order_id ?? order.number;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const getOrderDate = (order: OrderRecord): string => {
  const raw =
    order.created_at ?? order.createdAt ?? order.order_date ?? order.date;
  if (typeof raw === "string" && raw.trim().length > 0) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString("es-EC", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return raw;
  }
  return "Sin fecha";
};

const toShipmentOrder = (order: OrderRecord): ShipmentOrder | null => {
  const id = getOrderId(order);
  if (id === null) {
    return null;
  }

  const etaValue =
    order.eta_minutes ??
    (typeof order.shipment === "object" && order.shipment
      ? (order.shipment as Record<string, unknown>).eta_minutes
      : null);
  const eta = Number.isFinite(Number(etaValue)) ? Number(etaValue) : null;

  return {
    id,
    status: toStatusLabel(order.status ?? order.state),
    dateLabel: getOrderDate(order),
    etaMinutes: eta,
    total: toNumber(order.total ?? order.total_amount ?? order.amount, 0),
  };
};

export function ShipmentsScreen({ navigation }: any) {
  const { isDarkMode } = useThemeMode();
  const [orders, setOrders] = useState<ShipmentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCount = useMemo(
    () =>
      orders.filter((order) =>
        /assigned|picked|way|near|pend|proces|prepar|curso/i.test(order.status)
      ).length,
    [orders]
  );

  const loadShipments = useCallback(async (silent = false) => {
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

      const data = await getOrdersService(token);
      const mapped = data
        .map(toShipmentOrder)
        .filter((item): item is ShipmentOrder => item !== null)
        .sort((a, b) => b.id - a.id);
      setOrders(mapped);
    } catch (err) {
      if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError("No se pudo cargar envios");
      }
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadShipments();
    }, [loadShipments])
  );

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
          <MaterialCommunityIcons name="chevron-left" size={34} color={primaryIcon} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>Envios</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => loadShipments(true)}
          accessibilityLabel="Actualizar envios"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={primaryIcon} />
          ) : (
            <MaterialCommunityIcons name="refresh" size={22} color={primaryIcon} />
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, isDarkMode && styles.summaryValueDark]}>
            {orders.length}
          </Text>
          <Text style={[styles.summaryLabel, isDarkMode && styles.summaryLabelDark]}>Total</Text>
        </View>
        <View style={[styles.summaryDivider, isDarkMode && styles.summaryDividerDark]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, isDarkMode && styles.summaryValueDark]}>
            {activeCount}
          </Text>
          <Text style={[styles.summaryLabel, isDarkMode && styles.summaryLabelDark]}>
            En ruta
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={primaryIcon} />
          <Text style={[styles.stateText, isDarkMode && styles.stateTextDark]}>
            Cargando envios...
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.orderCard, isDarkMode && styles.orderCardDark]}
              activeOpacity={0.86}
              onPress={() =>
                navigation.navigate("Tracking", {
                  orderId: item.id,
                })
              }
            >
              <View style={styles.orderTopRow}>
                <Text style={[styles.orderId, isDarkMode && styles.orderIdDark]}>{`Orden #${item.id}`}</Text>
                <Text style={[styles.orderStatus, isDarkMode && styles.orderStatusDark]}>
                  {item.status}
                </Text>
              </View>

              <Text style={[styles.orderMeta, isDarkMode && styles.orderMetaDark]}>
                {`Fecha: ${item.dateLabel}`}
              </Text>
              <Text style={[styles.orderMeta, isDarkMode && styles.orderMetaDark]}>
                {item.etaMinutes !== null
                  ? `ETA aprox: ${item.etaMinutes} min`
                  : "ETA: por confirmar"}
              </Text>

              <View style={styles.orderBottomRow}>
                <Text style={[styles.orderTotal, isDarkMode && styles.orderTotalDark]}>
                  {formatMoney(item.total)}
                </Text>
                <View style={styles.trackButton}>
                  <MaterialCommunityIcons
                    name="map-marker-path"
                    size={14}
                    color="#ffffff"
                  />
                  <Text style={styles.trackButtonText}>Ver mapa</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={[styles.stateText, isDarkMode && styles.stateTextDark]}>
                No hay envios para mostrar
              </Text>
            </View>
          }
          ListFooterComponent={error ? <Text style={styles.errorText}>{error}</Text> : null}
        />
      )}

      <View style={[styles.bottomNav, isDarkMode && styles.bottomNavDark]}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Home")}>
          <MaterialCommunityIcons name="home-outline" size={28} color={secondaryIcon} />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem} activeOpacity={0.85}>
          <MaterialCommunityIcons
            name="truck-delivery"
            size={28}
            color={isDarkMode ? "#D7B48A" : "#25B5E7"}
          />
          <Text
            style={[
              styles.bottomLabel,
              styles.bottomLabelActive,
              isDarkMode && styles.bottomLabelDark,
              isDarkMode && styles.bottomLabelActiveDark,
            ]}
          >
            Envios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate("Orders")}
        >
          <MaterialCommunityIcons name="shopping-outline" size={28} color={secondaryIcon} />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>Pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate("Profile")}
        >
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
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
  },
  headerTitleDark: {
    color: "#F2F2F4",
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6DCCF",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  summaryCardDark: {
    borderColor: "#2E2E33",
    backgroundColor: "#1A1A1E",
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
  summaryDividerDark: {
    backgroundColor: "#34343B",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#6F4E37",
  },
  summaryValueDark: {
    color: "#D7B48A",
  },
  summaryLabel: {
    marginTop: 2,
    color: "#8D7A6B",
    fontSize: 12,
    fontWeight: "700",
  },
  summaryLabelDark: {
    color: "#A0A0A8",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6DCCF",
    padding: 13,
    marginBottom: 10,
  },
  orderCardDark: {
    backgroundColor: "#1A1A1E",
    borderColor: "#2E2E33",
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
  orderIdDark: {
    color: "#F2F2F4",
  },
  orderStatus: {
    color: "#7A5230",
    fontWeight: "700",
    fontSize: 12,
  },
  orderStatusDark: {
    color: "#E1C29F",
  },
  orderMeta: {
    marginTop: 6,
    color: "#8D7A6B",
    fontSize: 12,
  },
  orderMetaDark: {
    color: "#A0A0A8",
  },
  orderBottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderTotal: {
    color: "#6F4E37",
    fontSize: 16,
    fontWeight: "800",
  },
  orderTotalDark: {
    color: "#D7B48A",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6F4E37",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trackButtonText: {
    marginLeft: 6,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stateText: {
    marginTop: 8,
    color: "#8D7A6B",
  },
  stateTextDark: {
    color: "#A0A0A8",
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
    fontSize: 8,
    fontWeight: "500",
  },
  bottomLabelDark: {
    color: "#A0A0A8",
  },
  bottomLabelActive: {
    color: "#25B5E7",
    fontWeight: "700",
  },
  bottomLabelActiveDark: {
    color: "#D7B48A",
  },
});


