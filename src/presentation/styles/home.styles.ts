import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 20,
  },

  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },

  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
    resizeMode: "contain",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2933",
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 20,
    elevation: 4,
  },

  welcome: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },

  description: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 20,
  },

  /* ========================= */
  /* 🔽 ESTILOS QUE FALTABAN */
  /* ========================= */

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2933",
    marginBottom: 12,
  },

  error: {
    color: "#dc2626",
    marginBottom: 10,
    textAlign: "center",
  },

  productCard: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },

  /* ========================= */

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  actionCard: {
    backgroundColor: "#f1f5f9",
    width: "48%",
    padding: 16,
    borderRadius: 10,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2933",
    marginBottom: 4,
  },

  actionText: {
    fontSize: 13,
    color: "#6b7280",
  },

  logoutButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },

  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  /* =========================*/
  /* 🔼 Boton de Carrito */

  addButton: {
  backgroundColor: "#2563eb",
  paddingVertical: 10,
  borderRadius: 8,
  marginTop: 10,
  alignItems: "center",
},

addButtonText: {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: "600",
},

success: {
  color: "#16a34a",
  textAlign: "center",
  marginBottom: 8,
},

/* =========================*/
/* 🔼 Estilos del Grid de Productos */

headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

logoutMini: {
  color: "#dc2626",
  fontWeight: "600",
},

banner: {
  backgroundColor: "#facc15",
  padding: 16,
  borderRadius: 14,
  marginVertical: 16,
},

bannerText: {
  fontSize: 16,
  fontWeight: "700",
  color: "#1f2933",
},

categoryChip: {
  backgroundColor: "#e5e7eb",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
  marginRight: 10,
},

categoryActive: {
  backgroundColor: "#2563eb",
},

categoryText: {
  color: "#374151",
  fontWeight: "500",
},

categoryTextActive: {
  color: "#ffffff",
},

productGridCard: {
  flex: 1,
  backgroundColor: "#ffffff",
  borderRadius: 14,
  padding: 12,
  margin: 8,
  elevation: 3,
},

productImage: {
  width: "100%",
  height: 90,
  resizeMode: "contain",
  marginBottom: 6,
},

productPrice: {
  fontWeight: "700",
  marginBottom: 6,
},

/* ========================= */
/*   WELCOME / ONBOARDING   */
/* ========================= */

welcomeContainer: {
  flex: 1,
  backgroundColor: "#0f172a",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
},

welcomeLogo: {
  width: 140,
  height: 140,
  resizeMode: "contain",
  marginBottom: 24,
},

welcomeTitle: {
  fontSize: 30,
  fontWeight: "800",
  color: "#ffffff",
  marginBottom: 8,
  textAlign: "center",
},

welcomeSubtitle: {
  fontSize: 15,
  color: "#cbd5e1",
  textAlign: "center",
  marginBottom: 40,
  paddingHorizontal: 10,
},

welcomeButton: {
  backgroundColor: "#dc2626",
  paddingVertical: 16,
  paddingHorizontal: 40,
  borderRadius: 14,
  elevation: 6,
},

welcomeButtonText: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "700",
},

welcomeFooter: {
  position: "absolute",
  bottom: 20,
  fontSize: 12,
  color: "#94a3b8",
},

/* ========================= */
/*     PERMISSIONS SCREEN   */
/* ========================= */

permissionsContainer: {
  flex: 1,
  backgroundColor: "#0f172a",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
},

permissionsIcon: {
  width: 110,
  height: 110,
  resizeMode: "contain",
  marginBottom: 20,
},

permissionsTitle: {
  fontSize: 26,
  fontWeight: "800",
  color: "#ffffff",
  marginBottom: 16,
  textAlign: "center",
},

permissionsCard: {
  backgroundColor: "#020617",
  borderRadius: 14,
  padding: 20,
  marginBottom: 30,
},

permissionsText: {
  fontSize: 14,
  color: "#cbd5e1",
  textAlign: "center",
  marginBottom: 10,
  lineHeight: 20,
},

permissionsButton: {
  backgroundColor: "#dc2626",
  paddingVertical: 16,
  paddingHorizontal: 40,
  borderRadius: 14,
  elevation: 6,
},

permissionsButtonText: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "700",
},

permissionsFooter: {
  position: "absolute",
  bottom: 20,
  fontSize: 12,
  color: "#94a3b8",
},

/* ========================= */
/*     BENEFITS SCREEN      */
/* ========================= */

benefitsContainer: {
  flex: 1,
  backgroundColor: "#0f172a",
  padding: 24,
},

benefitsTitle: {
  fontSize: 26,
  fontWeight: "800",
  color: "#ffffff",
  textAlign: "center",
  marginTop: 20,
},

benefitsSubtitle: {
  fontSize: 14,
  color: "#cbd5e1",
  textAlign: "center",
  marginBottom: 30,
},

benefitsGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},

benefitCard: {
  width: "48%",
  backgroundColor: "#020617",
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  alignItems: "center",
},

benefitIcon: {
  width: 48,
  height: 48,
  resizeMode: "contain",
  marginBottom: 10,
},

benefitTitle: {
  fontSize: 15,
  fontWeight: "700",
  color: "#ffffff",
  marginBottom: 6,
  textAlign: "center",
},

benefitText: {
  fontSize: 13,
  color: "#cbd5e1",
  textAlign: "center",
},

benefitsButton: {
  backgroundColor: "#dc2626",
  paddingVertical: 16,
  borderRadius: 14,
  alignItems: "center",
  marginTop: 10,
},

