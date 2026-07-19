import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { getNotificationPreferences, type NotificationPreferences, type NotificationPreferencesUpdate, updateNotificationPreferences } from "./notifications.api";
import { subscribeToPushTokenChanges, synchronizePushToken } from "./pushNotifications";

const defaults: NotificationPreferences = {
  userId: "",
  reminders: true,
  appointmentChanges: true,
  promotions: false,
};

export function useNotificationSettings(accessToken: string | null, enabled: boolean) {
  const [preferences, setPreferences] = useState(defaults);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !accessToken) return;
    const synchronize = () => void synchronizePushToken(accessToken).catch(() => undefined);
    synchronize();
    setLoading(true);
    void getNotificationPreferences(accessToken)
      .then(setPreferences)
      .catch(() => setPreferences(defaults))
      .finally(() => setLoading(false));
    const appState = AppState.addEventListener("change", (state) => state === "active" && synchronize());
    const tokenListener = subscribeToPushTokenChanges(accessToken);
    return () => { appState.remove(); tokenListener.remove(); };
  }, [accessToken, enabled]);

  async function update(changes: NotificationPreferencesUpdate) {
    if (!accessToken) return false;
    const previous = preferences;
    setPreferences((current) => ({ ...current, ...changes }));
    try {
      setPreferences(await updateNotificationPreferences(accessToken, changes));
      return true;
    } catch {
      setPreferences(previous);
      return false;
    }
  }

  return { preferences, loading, update };
}
