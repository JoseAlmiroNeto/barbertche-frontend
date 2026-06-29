import * as SecureStore from "expo-secure-store";

const authTokenKey = "barbertche.authToken";

export function getStoredAuthToken() {
  return SecureStore.getItemAsync(authTokenKey);
}

export function storeAuthToken(token: string) {
  return SecureStore.setItemAsync(authTokenKey, token);
}

export function clearStoredAuthToken() {
  return SecureStore.deleteItemAsync(authTokenKey);
}
