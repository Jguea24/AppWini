import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  type ImageSourcePropType,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../data/services/api";
import { getBanners } from "../../data/services/bannerService";
import { getCategories } from "../../data/services/categoryService";
import { getProductsByCategory } from "../../data/services/productService";
import { removeToken } from "../../shared/storage/authStorage";
import { useCartViewModel } from "../viewmodel/CartViewModel";
import { Category } from "../../domain/entities/category";
import { Product } from "../../domain/entities/Product";
import BannerCarousel, { BannerItem } from "../components/BannerCarousel";
import { homeStyles as styles } from "../styles/home.styles";
import { useThemeMode } from "../../shared/theme/ThemeContext";

type UiCategory = Category & {
  id: number;
};

type ChocolateItem = {
  id: string;
  productId: number;
  name: string;
  price: number;
  rating: number;
  discountLabel: string;
  image: ImageSourcePropType;
};

const allCategory: UiCategory = {
  id: 0,
  name: "Todos",
  order: 0,
  image: "",
  image_url: "",
};

const fallbackImage = require("../../shared/assets/cultura.png");

const isAllCategoryName = (name: string) => {
  const normalized = name.trim().toLowerCase();
  return normalized === "todos" || normalized === "todo" || normalized === "all";
};

const resolveImageUrl = (rawImage: string | null | undefined): string | null => {
  if (!rawImage) {
    return null;
  }

  if (/^https?:\/\//i.test(rawImage)) {
    return rawImage;
  }

  const baseUrl = String(api.defaults.baseURL ?? "");
  if (!baseUrl) {
    return null;
  }

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = rawImage.startsWith("/") ? rawImage.slice(1) : rawImage;
  return `${normalizedBase}${normalizedPath}`;
};

const estimateRating = (price: number): number => {
  if (price >= 15) {
    return 5;
  }
  if (price >= 10) {
    return 4;
  }
  return 3;
};

const getCategoryFallbackIcon = (categoryName: string): ImageSourcePropType => {
  const normalized = categoryName.toLowerCase();

  if (normalized.includes("trufa")) {
    return require("../../shared/assets/favorite.png");
  }
  if (normalized.includes("barra")) {
    return require("../../shared/assets/product.png");
  }
  if (normalized.includes("regalo")) {
    return require("../../shared/assets/destinations.png");
  }
  if (normalized.includes("cacao")) {
    return require("../../shared/assets/history.png");
  }
  if (
    normalized.includes("promo") ||
    normalized.includes("oferta") ||
    normalized.includes("descuento")
  ) {
    return require("../../shared/assets/offer.png");
  }
  return fallbackImage;
};

const mapProductToItem = (product: Product): ChocolateItem => {
  const remoteImage = resolveImageUrl(product.image_url ?? product.image);
  const imageSource: ImageSourcePropType = remoteImage
    ? { uri: remoteImage }
    : fallbackImage;

  return {
    id: String(product.id),
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    rating: estimateRating(Number(product.price)),
    discountLabel: "-10%",
    image: imageSource,
  };
};

