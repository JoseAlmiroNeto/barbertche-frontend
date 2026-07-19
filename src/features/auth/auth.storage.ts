import * as SecureStore from "expo-secure-store";

const authTokenKey = "barbertche.authToken";
const refreshTokenKey = "barbertche.refreshToken";
const pushTokenKey = "barbertche.pushToken";

export function getStoredAuthToken() {
  return SecureStore.getItemAsync(authTokenKey);
}

export function getStoredRefreshToken() {
  return SecureStore.getItemAsync(refreshTokenKey);
}

export function storeAuthSession(accessToken: string, refreshToken: string) {
  return Promise.all([
    SecureStore.setItemAsync(authTokenKey, accessToken),
    SecureStore.setItemAsync(refreshTokenKey, refreshToken),
  ]);
}

export function getStoredPushToken() {
  return SecureStore.getItemAsync(pushTokenKey);
}

export function storePushToken(token: string) {
  return SecureStore.setItemAsync(pushTokenKey, token);
}

export function clearStoredAuthSession() {
  return Promise.all([
    SecureStore.deleteItemAsync(authTokenKey),
    SecureStore.deleteItemAsync(refreshTokenKey),
    SecureStore.deleteItemAsync(pushTokenKey),
  ]);
}
