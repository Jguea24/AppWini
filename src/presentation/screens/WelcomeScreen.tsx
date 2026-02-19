import { View, Text, TouchableOpacity, Image } from "react-native";
import { homeStyles as styles } from "../styles/home.styles";
import { useThemeMode } from "../../shared/theme/ThemeContext";

export function WelcomeScreen({ navigation }: any) {
  const { isDarkMode } = useThemeMode();

  return (
    <View
      style={[
        styles.welcomeContainer,
        !isDarkMode && { backgroundColor: "#F3EEE8" },
      ]}
    >
      <Image
        source={require("../../shared/assets/logo.png")}
        style={styles.welcomeLogo}
      />

      <Text style={[styles.welcomeTitle, !isDarkMode && { color: "#3f2615" }]}>Wini App</Text>

      <Text style={[styles.welcomeSubtitle, !isDarkMode && { color: "#7f746b" }]}>
        Descubre el chocolate artesanal amazonico y conoce su origen desde la finca hasta tu mesa
      </Text>

      <TouchableOpacity
        style={styles.welcomeButton}
        onPress={() => navigation.navigate("Benefits")}
        activeOpacity={0.8}
      >
        <Text style={styles.welcomeButtonText}>Comenzar</Text>
      </TouchableOpacity>

      <Text style={[styles.welcomeFooter, !isDarkMode && { color: "#8F8E96" }]}>
        Chocolate artesanal - Trazabilidad - Cacao amazonico - Pedidos digitales
      </Text>
    </View>
  );
}