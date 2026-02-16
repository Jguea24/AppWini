import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  type ImageSourcePropType,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../services/api";
import { getBanners } from "../../services/bannerService";
import { getCategories } from "../../services/categoryService";
import { getProductsByCategory } from "../../services/productService";
import {
  getDisplayName,
  getUsername,
  removeToken,
} from "../../shared/storage/authStorage";
import { useCartViewModel } from "../../viewmodel/CartViewModel";
import { Category } from "../../model/category";
import { Product } from "../../model/Product";
import BannerCarousel, { BannerItem } from "../components/BannerCarousel";
import { homeStyles as styles } from "../styles/home.styles";

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

const fallbackImage = require("../../shared/assets/product.png");

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
  const { addToCart, loading: cartLoading, message: cartMessage } =
    useCartViewModel();

  const [welcomeName, setWelcomeName] = useState<string | null>(null);
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
    const loadWelcomeName = async () => {
      const displayName = await getDisplayName();
      if (displayName) {
        setWelcomeName(displayName);
        return;
      }

      const loginIdentifier = await getUsername();
      setWelcomeName(loginIdentifier);
    };

    loadWelcomeName();
  }, []);

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

  return (
    <View style={styles.shopScreen}>
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
              <View>
                <Text style={styles.shopGreeting}>
                  Hola{welcomeName ? `, ${welcomeName}` : ""}
                </Text>
                <Text style={styles.shopBrand}>Wini Chocolate Store</Text>
              </View>

              <TouchableOpacity
                style={styles.shopLogoutButton}
                onPress={logout}
                accessibilityLabel="Cerrar sesion"
              >
                <MaterialCommunityIcons
                  name="logout-variant"
                  size={20}
                  color="#6f4e37"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.shopSearchBar}>
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color="#8a7d74"
              />
              <TextInput
                style={styles.shopSearchInput}
                placeholder="Search item..."
                placeholderTextColor="#9b918a"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <BannerCarousel data={banners} />

            <View style={styles.shopSectionRow}>
              <Text style={styles.shopSectionTitle}>Category</Text>
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
                    ]}
                    onPress={() => setSelectedCategory(item.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.shopCategoryIconWrap}>
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
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.shopSectionRow}>
              <Text style={styles.shopSectionTitle}>Trending</Text>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.shopSeeMore}>See more</Text>
              </TouchableOpacity>
            </View>

            {categoriesLoading && (
              <Text style={styles.shopStatusText}>Cargando categorias...</Text>
            )}

            {!!cartMessage && (
              <Text style={styles.shopStatusText}>{cartMessage}</Text>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const liked = likedProductIds.includes(item.productId);
          return (
            <View style={styles.shopProductCard}>
              <Text style={styles.shopDiscountTag}>{item.discountLabel}</Text>

              <Image
                source={item.image}
                style={styles.shopProductImage}
                accessibilityLabel={item.name}
              />

              <Text style={styles.shopProductName}>{item.name}</Text>

              <View style={styles.shopRatingRow}>
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <MaterialCommunityIcons
                    key={`${item.id}-${starIndex}`}
                    name={starIndex <= item.rating ? "star" : "star-outline"}
                    size={13}
                    color="#ffb347"
                  />
                ))}
              </View>

              <View style={styles.shopProductFooter}>
                <Text style={styles.shopProductPrice}>{`S/${item.price.toFixed(
                  2
                )}`}</Text>

                <View style={styles.shopProductActions}>
                  <TouchableOpacity
                    style={styles.shopIconButton}
                    accessibilityLabel="Agregar a favoritos"
                    onPress={() => toggleLike(item.productId)}
                  >
                    <MaterialCommunityIcons
                      name={liked ? "heart" : "heart-outline"}
                      size={17}
                      color={liked ? "#d74a4a" : "#8a7d74"}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shopIconButton}
                    accessibilityLabel="Agregar al carrito"
                    onPress={() => addToCart(item.productId)}
                    disabled={cartLoading}
                  >
                    <MaterialCommunityIcons
                      name="cart-outline"
                      size={17}
                      color="#6f4e37"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.shopStatusContainer}>
            {productsLoading ? (
              <>
                <ActivityIndicator color="#6f4e37" />
                <Text style={styles.shopStatusText}>Cargando productos...</Text>
              </>
            ) : productsError ? (
              <Text style={[styles.shopStatusText, styles.shopStatusError]}>
                {productsError}
              </Text>
            ) : (
              <Text style={styles.shopEmptyText}>
                No encontramos chocolates con esa busqueda.
              </Text>
            )}
          </View>
        }
      />

      <View style={styles.shopBottomNav}>
        <TouchableOpacity
          style={[styles.shopBottomItem, styles.shopBottomItemActive]}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="home" size={21} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shopBottomItem} activeOpacity={0.8}>
          <MaterialCommunityIcons name="cart-outline" size={20} color="#6f4e37" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shopBottomItem} activeOpacity={0.8}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={20}
            color="#6f4e37"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shopBottomItem} activeOpacity={0.8}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color="#6f4e37"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
