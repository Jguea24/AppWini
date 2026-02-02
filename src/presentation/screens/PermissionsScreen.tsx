import { View, Text, TouchableOpacity, Image } from "react-native";
import { homeStyles as styles } from "../styles/home.styles";

export function PermissionsScreen({ navigation }: any) {
  return (
    <View style={styles.permissionsContainer}>
      {/* ICONO / ILUSTRACIÓN */}
      <Image
        source={require("../../shared/assets/location_permission.png")}
        style={styles.permissionsIcon}
      />

      {/* TÍTULO */}
      <Text style={styles.permissionsTitle}>
        Permisos y uso responsable
      </Text>

      {/* TEXTO INFORMATIVO */}
      <View style={styles.permissionsCard}>
        <Text style={styles.permissionsText}>
          Wini App es una aplicación diseñada para acercarte al chocolate
          artesanal amazónico, permitiéndote conocer su origen, su proceso
          de elaboración y realizar pedidos de manera sencilla y segura.
        </Text>

        <Text style={styles.permissionsText}>
          Para brindarte una mejor experiencia, la aplicación puede solicitar
          acceso a la cámara del dispositivo y a notificaciones. Estos permisos
          permiten escanear códigos QR para visualizar la trazabilidad del cacao
          y enviarte información sobre pedidos, productos y novedades.
          La información se utiliza únicamente con fines funcionales y no se
          comparte sin tu consentimiento.
        </Text>
      </View>

      {/* BOTÓN */}
      <TouchableOpacity
        style={styles.permissionsButton}
        onPress={() => navigation.navigate("Access")}
        activeOpacity={0.85}
      >
        <Text style={styles.permissionsButtonText}>
          Aceptar y continuar
        </Text>
      </TouchableOpacity>

      {/* FOOTER */}
      <Text style={styles.permissionsFooter}>
        Al continuar, aceptas los términos y 
        condiciones y la política de privacidad
      </Text>
    </View>
  );
}
