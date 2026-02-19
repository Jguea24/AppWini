import { View, Text, TouchableOpacity, Image } from "react-native";
import { homeStyles as styles } from "../styles/home.styles";

export function PermissionsScreen({ navigation }: any) {
  return (
    <View style={styles.permissionsContainer}>
      {/* ICONO / ILUSTRACIÃ“N */}
      <Image
        source={require("../../shared/assets/location_permission.png")}
        style={styles.permissionsIcon}
      />

      {/* TÃTULO */}
      <Text style={styles.permissionsTitle}>
        Permisos y uso responsable
      </Text>

      {/* TEXTO INFORMATIVO */}
      <View style={styles.permissionsCard}>
        <Text style={styles.permissionsText}>
          Wini App es una aplicaciÃ³n diseÃ±ada para acercarte al chocolate
          artesanal amazÃ³nico, permitiÃ©ndote conocer su origen, su proceso
          de elaboraciÃ³n y realizar pedidos de manera sencilla y segura.
        </Text>

        <Text style={styles.permissionsText}>
          Para brindarte una mejor experiencia, la aplicaciÃ³n puede solicitar
          acceso a la cÃ¡mara del dispositivo y a notificaciones. Estos permisos
          permiten escanear cÃ³digos QR para visualizar la trazabilidad del cacao
          y enviarte informaciÃ³n sobre pedidos, productos y novedades.
          La informaciÃ³n se utiliza Ãºnicamente con fines funcionales y no se
          comparte sin tu consentimiento.
        </Text>
      </View>

      {/* BOTÃ“N */}
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
        Al continuar, aceptas los tÃ©rminos y 
        condiciones y la polÃ­tica de privacidad
      </Text>
    </View>
  );
}


