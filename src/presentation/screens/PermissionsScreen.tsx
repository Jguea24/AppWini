import { View, Text, TouchableOpacity, Image } from "react-native";
import { homeStyles as styles } from "../styles/home.styles";
import { useThemeMode } from "../../shared/theme/ThemeContext";

export function PermissionsScreen({ navigation }: any) {
  const { isDarkMode } = useThemeMode();

  return (
    <View
      style={[
        styles.permissionsContainer,
        !isDarkMode && { backgroundColor: "#F3EEE8" },
      ]}
    >
      <Image
        source={require("../../shared/assets/location_permission.png")}
        style={styles.permissionsIcon}
      />

      <Text style={[styles.permissionsTitle, !isDarkMode && { color: "#3f2615" }]}>Permisos y uso responsable</Text>

      <View style={[styles.permissionsCard, !isDarkMode && { backgroundColor: "#FFFFFF" }]}> 
        <Text style={[styles.permissionsText, !isDarkMode && { color: "#7f746b" }]}>Wini App te acerca al chocolate artesanal amazonico para conocer su origen y hacer pedidos de forma segura.</Text>

        <Text style={[styles.permissionsText, !isDarkMode && { color: "#7f746b" }]}>La aplicacion puede solicitar camara y notificaciones para escanear codigos y avisarte sobre pedidos y novedades.</Text>
      </View>

      <TouchableOpacity
        style={styles.permissionsButton}
        onPress={() => navigation.navigate("Access")}
        activeOpacity={0.85}
      >
        <Text style={styles.permissionsButtonText}>Aceptar y continuar</Text>
      </TouchableOpacity>

      <Text style={[styles.permissionsFooter, !isDarkMode && { color: "#8F8E96" }]}>Al continuar, aceptas los terminos y la politica de privacidad</Text>
    </View>
  );
}