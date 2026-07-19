import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { removePushToken, savePushToken } from "../auth/auth.api";
import { getStoredPushToken, storePushToken } from "../auth/auth.storage";
import { persistRotatedPushToken } from "./pushTokenRotation";

const notificationChannelId = "appointments";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function synchronizePushToken(accessToken: string) {
  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    return null;
  }

  const projectId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;
  if (!projectId) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(notificationChannelId, {
      name: "Agendamentos",
      description: "Lembretes e atualizações dos seus agendamentos.",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  const permission =
    currentPermission.status === "granted"
      ? currentPermission
      : await Notifications.requestPermissionsAsync();

  if (permission.status !== "granted") {
    return null;
  }

  const expoToken = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;

  const previousToken = await getStoredPushToken();
  return persistRotatedPushToken(accessToken, expoToken, previousToken, Platform.OS, {
    save: savePushToken,
    remove: removePushToken,
    store: storePushToken,
  });
}

export function subscribeToPushTokenChanges(accessToken: string) {
  return Notifications.addPushTokenListener(() => {
    void synchronizePushToken(accessToken).catch(() => undefined);
  });
}
