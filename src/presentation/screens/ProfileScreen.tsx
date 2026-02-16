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
  getRoleRequests,
  MeResponse,
  updateMe,
} from "../../services/profileApi";

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
};

const createInitialProfileForm = (profile?: MeResponse | null): ProfileForm => ({
  full_name: String(profile?.full_name ?? ""),
  email: String(profile?.email ?? ""),
  phone: String(profile?.phone ?? ""),
  address: String(profile?.address ?? ""),
});

function MenuRow({ icon, iconBg, title, subtitle, onPress, right }: MenuRowProps) {
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.82 : 1}
      disabled={!onPress}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={21} color="#ffffff" />
      </View>

      <View style={styles.menuTextWrap}>
        <Text style={styles.menuTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>

      {right ?? <MaterialCommunityIcons name="chevron-right" size={26} color="#c8c8ce" />}
    </TouchableOpacity>
  );
}

export function ProfileScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [roleRequestsCount, setRoleRequestsCount] = useState(0);

  const [darkMode, setDarkMode] = useState(false);

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

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [meResult, rolesResult] = await Promise.allSettled([
        getMe(),
        getRoleRequests(),
      ]);

      if (meResult.status === "fulfilled") {
        setProfile(meResult.value);
      } else {
        throw meResult.reason;
      }

      if (rolesResult.status === "fulfilled") {
        setRoleRequestsCount(rolesResult.value.length);
      } else {
        setRoleRequestsCount(0);
      }
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

      const updatedRequests = await getRoleRequests();
      setRoleRequestsCount(updatedRequests.length);
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

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#6F4E37" />
          <Text style={styles.stateText}>Cargando perfil...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.userCard}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <MaterialCommunityIcons name="account" size={40} color="#9aa5b1" />
              </View>
            </View>
            <View style={styles.userTextWrap}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>
            </View>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.sectionLabel}>CUENTA</Text>
          <View style={styles.sectionCard}>
            <MenuRow
              icon="account"
              iconBg="#54C0F1"
              title="Informacion del perfil"
              onPress={openProfileModal}
            />
            <View style={styles.rowDivider} />
            <MenuRow
              icon="map-marker"
              iconBg="#34C759"
              title="Mis direcciones"
              onPress={() => navigation.navigate("NewAddress")}
            />
          </View>

          <Text style={styles.sectionLabel}>PREFERENCIAS</Text>
          <View style={styles.sectionCard}>
            <MenuRow
              icon="bell"
              iconBg="#FF3B30"
              title="Notificaciones"
              onPress={() =>
                Alert.alert("Notificaciones", "Configura notificaciones en tu dispositivo")
              }
            />
            <View style={styles.rowDivider} />
            <MenuRow
              icon="earth"
              iconBg="#0A84FF"
              title="Idioma"
              onPress={() => Alert.alert("Idioma", "Espanol")}
            />
            <View style={styles.rowDivider} />
            <MenuRow
              icon="weather-sunny"
              iconBg="#FFD60A"
              title="Modo oscuro"
              right={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: "#dddddf", true: "#c6a88e" }}
                  thumbColor={darkMode ? "#6F4E37" : "#ffffff"}
                />
              }
            />
          </View>

          <Text style={styles.sectionLabel}>RIFAS Y PROMOCIONES</Text>
          <View style={styles.sectionCard}>
            <MenuRow
              icon="ticket-confirmation"
              iconBg="#FF9F0A"
              title="Rifas activas"
              onPress={() => Alert.alert("Rifas", "No hay rifas activas por ahora")}
            />
          </View>

          <Text style={styles.sectionLabel}>SOLICITUDES</Text>
          <View style={styles.sectionCard}>
            <MenuRow
              icon="swap-horizontal"
              iconBg="#AF52DE"
              title="Solicitar cambio de rol"
              subtitle={
                roleRequestsCount > 0
                  ? `${roleRequestsCount} solicitud(es) registrada(s)`
                  : "Solicita ser proveedor o repartidor"
              }
              onPress={() => setRoleModalVisible(true)}
            />
          </View>

          <Text style={styles.sectionLabel}>SEGURIDAD</Text>
          <View style={styles.sectionCard}>
            <MenuRow
              icon="lock"
              iconBg="#5AC8FA"
              title="Cambiar contrasena"
              subtitle="Actualiza tu clave de acceso"
              onPress={() => setPasswordModalVisible(true)}
            />
          </View>

          <Text style={styles.sectionLabel}>SOPORTE</Text>
          <View style={styles.sectionCard}>
            <MenuRow
              icon="help-circle"
              iconBg="#5856D6"
              title="Ayuda y soporte"
              onPress={() => Alert.alert("Soporte", "Contacta a soporte de Wini")}
            />
            <View style={styles.rowDivider} />
            <MenuRow
              icon="file-document"
              iconBg="#8E8E93"
              title="Terminos y condiciones"
              onPress={() => Alert.alert("Legal", "Proximamente")}
            />
            <View style={styles.rowDivider} />
            <MenuRow
              icon="shield-lock"
              iconBg="#0A84FF"
              title="Politica de privacidad"
              onPress={() => Alert.alert("Legal", "Proximamente")}
            />
          </View>
        </ScrollView>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Home")}>
          <MaterialCommunityIcons name="home-outline" size={28} color="#919191" />
          <Text style={styles.bottomLabel}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem}>
          <MaterialCommunityIcons name="cube-outline" size={28} color="#919191" />
          <Text style={styles.bottomLabel}>Envios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem}>
          <MaterialCommunityIcons name="shopping-outline" size={28} color="#919191" />
          <Text style={styles.bottomLabel}>Pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem} activeOpacity={0.85}>
          <MaterialCommunityIcons name="account" size={28} color="#25B5E7" />
          <Text style={[styles.bottomLabel, styles.bottomLabelActive]}>Perfil</Text>
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
  header: {
    height: 96,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
    backgroundColor: "#ECEBF0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#141414",
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
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  userEmail: {
    marginTop: 4,
    fontSize: 16 / 1.1,
    color: "#8a8a91",
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
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
  },
  menuRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
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
  menuSubtitle: {
    marginTop: 2,
    color: "#8a8a90",
    fontSize: 15 / 1.1,
  },
  rowDivider: {
    marginLeft: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#ececf1",
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
    color: "#8d7a6b",
    fontSize: 16 / 2,
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
