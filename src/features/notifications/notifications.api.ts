import { apiClient, authorized, unwrapApiResponse } from "../../services/api";

export type NotificationPreferences = {
  userId: string;
  reminders: boolean;
  appointmentChanges: boolean;
  promotions: boolean;
};

export type NotificationPreferencesUpdate = Partial<Pick<NotificationPreferences, "reminders" | "appointmentChanges" | "promotions">>;

export async function getNotificationPreferences(token: string) {
  return unwrapApiResponse(await apiClient.GET("/api/notifications/preferences", { headers: authorized(token) })) as NotificationPreferences;
}

export async function updateNotificationPreferences(token: string, body: NotificationPreferencesUpdate) {
  return unwrapApiResponse(await apiClient.PATCH("/api/notifications/preferences", { headers: authorized(token), body })) as NotificationPreferences;
}
