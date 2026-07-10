import * as SecureStore from "expo-secure-store";

const accessTokenKey = "barbertche.accessToken";
const refreshTokenKey = "barbertche.refreshToken";
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export function getStoredAuthToken() {
  return SecureStore.getItemAsync(accessTokenKey, secureStoreOptions);
}

export function getStoredRefreshToken() {
  return SecureStore.getItemAsync(refreshTokenKey, secureStoreOptions);
}

export async function storeAuthTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    SecureStore.setItemAsync(accessTokenKey, accessToken, secureStoreOptions),
    SecureStore.setItemAsync(refreshTokenKey, refreshToken, secureStoreOptions),
  ]);
}

export async function clearStoredAuthToken() {
  await Promise.all([
    SecureStore.deleteItemAsync(accessTokenKey, secureStoreOptions),
    SecureStore.deleteItemAsync(refreshTokenKey, secureStoreOptions),
    SecureStore.deleteItemAsync("barbertche.authToken", secureStoreOptions),
  ]);
}