export function HomeScreen({ navigation }: any) {
  const { isDarkMode } = useThemeMode();
  const {
    addToCart,
    loading: cartLoading,
    message: cartMessage,
    cartCount,
    loadCartCount,
  } = useCartViewModel();

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [products, setProducts] = useState<ChocolateItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [likedProductIds, setLikedProductIds] = useState<number[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setCategoriesLoading(true);
        const [bannersData, categoriesData] = await Promise.all([
          getBanners(),
          getCategories(),
        ]);

        setBanners(bannersData);

        const uniqueById = [
          ...new Map(categoriesData.map((item) => [item.id, item])).values(),
        ];
        const uniqueByName = [
          ...new Map(
            uniqueById.map((item) => [item.name.trim().toLowerCase(), item])
          ).values(),
        ];
        const sorted = uniqueByName.sort((a, b) => a.order - b.order);
        setCategories(sorted);
      } catch {
        setBanners([]);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const data = await getProductsByCategory(selectedCategory);
        setProducts(data.map(mapProductToItem));
      } catch {
        setProducts([]);
        setProductsError("Error al cargar productos");
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (!cartMessage) {
      return;
    }

    Alert.alert("Carrito", cartMessage);
  }, [cartMessage]);

  useFocusEffect(
    useCallback(() => {
      loadCartCount();
    }, [loadCartCount])
  );

  const logout = async () => {
    await removeToken();
    navigation.replace("Auth");
  };

  const categoryOptions: UiCategory[] = useMemo(
    () => [
      allCategory,
      ...categories.filter(
        (category) => category.id !== 0 && !isAllCategoryName(category.name)
      ),
    ],
    [categories]
  );

  useEffect(() => {
    const exists = categoryOptions.some((item) => item.id === selectedCategory);
    if (!exists) {
      setSelectedCategory(0);
    }
  }, [categoryOptions, selectedCategory]);

  const normalizedSearch = search.trim().toLowerCase();
  const hasSearch = normalizedSearch.length > 0;
  const filteredProducts = useMemo(
    () =>
      products.filter((item) =>
        item.name.toLowerCase().includes(normalizedSearch)
      ),
    [products, normalizedSearch]
  );

  const toggleLike = (productId: number) => {
    setLikedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const primaryColor = isDarkMode ? "#D7B48A" : "#6f4e37";
  const mutedColor = isDarkMode ? "#A0A0A8" : "#8a7d74";
  const inactiveBottomIcon = isDarkMode ? "#8F8E96" : "#8f8f8f";

  return (
    <View style={[styles.shopScreen, isDarkMode && styles.shopScreenDark]}>
      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.shopProductsRow}
        contentContainerStyle={styles.shopListContent}
        ListHeaderComponent={
          <View style={styles.shopHeader}>
            <View style={styles.shopTopRow}>
              <View style={styles.shopTopIconPlaceholder} />

              <Text style={[styles.shopBrand, isDarkMode && styles.shopBrandDark]}>
                Wini Store
              </Text>

              <TouchableOpacity
                style={[styles.shopLogoutButton, isDarkMode && styles.shopLogoutButtonDark]}
                onPress={logout}
                accessibilityLabel="Cerrar sesion"
              >
                <MaterialCommunityIcons
                  name="logout-variant"
                  size={20}
                  color={primaryColor}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.shopSearchBar, isDarkMode && styles.shopSearchBarDark]}>
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color={mutedColor}
              />
              <TextInput
                style={[styles.shopSearchInput, isDarkMode && styles.shopSearchInputDark]}
                placeholder="Search item..."
                placeholderTextColor={isDarkMode ? "#8F8E96" : "#9b918a"}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {!hasSearch && (
              <View style={styles.shopBannerFullWidth}>
                <BannerCarousel data={banners} />
              </View>
            )}

            {!hasSearch && (
              <>
                <View style={styles.shopSectionRow}>
                  <Text style={[styles.shopSectionTitle, isDarkMode && styles.shopSectionTitleDark]}>
                    Categoria
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.shopCategoryRow}
                >
                  {categoryOptions.map((item) => {
                    const isActive = selectedCategory === item.id;
                    const categoryImageUrl = resolveImageUrl(
                      item.image_url || item.image
                    );
                    const categoryImage: ImageSourcePropType = categoryImageUrl
                      ? { uri: categoryImageUrl }
                      : getCategoryFallbackIcon(item.name);

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.shopCategoryCard,
                          isActive && styles.shopCategoryCardActive,
                          isDarkMode && styles.shopCategoryCardDark,
                          isActive && isDarkMode && styles.shopCategoryCardActiveDark,
                        ]}
                        onPress={() => setSelectedCategory(item.id)}
                        activeOpacity={0.85}
                      >
                        <View
                          style={[
                            styles.shopCategoryIconWrap,
                            isDarkMode && styles.shopCategoryIconWrapDark,
                          ]}
                        >
                          <Image
                            source={categoryImage}
                            style={styles.shopCategoryIcon}
                            accessibilityLabel={item.name}
                          />
                        </View>
                        <Text
                          style={[
                            styles.shopCategoryTitle,
                            isActive && styles.shopCategoryTitleActive,
                            isDarkMode && styles.shopCategoryTitleDark,
                            isActive && isDarkMode && styles.shopCategoryTitleActiveDark,
                          ]}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <View style={styles.shopSectionRow}>
              <Text style={[styles.shopSectionTitle, isDarkMode && styles.shopSectionTitleDark]}>
                {hasSearch
                  ? `Resultados de busqueda (${filteredProducts.length})`
                  : "Tendencia"}
              </Text>
              {!hasSearch && (
                <TouchableOpacity activeOpacity={0.8}>
                  <Text style={[styles.shopSeeMore, isDarkMode && styles.shopSeeMoreDark]}>
                    Ver mas
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {hasSearch && (
              <Text style={[styles.shopSearchHint, isDarkMode && styles.shopSearchHintDark]}>
                {`Mostrando productos relacionados con "${search.trim()}".`}
              </Text>
            )}

            {categoriesLoading && !hasSearch && (
              <Text style={[styles.shopStatusText, isDarkMode && styles.shopStatusTextDark]}>
                Cargando categorias...
              </Text>
            )}

            {!!cartMessage && (
              <Text style={[styles.shopStatusText, isDarkMode && styles.shopStatusTextDark]}>
                {cartMessage}
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const liked = likedProductIds.includes(item.productId);
          return (
            <TouchableOpacity
              style={[styles.shopProductCard, isDarkMode && styles.shopProductCardDark]}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate("ProductDetail", {
                  productId: item.productId,
                })
              }
            >
              <Text style={[styles.shopDiscountTag, isDarkMode && styles.shopDiscountTagDark]}>
                {item.discountLabel}
              </Text>

              <View style={styles.shopProductImageWrap}>
                <Image
                  source={item.image}
                  style={styles.shopProductImage}
                  accessibilityLabel={item.name}
                />
              </View>

              <Text
                style={[styles.shopProductName, isDarkMode && styles.shopProductNameDark]}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              <View style={styles.shopProductFooter}>
                <Text style={[styles.shopProductPrice, isDarkMode && styles.shopProductPriceDark]}>{`S/${item.price.toFixed(
                  2
                )}`}</Text>

                <View style={styles.shopProductActions}>
                  <TouchableOpacity
                    style={[styles.shopIconButton, isDarkMode && styles.shopIconButtonDark]}
                    accessibilityLabel="Agregar a favoritos"
                    onPress={() => toggleLike(item.productId)}
                  >
                    <MaterialCommunityIcons
                      name={liked ? "heart" : "heart-outline"}
                      size={14}
                      color={liked ? "#d74a4a" : mutedColor}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.shopIconButton, isDarkMode && styles.shopIconButtonDark]}
                    accessibilityLabel="Agregar al carrito"
                    onPress={() => addToCart(item.productId)}
                    disabled={cartLoading}
                  >
                    <MaterialCommunityIcons
                      name="cart-plus"
                      size={14}
                      color={isDarkMode ? "#D7B48A" : "#8d7a6b"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.shopStatusContainer}>
            {productsLoading ? (
              <>
                <ActivityIndicator color="#6f4e37" />
                <Text style={[styles.shopStatusText, isDarkMode && styles.shopStatusTextDark]}>
                  Cargando productos...
                </Text>
              </>
            ) : productsError ? (
              <Text style={[styles.shopStatusText, styles.shopStatusError]}>
                {productsError}
              </Text>
            ) : (
              <Text style={[styles.shopEmptyText, isDarkMode && styles.shopEmptyTextDark]}>
                No encontramos chocolates con esa busqueda.
              </Text>
            )}
          </View>
        }
      />

      <View style={styles.shopBottomNavWrapper}>
        <TouchableOpacity
          style={[styles.shopOrderButton, isDarkMode && styles.shopOrderButtonDark]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Cart")}
          accessibilityLabel="Ir a mi pedido"
        >
          <View style={styles.shopOrderIconWrap}>
            <MaterialCommunityIcons
              name="cart"
              size={20}
              color={isDarkMode ? "#D7B48A" : "#1da1dc"}
              style={styles.shopOrderButtonIcon}
            />
            {cartCount > 0 && (
              <View style={styles.shopOrderBadge}>
                <Text style={styles.shopOrderBadgeText}>
                  {cartCount > 99 ? "99+" : String(cartCount)}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.shopOrderButtonText, isDarkMode && styles.shopOrderButtonTextDark]}>
            Mi Pedido
          </Text>
        </TouchableOpacity>

        <View style={[styles.shopBottomNav, isDarkMode && styles.shopBottomNavDark]}>
          <TouchableOpacity style={styles.shopBottomItem} activeOpacity={0.8}>
            <MaterialCommunityIcons
              name="home"
              size={20}
              color={isDarkMode ? "#D7B48A" : "#1da1dc"}
            />
            <Text
              style={[
                styles.shopBottomLabel,
                styles.shopBottomLabelActive,
                isDarkMode && styles.shopBottomLabelDark,
                isDarkMode && styles.shopBottomLabelActiveDark,
              ]}
            >
              Inicio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shopBottomItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Shipments")}
          >
            <MaterialCommunityIcons
              name="cube-outline"
              size={19}
              color={inactiveBottomIcon}
            />
            <Text style={[styles.shopBottomLabel, isDarkMode && styles.shopBottomLabelDark]}>
              Envios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shopBottomItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Orders")}
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={19}
              color={inactiveBottomIcon}
            />
            <Text style={[styles.shopBottomLabel, isDarkMode && styles.shopBottomLabelDark]}>
              Pedidos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shopBottomItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Profile")}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={19}
              color={inactiveBottomIcon}
            />
            <Text style={[styles.shopBottomLabel, isDarkMode && styles.shopBottomLabelDark]}>
              Perfil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


