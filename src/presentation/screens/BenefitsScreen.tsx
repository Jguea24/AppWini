import { View, Text, TouchableOpacity, Image } from "react-native";
import { homeStyles as styles } from "../styles/home.styles";
import { useThemeMode } from "../../shared/theme/ThemeContext";

export function BenefitsScreen({ navigation }: any) {
  const { isDarkMode } = useThemeMode();

  return (
    <View
      style={[
        styles.benefitsContainer,
        !isDarkMode && { backgroundColor: "#F3EEE8" },
      ]}
    >
      <Text style={[styles.benefitsTitle, !isDarkMode && { color: "#3f2615" }]}>Por que usar Wini App?</Text>

      <Text style={[styles.benefitsSubtitle, !isDarkMode && { color: "#7f746b" }]}>
        Conoce, valora y compra chocolate artesanal amazonico desde una sola aplicacion
      </Text>

      <View style={styles.benefitsGrid}>
        <View style={[styles.benefitCard, !isDarkMode && { backgroundColor: "#FFFFFF" }]}> 
          <Image source={require("../../shared/assets/destinations.png")} style={styles.benefitIcon} />
          <Text style={[styles.benefitTitle, !isDarkMode && { color: "#3f2615" }]}>Catalogo artesanal</Text>
          <Text style={[styles.benefitText, !isDarkMode && { color: "#7f746b" }]}>Explora chocolates artesanales con imagenes, precios y disponibilidad.</Text>
        </View>

        <View style={[styles.benefitCard, !isDarkMode && { backgroundColor: "#FFFFFF" }]}> 
          <Image source={require("../../shared/assets/map.png")} style={styles.benefitIcon} />
          <Text style={[styles.benefitTitle, !isDarkMode && { color: "#3f2615" }]}>Origen y trazabilidad</Text>
          <Text style={[styles.benefitText, !isDarkMode && { color: "#7f746b" }]}>Conoce el origen del cacao y su recorrido desde la finca hasta el producto final.</Text>
        </View>

        <View style={[styles.benefitCard, !isDarkMode && { backgroundColor: "#FFFFFF" }]}> 
          <Image source={require("../../shared/assets/favorite.png")} style={styles.benefitIcon} />
          <Text style={[styles.benefitTitle, !isDarkMode && { color: "#3f2615" }]}>Favoritos</Text>
          <Text style={[styles.benefitText, !isDarkMode && { color: "#7f746b" }]}>Guarda tus chocolates preferidos para futuras compras.</Text>
        </View>

        <View style={[styles.benefitCard, !isDarkMode && { backgroundColor: "#FFFFFF" }]}> 
          <Image source={require("../../shared/assets/review.png")} style={styles.benefitIcon} />
          <Text style={[styles.benefitTitle, !isDarkMode && { color: "#3f2615" }]}>Historia del cacao</Text>
          <Text style={[styles.benefitText, !isDarkMode && { color: "#7f746b" }]}>Descubre la cultura, el proceso artesanal y el valor del cacao amazonico.</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.benefitsButton}
        onPress={() => navigation.navigate("Permissions")}
        activeOpacity={0.85}
      >
        <Text style={styles.benefitsButtonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}