import { View, Text, TouchableOpacity, Image } from "react-native";
import { homeStyles as styles } from "../styles/home.styles";

export function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.welcomeContainer}>
      {/* LOGO */}
      <Image
        source={require("../../shared/assets/logo.png")}
        style={styles.welcomeLogo}
      />

      {/* TEXTO */}
      <Text style={styles.welcomeTitle}>
        Wini App
      </Text>

      <Text style={styles.welcomeSubtitle}>
        Descubre el chocolate artesanal amazónico y conoce su origen desde la finca hasta tu mesa
      </Text>

      {/* BOTÓN */}
      <TouchableOpacity
        style={styles.welcomeButton}
        onPress={() => navigation.navigate("Benefits")}
        activeOpacity={0.8}
      >
        <Text style={styles.welcomeButtonText}>
          Comenzar
        </Text>
      </TouchableOpacity>

      {/* FOOTER */}
      <Text style={styles.welcomeFooter}>
        Chocolate artesanal • Trazabilidad • Cacao amazónico • Pedidos digitales
      </Text>
    </View>
  );
}
