import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  type StyleProp,
  Text,
  TextInput,
  TouchableOpacity,
  type ViewStyle,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  createAddressService,
  geoAutocompleteService,
  type GeoAutocompleteItem,
} from "../../data/services/addressService";
import { geoGeocodeService, validateAddressService } from "../../data/services/geoService";
import { useThemeMode } from "../../shared/theme/ThemeContext";

type FormState = {
  direccionPrincipal: string;
  calleSecundaria: string;
  pisoDepartamento: string;
  ciudad: string;
  indicaciones: string;
};

const initialForm: FormState = {
  direccionPrincipal: "",
  calleSecundaria: "",
  pisoDepartamento: "",
  ciudad: "",
  indicaciones: "",
};

type FieldProps = {
  icon: string;
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  darkMode?: boolean;
};

function Field({
  icon,
  label,
  required = false,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  containerStyle,
  darkMode = false,
}: FieldProps) {
  const iconColor = darkMode ? "#D7B48A" : "#6F4E37";
  const placeholderColor = darkMode ? "#8F8E96" : "#bcbcc2";

  return (
    <View style={[styles.fieldBlock, containerStyle]}>
      <View style={styles.fieldLabelRow}>
        <MaterialCommunityIcons name={icon} size={34 / 2} color={iconColor} />
        <Text style={[styles.fieldLabel, darkMode && styles.fieldLabelDark]}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      </View>

      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          darkMode && styles.inputDark,
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

export function NewAddressScreen({ navigation }: any) {
  const { isDarkMode } = useThemeMode();
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [autocompleteError, setAutocompleteError] = useState<string | null>(null);
  const [autocompleteResults, setAutocompleteResults] = useState<GeoAutocompleteItem[]>(
    []
  );
  const skipNextAutocompleteRef = useRef(false);

  const canSubmit = useMemo(
    () =>
      form.direccionPrincipal.trim().length > 0 &&
      form.ciudad.trim().length > 0 &&
      !saving,
    [form.ciudad, form.direccionPrincipal, saving]
  );

  const updateField = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSelectSuggestion = async (suggestion: GeoAutocompleteItem) => {
    skipNextAutocompleteRef.current = true;
    setAutocompleteResults([]);
    setAutocompleteError(null);
    setForm((current) => ({
      ...current,
      direccionPrincipal: suggestion.mainAddress,
      ciudad: current.ciudad.trim().length > 0 ? current.ciudad : suggestion.city ?? "",
      calleSecundaria:
        current.calleSecundaria.trim().length > 0
          ? current.calleSecundaria
          : suggestion.secondaryStreet ?? "",
    }));

    const raw = suggestion.raw as Record<string, unknown>;
    const rawPlaceId = raw.place_id;
    const placeId = typeof rawPlaceId === "string" ? rawPlaceId.trim() : "";
    if (!placeId) {
      return;
    }

    try {
      const detail = await geoGeocodeService({ place_id: placeId });
      const first = Array.isArray(detail.results)
        ? (detail.results[0] as Record<string, unknown> | undefined)
        : undefined;
      if (!first) {
        return;
      }

      const formatted =
        typeof first.formatted_address === "string"
          ? first.formatted_address
          : typeof first.formatted === "string"
          ? first.formatted
          : typeof first.address === "string"
          ? first.address
          : null;

      const cityCandidates = [
        first.city,
        first.town,
        first.municipality,
        first.province,
        first.state,
      ];
      const geocodeCity = cityCandidates.find(
        (value) => typeof value === "string" && value.trim().length > 0
      ) as string | undefined;

      setForm((current) => ({
        ...current,
        direccionPrincipal:
          typeof formatted === "string" && formatted.trim().length > 0
            ? formatted.trim()
            : current.direccionPrincipal,
        ciudad:
          current.ciudad.trim().length > 0
            ? current.ciudad
            : geocodeCity?.trim() ?? current.ciudad,
      }));
    } catch {
      // Si geocode falla, mantenemos datos de autocomplete sin bloquear el flujo.
    }
  };

  useEffect(() => {
    const query = form.direccionPrincipal.trim();

    if (skipNextAutocompleteRef.current) {
      skipNextAutocompleteRef.current = false;
      return;
    }

    if (query.length < 3) {
      setAutocompleteResults([]);
      setAutocompleteLoading(false);
      setAutocompleteError(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setAutocompleteLoading(true);
        setAutocompleteError(null);
        const results = await geoAutocompleteService(query, "ec", 5);
        if (!cancelled) {
          setAutocompleteResults(results);
        }
      } catch (err) {
        if (!cancelled) {
          // Si el backend no expone autocomplete, evitamos mostrar error en cada tecla.
          // El usuario puede seguir escribiendo y validar al guardar.
          if (
            err instanceof Error &&
            /no se pudo buscar direccion|not found|404|network|fetch/i.test(
              err.message
            )
          ) {
            setAutocompleteError(null);
          } else if (err instanceof Error && err.message.trim().length > 0) {
            setAutocompleteError(err.message);
          } else {
            setAutocompleteError("No se pudo obtener sugerencias");
          }
          setAutocompleteResults([]);
        }
      } finally {
        if (!cancelled) {
          setAutocompleteLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.direccionPrincipal]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError("Completa direccion principal y ciudad");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const validation = await validateAddressService({
        address: form.direccionPrincipal.trim(),
        city: form.ciudad.trim(),
        region: form.ciudad.trim(),
        country: "EC",
      });

      const isInvalidValidation =
        (typeof validation.valid === "boolean" && !validation.valid) ||
        (typeof validation.is_valid === "boolean" && !validation.is_valid);

      if (isInvalidValidation) {
        throw new Error("La direccion no es valida, revisa los datos");
      }

      const createdAddress = await createAddressService({
        main_address: form.direccionPrincipal.trim(),
        secondary_street: form.calleSecundaria.trim(),
        apartment: form.pisoDepartamento.trim(),
        city: form.ciudad.trim(),
        delivery_instructions: form.indicaciones.trim(),
        is_default: true,
      });

      navigation.replace("PaymentMethod", {
        address: createdAddress,
        deliveryInstructions: form.indicaciones.trim(),
      });
    } catch (err) {
      if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError("No se pudo guardar direccion");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, isDarkMode && styles.screenDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity
          style={[styles.headerIconButton, isDarkMode && styles.headerIconButtonDark]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={36}
            color={isDarkMode ? "#D7B48A" : "#6F4E37"}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
          Nueva Direccion
        </Text>

        <View style={[styles.headerIconButton, isDarkMode && styles.headerIconButtonDark]} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.headerSubtitle, isDarkMode && styles.headerSubtitleDark]}>
          Completa los datos de entrega
        </Text>

        <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
          <View style={styles.fieldBlock}>
            <View style={styles.fieldLabelRow}>
              <MaterialCommunityIcons
                name="home-city-outline"
                size={17}
                color={isDarkMode ? "#D7B48A" : "#6F4E37"}
              />
              <Text style={[styles.fieldLabel, isDarkMode && styles.fieldLabelDark]}>
                Direccion principal<Text style={styles.required}> *</Text>
              </Text>
            </View>

            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              placeholder="Ej: Av. Amazonas y 10 de Agosto"
              placeholderTextColor={isDarkMode ? "#8F8E96" : "#b2aca7"}
              value={form.direccionPrincipal}
              onChangeText={(value) => updateField("direccionPrincipal", value)}
            />

            {autocompleteLoading && (
              <View style={styles.autocompleteLoadingRow}>
                <ActivityIndicator size="small" color={isDarkMode ? "#D7B48A" : "#6F4E37"} />
                <Text
                  style={[
                    styles.autocompleteInfoText,
                    isDarkMode && styles.autocompleteInfoTextDark,
                  ]}
                >
                  Buscando direcciones...
                </Text>
              </View>
            )}

            {!!autocompleteError && (
              <Text style={styles.autocompleteErrorText}>{autocompleteError}</Text>
            )}

            {autocompleteResults.length > 0 && (
              <View style={[styles.autocompleteList, isDarkMode && styles.autocompleteListDark]}>
                {autocompleteResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.autocompleteItem, isDarkMode && styles.autocompleteItemDark]}
                    onPress={() => {
                      handleSelectSuggestion(item).catch(() => {
                        // Ignorado: la pantalla ya mantiene fallback sin romper el flujo.
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={16}
                      color={isDarkMode ? "#D7B48A" : "#6F4E37"}
                    />
                    <View style={styles.autocompleteTextWrap}>
                      <Text
                        style={[
                          styles.autocompletePrimaryText,
                          isDarkMode && styles.autocompletePrimaryTextDark,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {!!item.city && (
                        <Text
                          style={[
                            styles.autocompleteSecondaryText,
                            isDarkMode && styles.autocompleteSecondaryTextDark,
                          ]}
                        >
                          {item.city}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <Field
            icon="map-outline"
            label="Calle secundaria"
            placeholder="Ej: Esq. con Calle 10"
            value={form.calleSecundaria}
            onChangeText={(value) => updateField("calleSecundaria", value)}
            darkMode={isDarkMode}
          />

          <Field
            icon="office-building-outline"
            label="Piso / Departamento"
            placeholder="Ej: Torre B, dpto 302"
            value={form.pisoDepartamento}
            onChangeText={(value) => updateField("pisoDepartamento", value)}
            darkMode={isDarkMode}
          />

          <Field
            icon="map-marker-outline"
            label="Ciudad"
            required
            placeholder="Ciudad / Provincia"
            value={form.ciudad}
            onChangeText={(value) => updateField("ciudad", value)}
            darkMode={isDarkMode}
          />

          <Field
            icon="format-list-bulleted"
            label="Indicaciones de entrega"
            placeholder="Ej: Llamar al llegar, timbre danado"
            value={form.indicaciones}
            onChangeText={(value) => updateField("indicaciones", value)}
            multiline
            darkMode={isDarkMode}
          />
        </View>

        <View style={[styles.actionCard, isDarkMode && styles.actionCardDark]}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.9}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <MaterialCommunityIcons name="content-save-outline" size={18} color="#ffffff" />
                <Text style={styles.saveButtonText}>Guardar direccion</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.bottomNav, isDarkMode && styles.bottomNavDark]}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Home")}>
          <MaterialCommunityIcons
            name="home"
            size={28}
            color={isDarkMode ? "#D7B48A" : "#6F4E37"}
          />
          <Text
            style={[
              styles.bottomLabel,
              styles.bottomLabelActive,
              isDarkMode && styles.bottomLabelDark,
              isDarkMode && styles.bottomLabelActiveDark,
            ]}
          >
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate("Shipments")}
        >
          <MaterialCommunityIcons
            name="cube-outline"
            size={28}
            color={isDarkMode ? "#8F8E96" : "#919191"}
          />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>
            Envios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Orders")}>
          <MaterialCommunityIcons
            name="shopping-outline"
            size={28}
            color={isDarkMode ? "#8F8E96" : "#919191"}
          />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>
            Pedidos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Profile")}>
          <MaterialCommunityIcons
            name="account-outline"
            size={28}
            color={isDarkMode ? "#8F8E96" : "#919191"}
          />
          <Text style={[styles.bottomLabel, isDarkMode && styles.bottomLabelDark]}>
            Perfil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4EFE9",
  },
  screenDark: {
    backgroundColor: "#121214",
  },
  header: {
    height: 92,
    backgroundColor: "#F4EFE9",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  headerDark: {
    backgroundColor: "#121214",
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8DCCF",
  },
  headerIconButtonDark: {
    backgroundColor: "#1A1A1E",
    borderColor: "#2E2E33",
  },
  headerTitle: {
    fontSize: 44 / 2,
    fontWeight: "800",
    color: "#1D1B19",
  },
  headerTitleDark: {
    color: "#F2F2F4",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 22,
  },
  headerSubtitle: {
    color: "#7B6E63",
    fontSize: 13,
    marginBottom: 12,
    marginTop: 2,
  },
  headerSubtitleDark: {
    color: "#B6B6BC",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDE3D8",
    padding: 14,
    shadowColor: "#A88D74",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  formCardDark: {
    backgroundColor: "#1A1A1E",
    borderColor: "#2E2E33",
    shadowOpacity: 0,
  },
  fieldBlock: {
    marginBottom: 12,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  fieldLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#1D1B19",
  },
  fieldLabelDark: {
    color: "#F2F2F4",
  },
  required: {
    color: "#d74a4a",
    fontWeight: "800",
  },
  input: {
    height: 54,
    backgroundColor: "#FCFAF8",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E3D8CE",
    paddingHorizontal: 13,
    color: "#2B2825",
    fontSize: 14,
  },
  inputDark: {
    backgroundColor: "#232329",
    borderColor: "#34343B",
    color: "#F2F2F4",
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  autocompleteLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 4,
  },
  autocompleteInfoText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#7d7d82",
  },
  autocompleteInfoTextDark: {
    color: "#A0A0A8",
  },
  autocompleteErrorText: {
    marginTop: 8,
    marginLeft: 4,
    fontSize: 12,
    color: "#b42318",
  },
  autocompleteList: {
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3D8CE",
    overflow: "hidden",
  },
  autocompleteListDark: {
    backgroundColor: "#232329",
    borderColor: "#34343B",
  },
  autocompleteItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeF2",
  },
  autocompleteItemDark: {
    borderBottomColor: "#34343B",
  },
  autocompleteTextWrap: {
    marginLeft: 8,
    flex: 1,
  },
  autocompletePrimaryText: {
    color: "#1f1f22",
    fontSize: 13,
    fontWeight: "600",
  },
  autocompletePrimaryTextDark: {
    color: "#F2F2F4",
  },
  autocompleteSecondaryText: {
    color: "#8D7A6B",
    fontSize: 12,
    marginTop: 2,
  },
  autocompleteSecondaryTextDark: {
    color: "#B6B6BC",
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    marginBottom: 8,
    marginTop: 0,
    textAlign: "center",
  },
  actionCard: {
    marginTop: 14,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE3D8",
  },
  actionCardDark: {
    backgroundColor: "#1A1A1E",
    borderColor: "#2E2E33",
  },
  saveButton: {
    marginTop: 0,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#7A4F31",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    marginLeft: 8,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  bottomNav: {
    height: 80,
    borderTopWidth: 1,
    borderTopColor: "#E3D8CE",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 4,
  },
  bottomNavDark: {
    borderTopColor: "#2E2E33",
    backgroundColor: "#1A1A1E",
  },
  bottomItem: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLabel: {
    marginTop: 2,
    color: "#8D7A6B",
    fontSize: 16 / 2,
    fontWeight: "500",
  },
  bottomLabelDark: {
    color: "#A0A0A8",
  },
  bottomLabelActive: {
    color: "#6F4E37",
    fontWeight: "700",
  },
  bottomLabelActiveDark: {
    color: "#D7B48A",
  },
});



