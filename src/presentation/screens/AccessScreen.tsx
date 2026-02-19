import { View, Text, TouchableOpacity, Image } from "react-native";
import { useOnboardingViewModel } from "../viewmodel/OnboardingViewModel";
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
        Descubre el chocolate artesanal amazÃ³nico, conoce su origen y realiza tus pedidos de forma fÃ¡cil y segura
      </Text>

      {/* BOTÃ“N INICIAR SESIÃ“N */}
      <TouchableOpacity
        style={styles.accessPrimaryButton}
        onPress={goToAuth}
        activeOpacity={0.85}
      >
        <Text style={styles.accessPrimaryText}>
          Iniciar sesiÃ³n
        </Text>
      </TouchableOpacity>

      {/* BOTÃ“N CREAR CUENTA */}
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
        Chocolate artesanal â€¢ Trazabilidad â€¢ Cacao amazÃ³nico â€¢ Pedidos digitales
      </Text>
    </View>
  );
}