benefitsButtonText: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "700",
},

/* ========================= */
/*       ACCESS SCREEN      */
/* ========================= */

accessContainer: {
  flex: 1,
  backgroundColor: "#0f172a",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
},

accessLogo: {
  width: 120,
  height: 120,
  resizeMode: "contain",
  marginBottom: 20,
},

accessTitle: {
  fontSize: 26,
  fontWeight: "800",
  color: "#ffffff",
  marginBottom: 6,
},

accessSubtitle: {
  fontSize: 14,
  color: "#cbd5e1",
  textAlign: "center",
  marginBottom: 36,
},

accessPrimaryButton: {
  backgroundColor: "#dc2626",
  paddingVertical: 16,
  paddingHorizontal: 40,
  borderRadius: 14,
  width: "100%",
  alignItems: "center",
  marginBottom: 14,
},

accessPrimaryText: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "700",
},

accessSecondaryButton: {
  borderWidth: 1,
  borderColor: "#dc2626",
  paddingVertical: 16,
  paddingHorizontal: 40,
  borderRadius: 14,
  width: "100%",
  alignItems: "center",
},

accessSecondaryText: {
  color: "#dc2626",
  fontSize: 16,
  fontWeight: "700",
},

accessFooter: {
  position: "absolute",
  bottom: 20,
  fontSize: 12,
  color: "#94a3b8",
},

/* ========================= */
/*       SHOP HOME UI       */
/* ========================= */

shopScreen: {
  flex: 1,
  backgroundColor: "#f4ede6",
},

shopHeader: {
  paddingTop: 18,
  paddingHorizontal: 18,
  paddingBottom: 8,
},

shopTopRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
},

shopGreeting: {
  fontSize: 13,
  color: "#7f746b",
},

shopBrand: {
  fontSize: 24,
  fontWeight: "800",
  color: "#3f2615",
},

shopLogoutButton: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: "#ffffff",
  alignItems: "center",
  justifyContent: "center",
  elevation: 2,
},

shopSearchBar: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#ffffff",
  borderRadius: 14,
  paddingHorizontal: 12,
  marginBottom: 14,
  elevation: 2,
},

shopSearchInput: {
  flex: 1,
  color: "#3f2615",
  fontSize: 14,
  paddingVertical: 11,
  marginLeft: 6,
},

shopSectionRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 2,
  marginBottom: 8,
},

shopSectionTitle: {
  fontSize: 15,
  fontWeight: "700",
  color: "#3f2615",
},

shopSeeMore: {
  color: "#a08f83",
  fontSize: 12,
  fontWeight: "700",
},

shopCategoryRow: {
  paddingBottom: 14,
  paddingRight: 8,
},

shopCategoryCard: {
  width: 92,
  backgroundColor: "#ffffff",
  borderRadius: 16,
  marginRight: 12,
  paddingVertical: 10,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#efe4d8",
},

shopCategoryCardActive: {
  borderColor: "#9b6c4e",
  backgroundColor: "#fdf7f2",
},

shopCategoryIconWrap: {
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: "#f6eee6",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 6,
},

shopCategoryIcon: {
  width: 26,
  height: 26,
  resizeMode: "contain",
},

shopCategoryTitle: {
  fontSize: 12,
  fontWeight: "600",
  color: "#6a5b52",
},

shopCategoryTitleActive: {
  color: "#3f2615",
},

shopListContent: {
  paddingBottom: 120,
},

shopProductsRow: {
  paddingHorizontal: 12,
  justifyContent: "space-between",
},

shopProductCard: {
  width: "48%",
  backgroundColor: "#ffffff",
  borderRadius: 16,
  marginBottom: 12,
  padding: 10,
  elevation: 2,
},

shopDiscountTag: {
  alignSelf: "flex-start",
  backgroundColor: "#daf4e8",
  color: "#269669",
  fontSize: 10,
  fontWeight: "800",
  paddingHorizontal: 7,
  paddingVertical: 2,
  borderRadius: 12,
},

shopProductImage: {
  width: "100%",
  height: 74,
  resizeMode: "contain",
  marginVertical: 8,
},

shopProductName: {
  fontSize: 13,
  fontWeight: "700",
  color: "#3f2615",
},

shopRatingRow: {
  flexDirection: "row",
  marginTop: 4,
  marginBottom: 6,
},

shopProductFooter: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

shopProductPrice: {
  color: "#2c7a57",
  fontSize: 14,
  fontWeight: "800",
},

shopProductActions: {
  flexDirection: "row",
  alignItems: "center",
},

shopIconButton: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: "#f8f2ec",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 6,
},

shopStatusContainer: {
  alignItems: "center",
  justifyContent: "center",
  paddingTop: 24,
},

shopStatusText: {
  marginTop: 8,
  color: "#6a5b52",
  fontSize: 13,
  textAlign: "center",
},

shopStatusError: {
  color: "#b42318",
},

shopEmptyText: {
  textAlign: "center",
  color: "#6a5b52",
  paddingTop: 28,
  fontSize: 14,
},

shopBottomNav: {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 18,
  backgroundColor: "#ffffff",
  borderRadius: 18,
  height: 62,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  elevation: 5,
},

shopBottomItem: {
  width: 42,
  height: 42,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
},

shopBottomItemActive: {
  backgroundColor: "#6f4e37",
},

  flatListContent: {
    marginTop: 16,
    paddingBottom: 20,
  },


});
