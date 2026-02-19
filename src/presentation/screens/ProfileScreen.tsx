import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  changePassword,
  createRoleRequest,
  getMe,
  MeResponse,
  updateMe,
} from "../../data/services/profileApi";
import { useThemeMode } from "../../shared/theme/ThemeContext";

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
  address: string;
};

type PasswordForm = {
  current_password: string;
  new_password: string;
  new_password2: string;
};

type RoleForm = {
  requested_role: "provider" | "driver";
  reason: string;
};

type MenuRowProps = {
  icon: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
  darkMode?: boolean;
};

const createInitialProfileForm = (profile?: MeResponse | null): ProfileForm => ({
  full_name: String(profile?.full_name ?? ""),
  email: String(profile?.email ?? ""),
  phone: String(profile?.phone ?? ""),
  address: String(profile?.address ?? ""),
});

const normalizeRoleCode = (value: unknown): string => {
  if (typeof value !== "string") {
    return "client";
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return "client";
  }

  if (normalized === "user") {
    return "client";
  }

  return normalized;
};

const formatRoleLabel = (roleCode: string): string => {
  const normalized = normalizeRoleCode(roleCode);
  if (normalized === "admin") {
    return "Administrador";
  }
  if (normalized === "provider") {
    return "Proveedor";
  }
  if (normalized === "driver") {
    return "Repartidor";
  }
  if (normalized === "client") {
    return "Cliente";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

function MenuRow({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  right,
  darkMode = false,
}: MenuRowProps) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, darkMode && styles.menuRowDark]}
      onPress={onPress}
      activeOpacity={onPress ? 0.82 : 1}
      disabled={!onPress}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={21} color="#ffffff" />
      </View>

      <View style={styles.menuTextWrap}>
        <Text style={[styles.menuTitle, darkMode && styles.menuTitleDark]}>{title}</Text>
        {!!subtitle && (
          <Text style={[styles.menuSubtitle, darkMode && styles.menuSubtitleDark]}>
            {subtitle}
          </Text>
        )}
      </View>

      {right ??
        (onPress ? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={26}
            color={darkMode ? "#6e6e76" : "#c8c8ce"}
          />
        ) : null)}
    </TouchableOpacity>
  );
}

