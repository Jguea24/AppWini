import { View, Text, TouchableOpacity, Image } from "react-native";
import { useOnboardingViewModel } from "../../viewmodel/OnboardingViewModel";
import { homeStyles as styles } from "../styles/home.styles";

export function AccessScreen({ navigation }: any) {
  const { completeOnboarding } = useOnboardingViewModel();

  const goToAuth = async () => {
    await completeOnboarding();
    navigation.replace("Auth");
  };

  return (
    <View style={styles.accessContainer}>
      {/* LOGO */}
      <Image
        source={require("../../shared/assets/logo.png")}
        style={styles.accessLogo}
      />

      {/* TEXTO PRINCIPAL */}
      <Text style={styles.accessTitle}>
        Bienvenido a Wini App
      </Text>

      <Text style={styles.accessSubtitle}>
        Descubre el chocolate artesanal amazónico, conoce su origen y realiza tus pedidos de forma fácil y segura
      </Text>

      {/* BOTÓN INICIAR SESIÓN */}
      <TouchableOpacity
        style={styles.accessPrimaryButton}
        onPress={goToAuth}
        activeOpacity={0.85}
      >
        <Text style={styles.accessPrimaryText}>
          Iniciar sesión
        </Text>
      </TouchableOpacity>

      {/* BOTÓN CREAR CUENTA */}
      <TouchableOpacity
        style={styles.accessSecondaryButton}
        onPress={goToAuth}
        activeOpacity={0.85}
      >
        <Text style={styles.accessSecondaryText}>
          Crear cuenta
        </Text>
      </TouchableOpacity>

      {/* FOOTER */}
      <Text style={styles.accessFooter}>
        Chocolate artesanal • Trazabilidad • Cacao amazónico • Pedidos digitales
      </Text>
    </View>
  );
}
