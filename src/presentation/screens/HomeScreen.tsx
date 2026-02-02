import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { getUsername, removeToken } from "../../shared/storage/authStorage";
import { homeStyles as styles } from "../styles/home.styles";

/* Acciones principales de Wini App */
const actions = [
  {
    id: 1,
    title: "Catálogo de chocolates",
    description: "Explora chocolates artesanales amazónicos",
    icon: require("../../shared/assets/destinations.png"),
    screen: "Products",
  },
  {
    id: 2,
    title: "Origen y trazabilidad",
    description: "Conoce el recorrido del cacao desde la finca",
    icon: require("../../shared/assets/map.png"),
    screen: "Traceability",
  },
  {
    id: 3,
    title: "Favoritos",
    description: "Guarda tus chocolates preferidos",
    icon: require("../../shared/assets/favorite.png"),
    screen: "Favorites",
  },
  {
    id: 4,
    title: "Historia del cacao",
    description: "Descubre la cultura y proceso artesanal",
    icon: require("../../shared/assets/review.png"),
    screen: "History",
  },
];

export function HomeScreen({ navigation }: any) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    getUsername().then(setUsername);
  }, []);

  const logout = async () => {
    await removeToken();
    navigation.replace("Auth");
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../../shared/assets/logo.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Wini App</Text>

        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutMini}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* BIENVENIDA */}
      <Text style={styles.subtitle}>
        Hola{username ? `, ${username}` : ""}
      </Text>

      {/* MENSAJE PRINCIPAL */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          🍫 Descubre el auténtico chocolate artesanal amazónico
        </Text>
      </View>

      {/* ACCIONES PRINCIPALES */}
      <FlatList
        data={actions}
        numColumns={2}
        scrollEnabled={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <View style={styles.productGridCard}>
            <Image
              source={item.icon}
              style={styles.productImage}
              accessibilityLabel={item.title}
            />

            <Text style={styles.productName}>
              {item.title}
            </Text>

            <Text style={styles.productPrice}>
              {item.description}
            </Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              <Text style={styles.addButtonText}>
                Ver más
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
}

