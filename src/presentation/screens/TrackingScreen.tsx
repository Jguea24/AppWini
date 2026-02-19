import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  autoAssignDriverService,
  getOrderTrackingService,
  type OrderTrackingResponse,
  type TrackingPoint,
} from "../../services/trackingService";

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isValidCoordinate = (latitude: number, longitude: number): boolean => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  // Evita tratar 0,0 como posicion real del repartidor cuando backend envia vacio/null.
  if (Math.abs(latitude) < 0.00001 && Math.abs(longitude) < 0.00001) {
    return false;
  }

  return true;
};

const toStatusLabel = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Sin estado";
  }
  const normalized = value.trim().toLowerCase().replace(/_/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const toNormalizedStatus = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase().replace(/_/g, " ");
};

const mapPoint = (point: TrackingPoint): { latitude: number; longitude: number } | null => {
  const latitude = toNullableNumber(point.latitude);
  const longitude = toNullableNumber(point.longitude);
  if (latitude === null || longitude === null) {
    return null;
  }

  if (!isValidCoordinate(latitude, longitude)) {
    return null;
  }

  return { latitude, longitude };
};

export function TrackingScreen({ navigation, route }: any) {
  const orderId = Number(route?.params?.orderId);
  const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const [autoAssignTried, setAutoAssignTried] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTracking = useCallback(async () => {
    try {
      setError(null);
      const data = await getOrderTrackingService(orderId, 100);
      setTracking(data);
    } catch (err) {
      if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError("No se pudo cargar ubicacion del envio");
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    setLoading(true);
    loadTracking();
    const intervalId = setInterval(() => {
      loadTracking();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [loadTracking]);

  const shipment = useMemo(
    () =>
      tracking?.shipment && typeof tracking.shipment === "object"
        ? tracking.shipment
        : null,
    [tracking]
  );

  const coordinates = useMemo(() => {
    if (!shipment || !Array.isArray(shipment.locations)) {
      return [] as Array<{ latitude: number; longitude: number }>;
    }

    return [...shipment.locations]
      .reverse()
      .map((point) => mapPoint(point))
      .filter(
        (point): point is { latitude: number; longitude: number } => point !== null
      );
  }, [shipment]);

  const currentLocation = useMemo(() => {
    const lat = toNullableNumber(shipment?.current_latitude);
    const lng = toNullableNumber(shipment?.current_longitude);
    if (lat !== null && lng !== null && isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }

    return coordinates.length > 0 ? coordinates[coordinates.length - 1] : null;
  }, [coordinates, shipment?.current_latitude, shipment?.current_longitude]);

  const normalizedStatus = toNormalizedStatus(shipment?.status);
  const hasDriver = Boolean(
    shipment?.driver && typeof shipment.driver === "object"
  );
  const isPendingAssignment =
    !hasDriver ||
    normalizedStatus.includes("pending") ||
    normalizedStatus.includes("assign");
  const shouldShowMap = Boolean(currentLocation) && hasDriver && !isPendingAssignment;

  const autoAssignDriver = useCallback(async () => {
    if (!Number.isFinite(orderId)) {
      return;
    }

    try {
      setAssigningDriver(true);
      setError(null);
      await autoAssignDriverService(orderId);
      await loadTracking();
    } catch (err) {
      if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError("No se pudo asignar repartidor automaticamente");
      }
    } finally {
      setAssigningDriver(false);
      setAutoAssignTried(true);
    }
  }, [loadTracking, orderId]);

  useEffect(() => {
    if (loading || assigningDriver || autoAssignTried) {
      return;
    }

    if (!hasDriver && isPendingAssignment) {
      const runAutoAssign = async () => {
        await autoAssignDriver();
      };

      runAutoAssign();
    }
  }, [
    assigningDriver,
    autoAssignDriver,
    autoAssignTried,
    hasDriver,
    isPendingAssignment,
    loading,
  ]);

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

        <Text style={styles.headerTitle}>{`Tracking #${Number.isFinite(orderId) ? orderId : "-"}`}</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={loadTracking}
          accessibilityLabel="Actualizar tracking"
        >
          <MaterialCommunityIcons name="refresh" size={22} color="#6F4E37" />
        </TouchableOpacity>
      </View>

      {loading && !shouldShowMap ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#6F4E37" />
          <Text style={styles.stateText}>Cargando mapa...</Text>
        </View>
      ) : !shouldShowMap ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={34} color="#8D7A6B" />
          <Text style={styles.stateText}>
            {assigningDriver
              ? "Asignando repartidor..."
              : isPendingAssignment
              ? "Aun no hay repartidor asignado para este envio"
              : "Sin ubicacion disponible por ahora"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setAutoAssignTried(false);
              loadTracking();
            }}
            disabled={assigningDriver}
            activeOpacity={0.85}
          >
            {assigningDriver ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <MaterialCommunityIcons name="refresh" size={16} color="#ffffff" />
            )}
            <Text style={styles.retryButtonText}>
              {assigningDriver ? "Asignando..." : "Reintentar"}
            </Text>
          </TouchableOpacity>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      ) : (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              ...currentLocation,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {coordinates.length > 1 && (
              <Polyline
                coordinates={coordinates}
                strokeWidth={4}
                strokeColor="#1DA1DC"
              />
            )}

            <Marker coordinate={currentLocation} title="Repartidor">
              <MaterialCommunityIcons name="bike-fast" size={26} color="#1DA1DC" />
            </Marker>
          </MapView>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Estado del envio</Text>
            <Text style={styles.infoStatus}>
              {toStatusLabel(shipment?.status)}
            </Text>
            <Text style={styles.infoMeta}>
              {toNullableNumber(shipment?.eta_minutes) !== null
                ? `ETA aprox: ${toNullableNumber(shipment?.eta_minutes)} min`
                : "ETA: por confirmar"}
            </Text>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </>
      )}
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
    fontSize: 20,
    fontWeight: "800",
    color: "#111111",
  },
  map: {
    flex: 1,
  },
  infoCard: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: "#E6DCCF",
    borderBottomWidth: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoTitle: {
    color: "#8D7A6B",
    fontSize: 12,
    fontWeight: "700",
  },
  infoStatus: {
    marginTop: 2,
    color: "#111111",
    fontSize: 18,
    fontWeight: "800",
  },
  infoMeta: {
    marginTop: 4,
    color: "#6F4E37",
    fontSize: 13,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  stateText: {
    marginTop: 8,
    color: "#8D7A6B",
    textAlign: "center",
  },
  errorText: {
    marginTop: 8,
    color: "#b42318",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6F4E37",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  retryButtonText: {
    marginLeft: 6,
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
});
