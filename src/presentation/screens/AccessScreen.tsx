import { View, Text, TouchableOpacity, Image } from "react-native";
import { useOnboardingViewModel } from "../viewmodel/OnboardingViewModel";
import { homeStyles as styles } from "../styles/home.styles";
import { useThemeMode } from "../../shared/theme/ThemeContext";

export function AccessScreen({ navigation }: any) {
  const { completeOnboarding } = useOnboardingViewModel();
  const { isDarkMode } = useThemeMode();

  const goToAuth = async () => {
    await completeOnboarding();
    navigation.replace("Auth");
  };

  return (
    <View
      style={[
        styles.accessContainer,
        !isDarkMode && { backgroundColor: "#F3EEE8" },
      ]}
    >
      <Image source={require("../../shared/assets/logo.png")} style={styles.accessLogo} />

      <Text style={[styles.accessTitle, !isDarkMode && { color: "#3f2615" }]}>Bienvenido a Wini App</Text>

      <Text style={[styles.accessSubtitle, !isDarkMode && { color: "#7f746b" }]}>Descubre el chocolate artesanal amazonico, conoce su origen y realiza tus pedidos facil y seguro</Text>

      <TouchableOpacity style={styles.accessPrimaryButton} onPress={goToAuth} activeOpacity={0.85}>
        <Text style={styles.accessPrimaryText}>Iniciar sesion</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.accessSecondaryButton} onPress={goToAuth} activeOpacity={0.85}>
        <Text style={styles.accessSecondaryText}>Crear cuenta</Text>
      </TouchableOpacity>

      <Text style={[styles.accessFooter, !isDarkMode && { color: "#8F8E96" }]}>Chocolate artesanal - Trazabilidad - Cacao amazonico - Pedidos digitales</Text>
    </View>
  );
}