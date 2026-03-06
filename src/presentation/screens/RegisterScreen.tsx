import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuthViewModel } from "../viewmodel/AuthViewModel";
import { registerStyles as styles } from "../styles/register.styles";
import { useThemeMode } from "../../shared/theme/ThemeContext";

export function RegisterScreen({ navigation }: any) {
  const { isDarkMode } = useThemeMode();
  const { register, loading, error } = useAuthViewModel();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const emailRegex = /\S+@\S+\.\S+/;
  const phoneRegex = /^[0-9]{10}$/;
  const passwordsMatch = password === confirmPassword;

  const handleRegister = async () => {
    setLocalError(null);

    if (!emailRegex.test(email)) {
      setLocalError("Correo invalido");
      return;
    }

    if (!phoneRegex.test(phone)) {
      setLocalError("Telefono debe tener 10 digitos");
      return;
    }

    if (!passwordsMatch) {
      setLocalError("Las contrasenas no coinciden");
      return;
    }

    if (!address.trim()) {
      setLocalError("Direccion requerida");
      return;
    }

    const success = await register(
      fullName.trim(),
      email.trim(),
      password,
      phone.trim(),
      address.trim()
    );

    if (success) {
      Alert.alert("Registro exitoso", "Tu cuenta fue creada correctamente.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    }
  };

  const isValid = fullName && email && phone && address && password && confirmPassword;
  const darkFieldStyle = isDarkMode
    ? { backgroundColor: "#232329", borderColor: "#34343B" }
    : null;
  const darkText = isDarkMode ? { color: "#F2F2F4" } : null;

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardContainer, isDarkMode && { backgroundColor: "#121214" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.scroll, isDarkMode && { backgroundColor: "#121214" }]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require("../../shared/assets/logo.png")}
            style={styles.logo}
          />

          <Text style={[styles.title, isDarkMode && { color: "#F2F2F4" }]}>Crear cuenta</Text>
          <Text style={[styles.subtitle, isDarkMode && { color: "#B6B6BC" }]}>
            Registrate y disfruta del chocolate artesanal amazonico
          </Text>
        </View>

        <View style={[styles.card, isDarkMode && { backgroundColor: "#1A1A1E" }]}>
          <View style={[styles.inputWrapper, darkFieldStyle]}>
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color={isDarkMode ? "#A0A0A8" : "#6b7280"}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.inputWithIcon, darkText]}
              placeholder="Nombre completo"
              placeholderTextColor={isDarkMode ? "#8F8E96" : "#9ca3af"}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={[styles.inputWrapper, darkFieldStyle]}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={isDarkMode ? "#A0A0A8" : "#6b7280"}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.inputWithIcon, darkText]}
              placeholder="Correo electronico"
              placeholderTextColor={isDarkMode ? "#8F8E96" : "#9ca3af"}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={[styles.inputWrapper, darkFieldStyle]}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={20}
              color={isDarkMode ? "#A0A0A8" : "#6b7280"}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.inputWithIcon, darkText]}
              placeholder="Telefono"
              placeholderTextColor={isDarkMode ? "#8F8E96" : "#9ca3af"}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={[styles.inputWrapper, darkFieldStyle]}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={20}
              color={isDarkMode ? "#A0A0A8" : "#6b7280"}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.inputWithIcon, darkText]}
              placeholder="Direccion"
              placeholderTextColor={isDarkMode ? "#8F8E96" : "#9ca3af"}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={[styles.inputWrapper, darkFieldStyle]}>
            <TextInput
              style={[styles.inputWithIcon, styles.inputWithoutLeftIcon, darkText]}
              placeholder="Contrasena"
              placeholderTextColor={isDarkMode ? "#8F8E96" : "#9ca3af"}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={isDarkMode ? "#A0A0A8" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputWrapper, darkFieldStyle]}>
            <TextInput
              style={[styles.inputWithIcon, styles.inputWithoutLeftIcon, darkText]}
              placeholder="Confirmar contrasena"
              placeholderTextColor={isDarkMode ? "#8F8E96" : "#9ca3af"}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.passwordToggle}
            >
              <MaterialCommunityIcons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={isDarkMode ? "#A0A0A8" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>

          {localError && <Text style={styles.error}>{localError}</Text>}
          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.button,
              (!isValid || loading) && styles.buttonDisabled,
            ]}
            disabled={!isValid || loading}
            onPress={handleRegister}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.backText, isDarkMode && { color: "#D7B48A" }]}>
              Ya tienes cuenta? Inicia sesion
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


