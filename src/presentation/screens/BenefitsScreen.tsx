import { View, Text, TouchableOpacity, Image } from "react-native";
import { homeStyles as styles } from "../styles/home.styles";

export function BenefitsScreen({ navigation }: any) {
  return (
    <View style={styles.benefitsContainer}>
      {/* TÍTULO */}
      <Text style={styles.benefitsTitle}>
        ¿Por qué usar Wini App?
      </Text>

      <Text style={styles.benefitsSubtitle}>
        Conoce, valora y compra chocolate artesanal amazónico desde una sola aplicación
      </Text>

      {/* CARDS DE BENEFICIOS */}
      <View style={styles.benefitsGrid}>
        <View style={styles.benefitCard}>
          <Image
            source={require("../../shared/assets/destinations.png")}
            style={styles.benefitIcon}
          />
          <Text style={styles.benefitTitle}>
            Catálogo artesanal
          </Text>
          <Text style={styles.benefitText}>
            Explora chocolates artesanales con imágenes, precios y disponibilidad.
          </Text>
        </View>

        <View style={styles.benefitCard}>
          <Image
            source={require("../../shared/assets/map.png")}
            style={styles.benefitIcon}
          />
          <Text style={styles.benefitTitle}>
            Origen y trazabilidad
          </Text>
          <Text style={styles.benefitText}>
            Conoce el origen del cacao y su recorrido desde la finca hasta el producto final.
          </Text>
        </View>

        <View style={styles.benefitCard}>
          <Image
            source={require("../../shared/assets/favorite.png")}
            style={styles.benefitIcon}
          />
          <Text style={styles.benefitTitle}>
            Favoritos
          </Text>
          <Text style={styles.benefitText}>
            Guarda tus chocolates preferidos para futuras compras.
          </Text>
        </View>

        <View style={styles.benefitCard}>
          <Image
            source={require("../../shared/assets/review.png")}
            style={styles.benefitIcon}
          />
          <Text style={styles.benefitTitle}>
            Historia del cacao
          </Text>
          <Text style={styles.benefitText}>
            Descubre la cultura, el proceso artesanal y el valor del cacao amazónico.
          </Text>
        </View>
      </View>

      {/* BOTÓN CONTINUAR */}
      <TouchableOpacity
        style={styles.benefitsButton}
        onPress={() => navigation.navigate("Permissions")}
        activeOpacity={0.85}
      >
        <Text style={styles.benefitsButtonText}>
          Continuar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
