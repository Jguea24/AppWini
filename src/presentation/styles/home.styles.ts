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
shopScreenDark: {
  backgroundColor: "#121214",
},

shopHeader: {
  paddingTop: 18,
  paddingHorizontal: 18,
  paddingBottom: 8,
},

shopBannerFullWidth: {
  marginHorizontal: -18,
},

shopTopRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
},

shopTopIconPlaceholder: {
  width: 40,
  height: 40,
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
shopBrandDark: {
  color: "#F2F2F4",
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
shopLogoutButtonDark: {
  backgroundColor: "#1A1A1E",
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
shopSearchBarDark: {
  backgroundColor: "#1A1A1E",
},

shopSearchInput: {
  flex: 1,
  color: "#3f2615",
  fontSize: 14,
  paddingVertical: 11,
  marginLeft: 6,
},
shopSearchInputDark: {
  color: "#F2F2F4",
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
shopSectionTitleDark: {
  color: "#F2F2F4",
},

shopSeeMore: {
  color: "#a08f83",
  fontSize: 12,
  fontWeight: "700",
},
shopSeeMoreDark: {
  color: "#A0A0A8",
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
shopCategoryCardDark: {
  backgroundColor: "#1A1A1E",
  borderColor: "#2E2E33",
},

shopCategoryCardActive: {
  borderColor: "#9b6c4e",
  backgroundColor: "#fdf7f2",
},
shopCategoryCardActiveDark: {
  borderColor: "#D7B48A",
  backgroundColor: "#2A211A",
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
shopCategoryIconWrapDark: {
  backgroundColor: "#232329",
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
shopCategoryTitleDark: {
  color: "#B6B6BC",
},

shopCategoryTitleActive: {
  color: "#3f2615",
},
shopCategoryTitleActiveDark: {
  color: "#E1C29F",
},

shopListContent: {
  paddingHorizontal: 10,
  paddingTop: 4,
  paddingBottom: 130,
},

shopProductsRow: {
  justifyContent: "space-between",
},

shopProductCard: {
  width: "48.4%",
  backgroundColor: "#ffffff",
  borderRadius: 14,
  padding: 9,
  borderWidth: 1,
  borderColor: "#ede6de",
  marginBottom: 10,
  elevation: 2,
},
shopProductCardDark: {
  backgroundColor: "#1A1A1E",
  borderColor: "#2E2E33",
},

shopProductSeparator: {
  height: 10,
},

shopProductImageWrap: {
  width: "100%",
  alignItems: "center",
  marginTop: 4,
  marginBottom: 6,
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
shopDiscountTagDark: {
  backgroundColor: "#2A4A3A",
  color: "#9AE6C6",
},

shopProductImage: {
  width: 54,
  height: 54,
  resizeMode: "contain",
},

shopProductContent: {
  flex: 1,
},

shopProductName: {
  fontSize: 10,
  fontWeight: "700",
  color: "#3f2615",
  minHeight: 30,
},
shopProductNameDark: {
  color: "#F2F2F4",
},

shopRatingRow: {
  flexDirection: "row",
  marginTop: 6,
  marginBottom: 6,
},

shopProductUnit: {
  color: "#8d7a6b",
  fontSize: 12,
  marginBottom: 4,
},

shopProductFooter: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

shopProductPrice: {
  color: "#2c7a57",
  fontSize: 16 / 2,
  fontWeight: "800",
},
shopProductPriceDark: {
  color: "#9AE6C6",
},

shopProductActions: {
  flexDirection: "row",
  alignItems: "center",
},

shopIconButton: {
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: "#f4eee7",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 4,
},
shopIconButtonDark: {
  backgroundColor: "#232329",
},

shopSearchHint: {
  color: "#8d7a6b",
  fontSize: 12,
  marginBottom: 8,
},
shopSearchHintDark: {
  color: "#A0A0A8",
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
shopStatusTextDark: {
  color: "#B6B6BC",
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
shopEmptyTextDark: {
  color: "#B6B6BC",
},

shopBottomNavWrapper: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
},

shopOrderButton: {
  position: "absolute",
  right: 10,
  top: -56,
  height: 46,
  minWidth: 118,
  borderRadius: 12,
  backgroundColor: "#ffffff",
  paddingHorizontal: 16,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  elevation: 4,
},
shopOrderButtonDark: {
  backgroundColor: "#1A1A1E",
},

shopOrderIconWrap: {
  width: 22,
  height: 22,
  marginRight: 8,
  alignItems: "center",
  justifyContent: "center",
},

shopOrderButtonIcon: {
  marginRight: 0,
},

shopOrderBadge: {
  position: "absolute",
  top: -7,
  right: -9,
  minWidth: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: "#ff4d4f",
  borderWidth: 1,
  borderColor: "#ffffff",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 4,
},

shopOrderBadgeText: {
  color: "#ffffff",
  fontSize: 10,
  fontWeight: "700",
},

shopOrderButtonText: {
  color: "#1da1dc",
  fontSize: 16,
  fontWeight: "700",
},
shopOrderButtonTextDark: {
  color: "#D7B48A",
},

shopBottomNav: {
  backgroundColor: "#ffffff",
  borderTopWidth: 1,
  borderTopColor: "#dfe3e8",
  height: 66,
  paddingTop: 6,
  paddingBottom: 6,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
},
shopBottomNavDark: {
  backgroundColor: "#1A1A1E",
  borderTopColor: "#2E2E33",
},

shopBottomItem: {
  minWidth: 60,
  height: 52,
  alignItems: "center",
  justifyContent: "center",
},

shopBottomLabel: {
  fontSize: 10,
  color: "#8f8f8f",
  fontWeight: "500",
  marginTop: 2,
},
shopBottomLabelDark: {
  color: "#A0A0A8",
},

shopBottomLabelActive: {
  color: "#1da1dc",
  fontWeight: "600",
},
shopBottomLabelActiveDark: {
  color: "#D7B48A",
},

  flatListContent: {
    marginTop: 16,
    paddingBottom: 20,
  },


});
