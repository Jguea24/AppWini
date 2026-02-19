import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuthViewModel } from "../viewmodel/AuthViewModel";
import { getUsername } from "../../shared/storage/authStorage";
import { loginStyles as styles } from "../styles/login.styles";

export function LoginScreen({ navigation }: any) {
  const { login, loading, error } = useAuthViewModel();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadStoredUsername = async () => {
        const storedUsername = await getUsername();
        if (isActive && storedUsername) {
          setUsername(storedUsername);
        }
      };

      loadStoredUsername();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleLogin = async () => {
    const success = await login(username.trim(), password);
    if (success) navigation.replace("Home");
  };

  const isValid = username.trim().length > 0 && password.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../shared/assets/logo.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Wini App</Text>
        <Text style={styles.subtitle}>
          Inicia sesion y disfruta del chocolate artesanal amazonico
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color="#6b7280"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Usuario o correo electronico"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.inputWithIcon, styles.inputWithoutLeftIcon]}
            placeholder="Contrasena"
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
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[
            styles.button,
            (!isValid || loading) && styles.buttonDisabled,
          ]}
          disabled={!isValid || loading}
          onPress={handleLogin}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerText}>
            No tienes cuenta? Crear una ahora
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


