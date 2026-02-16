import { API_BASE_URL } from "./api";
import { getToken } from "../shared/storage/authStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AddressPayload = {
  main_address: string;
  secondary_street?: string;
  apartment?: string;
  city: string;
  delivery_instructions?: string;
  is_default?: boolean;
};

export type AddressItem = AddressPayload & {
  id: number;
};

export type GeoAutocompleteItem = {
  id: string;
  label: string;
  mainAddress: string;
  city?: string;
  secondaryStreet?: string;
  raw: Record<string, unknown>;
};

const readJsonSafely = async (response: Response): Promise<any> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const extractErrorMessage = (data: any, fallback: string): string => {
  if (!data) {
    return fallback;
  }

  if (typeof data === "string" && data.trim().length > 0) {
    return data;
  }

  if (typeof data.message === "string" && data.message.trim().length > 0) {
    return data.message;
  }

  if (typeof data.detail === "string" && data.detail.trim().length > 0) {
    return data.detail;
  }

  const firstValue = Object.values(data)[0];
  if (typeof firstValue === "string" && firstValue.trim().length > 0) {
    return firstValue;
  }

  if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
    return firstValue[0];
  }

  return fallback;
};

const resolveToken = async (token?: string): Promise<string> => {
  if (token) {
    return token;
  }

  const storedToken = await getToken();
  if (storedToken) {
    return storedToken;
  }

  // Compatibilidad con formato { access, refresh } guardado en AsyncStorage["auth"].
  const legacyAuth = await AsyncStorage.getItem("auth");
  if (legacyAuth) {
    try {
      const parsed = JSON.parse(legacyAuth) as { access?: string };
      if (typeof parsed.access === "string" && parsed.access.trim().length > 0) {
        return parsed.access;
      }
    } catch {
      // Ignoramos JSON inválido y caemos en error de sesión.
    }
  }

  throw new Error("Sesion no valida");
};

const parseGeoItem = (item: Record<string, unknown>, index: number): GeoAutocompleteItem => {
  const labelCandidates = [
    item.main_address,
    item.formatted,
    item.formatted_address,
    item.display_name,
    item.description,
    item.address,
    item.name,
  ];

  const mainAddress =
    labelCandidates.find((value) => typeof value === "string" && value.trim().length > 0)
      ?.toString()
      .trim() || `Direccion ${index + 1}`;

  const cityCandidates = [
    item.city,
    item.town,
    item.municipality,
    item.province,
    item.state,
    (item.address as Record<string, unknown> | undefined)?.city,
    (item.address as Record<string, unknown> | undefined)?.town,
    (item.address as Record<string, unknown> | undefined)?.state,
  ];

  const secondaryCandidates = [
    item.secondary_street,
    (item.address as Record<string, unknown> | undefined)?.road,
    (item.address as Record<string, unknown> | undefined)?.suburb,
  ];

  const city = cityCandidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  ) as string | undefined;

  const secondaryStreet = secondaryCandidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  ) as string | undefined;

  const idSource =
    item.id ??
    item.place_id ??
    item.osm_id ??
    item.uuid ??
    `${mainAddress}-${index}`;

  return {
    id: String(idSource),
    label: mainAddress,
    mainAddress,
    city: city?.trim(),
    secondaryStreet: secondaryStreet?.trim(),
    raw: item,
  };
};

export const geoAutocompleteWithAccessTokenService = async (
  text: string,
  accessToken: string,
  country = "ec",
  limit = 5
): Promise<GeoAutocompleteItem[]> => {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/geo/autocomplete/?q=${encodeURIComponent(
      normalizedText
    )}&country=${encodeURIComponent(country)}&limit=${encodeURIComponent(String(limit))}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "No se pudo buscar direccion"));
  }

  const results = Array.isArray(data?.results)
    ? (data.results as Record<string, unknown>[])
    : Array.isArray(data)
    ? (data as Record<string, unknown>[])
    : [];

  return results.map((item, index) => parseGeoItem(item, index));
};

export const geoAutocompleteService = async (
  query: string,
  country = "ec",
  limit = 5,
  token?: string
): Promise<GeoAutocompleteItem[]> => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const accessToken = await resolveToken(token);
  return geoAutocompleteWithAccessTokenService(
    normalizedQuery,
    accessToken,
    country,
    limit
  );
};

export const createAddressService = async (
  payload: AddressPayload,
  token?: string
): Promise<AddressItem> => {
  const accessToken = await resolveToken(token);
  const response = await fetch(`${API_BASE_URL}/addresses/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "No se pudo guardar direccion"));
  }

  return data as AddressItem;
};

export const listAddressesService = async (token?: string): Promise<AddressItem[]> => {
  const accessToken = await resolveToken(token);
  const response = await fetch(`${API_BASE_URL}/addresses/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "No se pudo cargar direcciones"));
  }

  if (Array.isArray(data)) {
    return data as AddressItem[];
  }

  if (data && typeof data === "object") {
    if (Array.isArray(data.results)) {
      return data.results as AddressItem[];
    }
    if (Array.isArray(data.data)) {
      return data.data as AddressItem[];
    }
  }

  return [];
};

export const updateAddressService = async (
  addressId: number | string,
  payload: Partial<AddressPayload>,
  token?: string
): Promise<AddressItem> => {
  const accessToken = await resolveToken(token);
  const response = await fetch(`${API_BASE_URL}/addresses/${addressId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "No se pudo actualizar direccion"));
  }

  return data as AddressItem;
};

export const deleteAddressService = async (
  addressId: number | string,
  token?: string
): Promise<void> => {
  const accessToken = await resolveToken(token);
  const response = await fetch(`${API_BASE_URL}/addresses/${addressId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "No se pudo eliminar direccion"));
  }
};