export function ProfileScreen({ navigation }: any) {
  const { isDarkMode, setDarkMode } = useThemeMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingRoleRequest, setSendingRoleRequest] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileForm>(createInitialProfileForm());
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: "",
    new_password: "",
    new_password2: "",
  });
  const [roleForm, setRoleForm] = useState<RoleForm>({
    requested_role: "provider",
    reason: "",
  });

  const displayName = useMemo(() => {
    const fullName = String(profile?.full_name ?? "").trim();
    if (fullName) {
      return fullName;
    }
    return "Usuario Wini";
  }, [profile?.full_name]);

  const displayEmail = useMemo(() => {
    const email = String(profile?.email ?? "").trim();
    if (email) {
      return email;
    }
    return "Sin correo registrado";
  }, [profile?.email]);

  const currentRoleCode = useMemo(
    () => normalizeRoleCode(profile?.role),
    [profile?.role]
  );

  const currentRoleLabel = useMemo(
    () => formatRoleLabel(currentRoleCode),
    [currentRoleCode]
  );

  const rolesList = useMemo(() => {
    const items = Array.isArray(profile?.roles) ? profile.roles : [];
    const normalized = items
      .map((role) => normalizeRoleCode(role))
      .filter((role) => role.trim().length > 0);

    if (!normalized.length) {
      return [currentRoleCode];
    }

    return [...new Set(normalized)];
  }, [currentRoleCode, profile?.roles]);

  const rolesLabel = useMemo(() => {
    return rolesList.map((role) => formatRoleLabel(role)).join(", ");
  }, [rolesList]);

  const pendingRoleRequest = useMemo(() => {
    const rawPending = profile?.pending_role_request;
    if (!rawPending || typeof rawPending !== "object") {
      return null;
    }

    return rawPending as Record<string, unknown>;
  }, [profile?.pending_role_request]);

  const pendingRoleSubtitle = useMemo(() => {
    if (!pendingRoleRequest) {
      return "Solicita ser proveedor o repartidor";
    }

    const requestedRole = formatRoleLabel(
      normalizeRoleCode(pendingRoleRequest.requested_role)
    );
    const statusRaw =
      typeof pendingRoleRequest.status === "string"
        ? pendingRoleRequest.status.trim().toLowerCase()
        : "pending";
    const statusLabel =
      statusRaw === "approved"
        ? "aprobada"
        : statusRaw === "rejected"
        ? "rechazada"
        : "pendiente";
    return `Solicitud ${statusLabel}: ${requestedRole}`;
  }, [pendingRoleRequest]);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const me = await getMe();
      setProfile(me);
    } catch (err) {
      if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError("No se pudo cargar el perfil");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfileData();
    }, [loadProfileData])
  );

  const openProfileModal = () => {
    setProfileForm(createInitialProfileForm(profile));
    setProfileModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (savingProfile) {
      return;
    }

    try {
      setSavingProfile(true);
      const payload = {
        full_name: profileForm.full_name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
      };

      const updated = await updateMe(payload);
      setProfile(updated);
      setProfileModalVisible(false);
      Alert.alert("Perfil", "Datos actualizados correctamente");
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : "No se pudo actualizar el perfil";
      Alert.alert("Perfil", message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (changingPassword) {
      return;
    }

    if (
      !passwordForm.current_password.trim() ||
      !passwordForm.new_password.trim() ||
      !passwordForm.new_password2.trim()
    ) {
      Alert.alert("Contrasena", "Completa todos los campos");
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password2) {
      Alert.alert("Contrasena", "La nueva contrasena no coincide");
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(passwordForm);
      setPasswordModalVisible(false);
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password2: "",
      });
      Alert.alert("Contrasena", "Clave actualizada correctamente");
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : "No se pudo cambiar la contrasena";
      Alert.alert("Contrasena", message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCreateRoleRequest = async () => {
    if (sendingRoleRequest) {
      return;
    }

    if (pendingRoleRequest) {
      Alert.alert("Solicitud", "Ya tienes una solicitud de rol en proceso");
      return;
    }

    if (!roleForm.reason.trim()) {
      Alert.alert("Solicitud", "Ingresa el motivo de la solicitud");
      return;
    }

    try {
      setSendingRoleRequest(true);
      await createRoleRequest({
        requested_role: roleForm.requested_role,
        reason: roleForm.reason.trim(),
      });

      const me = await getMe();
      setProfile(me);
      setRoleModalVisible(false);
      setRoleForm({ requested_role: "provider", reason: "" });
      Alert.alert("Solicitud", "Solicitud enviada correctamente");
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : "No se pudo enviar la solicitud";
      Alert.alert("Solicitud", message);
    } finally {
      setSendingRoleRequest(false);
    }
  };

  const handleDarkModeChange = (value: boolean) => {
    setDarkMode(value).catch(() => {
      Alert.alert("Tema", "No se pudo guardar el modo oscuro");
    });
  };

  return (
    <View style={[styles.screen, isDarkMode && styles.screenDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>Mi Perfil</Text>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#6F4E37" />
          <Text style={styles.stateText}>Cargando perfil...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            isDarkMode && styles.contentDark,
          ]}
        >
          <View style={[styles.userCard, isDarkMode && styles.userCardDark]}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <MaterialCommunityIcons name="account" size={40} color="#9aa5b1" />
              </View>
            </View>
            <View style={styles.userTextWrap}>
              <Text style={[styles.userName, isDarkMode && styles.userNameDark]}>
                {displayName}
              </Text>
              <Text style={[styles.userEmail, isDarkMode && styles.userEmailDark]}>
                {displayEmail}
              </Text>
              <Text style={[styles.userRoleText, isDarkMode && styles.userRoleTextDark]}>
                {`Rol: ${currentRoleLabel}`}
              </Text>
              <Text style={[styles.userRolesText, isDarkMode && styles.userRolesTextDark]}>
                {`Roles: ${rolesLabel}`}
              </Text>
            </View>
          </View>

          {!!pendingRoleRequest && (
            <View style={[styles.pendingRoleCard, isDarkMode && styles.pendingRoleCardDark]}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#7A5230" />
              <Text style={[styles.pendingRoleText, isDarkMode && styles.pendingRoleTextDark]}>
                {pendingRoleSubtitle}
              </Text>
            </View>
          )}

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={[styles.sectionLabel, isDarkMode && styles.sectionLabelDark]}>CUENTA</Text>
          <View style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}>
            <MenuRow
              icon="account"
              iconBg="#54C0F1"
              title="Informacion del perfil"
              onPress={openProfileModal}
              darkMode={isDarkMode}
            />
            <View style={[styles.rowDivider, isDarkMode && styles.rowDividerDark]} />
            <MenuRow
              icon="map-marker"
              iconBg="#34C759"
              title="Mis direcciones"
              onPress={() => navigation.navigate("NewAddress")}
              darkMode={isDarkMode}
            />
          </View>

          <Text style={[styles.sectionLabel, isDarkMode && styles.sectionLabelDark]}>
            PREFERENCIAS
          </Text>
          <View style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}>
            <MenuRow
              icon="bell"
              iconBg="#FF3B30"
              title="Notificaciones"
              onPress={() =>
                Alert.alert("Notificaciones", "Configura notificaciones en tu dispositivo")
              }
              darkMode={isDarkMode}
            />
            <View style={[styles.rowDivider, isDarkMode && styles.rowDividerDark]} />
            <MenuRow
              icon="earth"
              iconBg="#0A84FF"
              title="Idioma"
              onPress={() => Alert.alert("Idioma", "Espanol")}
              darkMode={isDarkMode}
            />
            <View style={[styles.rowDivider, isDarkMode && styles.rowDividerDark]} />
            <MenuRow
              icon="weather-sunny"
              iconBg="#FFD60A"
              title="Modo oscuro"
              right={
                <Switch
                  value={isDarkMode}
                  onValueChange={handleDarkModeChange}
                  trackColor={{ false: "#dddddf", true: "#c6a88e" }}
                  thumbColor={isDarkMode ? "#6F4E37" : "#ffffff"}
                />
              }
              darkMode={isDarkMode}
            />
          </View>

          <Text style={[styles.sectionLabel, isDarkMode && styles.sectionLabelDark]}>
            RIFAS Y PROMOCIONES
          </Text>
          <View style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}>
            <MenuRow
              icon="ticket-confirmation"
              iconBg="#FF9F0A"
              title="Rifas activas"
              onPress={() => Alert.alert("Rifas", "No hay rifas activas por ahora")}
              darkMode={isDarkMode}
            />
          </View>

          <Text style={[styles.sectionLabel, isDarkMode && styles.sectionLabelDark]}>
            SOLICITUDES
          </Text>
          <View style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}>
            <MenuRow
              icon="swap-horizontal"
              iconBg="#AF52DE"
              title="Solicitar cambio de rol"
              subtitle={pendingRoleSubtitle}
              onPress={() => {
                if (pendingRoleRequest) {
                  Alert.alert("Solicitud", "Ya tienes una solicitud de rol en proceso");
                  return;
                }
                setRoleModalVisible(true);
              }}
              darkMode={isDarkMode}
            />
          </View>

          <Text style={[styles.sectionLabel, isDarkMode && styles.sectionLabelDark]}>
            SEGURIDAD
          </Text>
          <View style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}>
            <MenuRow
              icon="lock"
              iconBg="#5AC8FA"
              title="Cambiar contrasena"
              subtitle="Actualiza tu clave de acceso"
              onPress={() => setPasswordModalVisible(true)}
              darkMode={isDarkMode}
            />
          </View>

          <Text style={[styles.sectionLabel, isDarkMode && styles.sectionLabelDark]}>SOPORTE</Text>
          <View style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}>
            <MenuRow
              icon="help-circle"
              iconBg="#5856D6"
              title="Ayuda y soporte"
              onPress={() => Alert.alert("Soporte", "Contacta a soporte de Wini")}
              darkMode={isDarkMode}
            />
            <View style={[styles.rowDivider, isDarkMode && styles.rowDividerDark]} />
            <MenuRow
              icon="file-document"
              iconBg="#8E8E93"
              title="Terminos y condiciones"
              onPress={() => Alert.alert("Legal", "Proximamente")}
              darkMode={isDarkMode}
            />
            <View style={[styles.rowDivider, isDarkMode && styles.rowDividerDark]} />
            <MenuRow
              icon="shield-lock"
              iconBg="#0A84FF"
              title="Politica de privacidad"
              onPress={() => Alert.alert("Legal", "Proximamente")}
              darkMode={isDarkMode}
            />
          </View>
        </ScrollView>
      )}

      <View style={[styles.bottomNav, isDarkMode && styles.bottomNavDark]}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Home")}>
          <MaterialCommunityIcons
            name="home-outline"
            size={28}
            color={isDarkMode ? "#7f7f86" : "#919191"}
          />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate("Shipments")}
        >
          <MaterialCommunityIcons
            name="cube-outline"
            size={28}
            color={isDarkMode ? "#7f7f86" : "#919191"}
          />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>
            Envios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate("Orders")}
        >
          <MaterialCommunityIcons
            name="shopping-outline"
            size={28}
            color={isDarkMode ? "#7f7f86" : "#919191"}
          />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>
            Pedidos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem} activeOpacity={0.85}>
          <MaterialCommunityIcons
            name="account"
            size={28}
            color={isDarkMode ? "#C19A6B" : "#25B5E7"}
          />
          <Text
            style={[
              styles.bottomLabel,
              styles.bottomLabelActive,
              isDarkMode && styles.bottomLabelActiveDark,
            ]}
          >
            Perfil
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar perfil</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre completo"
              value={profileForm.full_name}
              onChangeText={(value) =>
                setProfileForm((current) => ({ ...current, full_name: value }))
              }
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Correo"
              value={profileForm.email}
              onChangeText={(value) =>
                setProfileForm((current) => ({ ...current, email: value }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Telefono"
              value={profileForm.phone}
              onChangeText={(value) =>
                setProfileForm((current) => ({ ...current, phone: value }))
              }
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Direccion"
              value={profileForm.address}
              onChangeText={(value) =>
                setProfileForm((current) => ({ ...current, address: value }))
              }
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalGhostButton}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.modalGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleSaveProfile}>
                {savingProfile ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalPrimaryText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cambiar contrasena</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Clave actual"
              value={passwordForm.current_password}
              onChangeText={(value) =>
                setPasswordForm((current) => ({ ...current, current_password: value }))
              }
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Nueva clave"
              value={passwordForm.new_password}
              onChangeText={(value) =>
                setPasswordForm((current) => ({ ...current, new_password: value }))
              }
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Repite nueva clave"
              value={passwordForm.new_password2}
              onChangeText={(value) =>
                setPasswordForm((current) => ({ ...current, new_password2: value }))
              }
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalGhostButton}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.modalGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleChangePassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalPrimaryText}>Actualizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Solicitar cambio de rol</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleSelectorButton,
                  roleForm.requested_role === "provider" && styles.roleSelectorButtonActive,
                ]}
                onPress={() =>
                  setRoleForm((current) => ({ ...current, requested_role: "provider" }))
                }
              >
                <Text
                  style={[
                    styles.roleSelectorText,
                    roleForm.requested_role === "provider" && styles.roleSelectorTextActive,
                  ]}
                >
                  Proveedor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleSelectorButton,
                  roleForm.requested_role === "driver" && styles.roleSelectorButtonActive,
                ]}
                onPress={() =>
                  setRoleForm((current) => ({ ...current, requested_role: "driver" }))
                }
              >
                <Text
                  style={[
                    styles.roleSelectorText,
                    roleForm.requested_role === "driver" && styles.roleSelectorTextActive,
                  ]}
                >
                  Repartidor
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, styles.modalInputMultiline]}
              placeholder="Motivo de la solicitud"
              value={roleForm.reason}
              onChangeText={(value) => setRoleForm((current) => ({ ...current, reason: value }))}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalGhostButton}
                onPress={() => setRoleModalVisible(false)}
              >
                <Text style={styles.modalGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleCreateRoleRequest}
              >
                {sendingRoleRequest ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalPrimaryText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ECEBF0",
  },
  screenDark: {
    backgroundColor: "#121214",
  },
  header: {
    height: 96,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
    backgroundColor: "#ECEBF0",
  },
  headerDark: {
    backgroundColor: "#121214",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#141414",
  },
  headerTitleDark: {
    color: "#F2F2F4",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stateText: {
    marginTop: 10,
    color: "#6f6f76",
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentDark: {
    backgroundColor: "#121214",
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  userCardDark: {
    backgroundColor: "#1A1A1E",
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: "#2EB7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: "#d6d6dc",
    backgroundColor: "#f5f5f7",
    alignItems: "center",
    justifyContent: "center",
  },
  userTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 24 / 1.2,
    fontWeight: "800",
    color: "#111111",
  },
  userNameDark: {
    color: "#F2F2F4",
  },
  userEmail: {
    marginTop: 4,
    fontSize: 16 / 1.1,
    color: "#8a8a91",
  },
  userEmailDark: {
    color: "#B6B6BC",
  },
  userRoleText: {
    marginTop: 6,
    fontSize: 13,
    color: "#6F4E37",
    fontWeight: "700",
  },
  userRoleTextDark: {
    color: "#D7B48A",
  },
  userRolesText: {
    marginTop: 2,
    fontSize: 12,
    color: "#8a8a90",
  },
  userRolesTextDark: {
    color: "#AAAAAF",
  },
  pendingRoleCard: {
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9CB",
    backgroundColor: "#F9F2EA",
    flexDirection: "row",
    alignItems: "center",
  },
  pendingRoleCardDark: {
    borderColor: "#46382A",
    backgroundColor: "#2A211A",
  },
  pendingRoleText: {
    marginLeft: 8,
    color: "#7A5230",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  pendingRoleTextDark: {
    color: "#E1C29F",
  },
  errorText: {
    marginBottom: 12,
    color: "#b42318",
    textAlign: "center",
  },
  sectionLabel: {
    color: "#7f7f87",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    marginLeft: 2,
  },
  sectionLabelDark: {
    color: "#A0A0A8",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
  },
  sectionCardDark: {
    backgroundColor: "#1A1A1E",
  },
  menuRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuRowDark: {
    backgroundColor: "#1A1A1E",
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    color: "#111111",
    fontSize: 18 / 1.1,
    fontWeight: "700",
  },
  menuTitleDark: {
    color: "#F2F2F4",
  },
  menuSubtitle: {
    marginTop: 2,
    color: "#8a8a90",
    fontSize: 15 / 1.1,
  },
  menuSubtitleDark: {
    color: "#A0A0A8",
  },
  rowDivider: {
    marginLeft: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#ececf1",
  },
  rowDividerDark: {
    borderBottomColor: "#2A2A30",
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
    borderTopColor: "#2A2A30",
    backgroundColor: "#1A1A1E",
  },
  bottomItem: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLabel: {
    marginTop: 2,
    color: "#8d7a6b",
    fontSize: 16 / 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  modalTitle: {
    fontSize: 20 / 1.15,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 12,
  },
  modalInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d7d7de",
    backgroundColor: "#fafafd",
    paddingHorizontal: 12,
    marginBottom: 10,
    color: "#111111",
  },
  modalInputMultiline: {
    height: 90,
    paddingTop: 10,
  },
  modalActions: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalGhostButton: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#efeff4",
  },
  modalGhostText: {
    color: "#6f6f75",
    fontWeight: "700",
  },
  modalPrimaryButton: {
    height: 44,
    minWidth: 100,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7A5230",
  },
  modalPrimaryText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  roleSelector: {
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0d6ce",
  },
  roleSelectorButton: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f3ee",
  },
  roleSelectorButtonActive: {
    backgroundColor: "#6F4E37",
  },
  roleSelectorText: {
    color: "#6F4E37",
    fontWeight: "700",
  },
  roleSelectorTextActive: {
    color: "#ffffff",
  },
});


