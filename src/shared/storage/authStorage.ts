import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "refresh_token";
const LOGIN_IDENTIFIER_KEY = "auth_login_identifier";
const DISPLAY_NAME_KEY = "auth_display_name";
const LEGACY_USERNAME_KEY = "auth_username";

export const saveAuthTokens = async (access: string, refresh?: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, access);
  if (refresh) {
    await AsyncStorage.setItem(REFRESH_KEY, refresh);
  }
};

export const saveUsername = async (username: string) => {
  await AsyncStorage.setItem(LOGIN_IDENTIFIER_KEY, username);
};

export const saveDisplayName = async (displayName: string) => {
  await AsyncStorage.setItem(DISPLAY_NAME_KEY, displayName);
};

export const saveToken = async (token: string) => saveAuthTokens(token);

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const getUsername = async () => {
  const current = await AsyncStorage.getItem(LOGIN_IDENTIFIER_KEY);
  if (current) {
    return current;
  }

  return await AsyncStorage.getItem(LEGACY_USERNAME_KEY);
};

export const getDisplayName = async () => {
  return await AsyncStorage.getItem(DISPLAY_NAME_KEY);
};

export const getRefreshToken = async () => {
  return await AsyncStorage.getItem(REFRESH_KEY);
};

export const removeToken = async () => {
  await AsyncStorage.multiRemove([
    TOKEN_KEY,
    REFRESH_KEY,
    LOGIN_IDENTIFIER_KEY,
    DISPLAY_NAME_KEY,
    LEGACY_USERNAME_KEY,
  ]);
};
