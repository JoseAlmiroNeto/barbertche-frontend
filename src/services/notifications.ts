import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { apiRequest } from "./api";
import type { Appointment, Service } from "../types";

const notificationKeyPrefix = "barbertche.appointmentNotifications.";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function initializeNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("appointments", {
      name: "Agendamentos",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#e9bd63",
    });
  }
}

export async function persistPushToken(accessToken: string) {
  const permission = await Notifications.getPermissionsAsync();
  const status = permission.granted
    ? permission.status
    : (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return;

  const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
  await apiRequest("/auth/push-token", {
    method: "POST",
    token: accessToken,
    body: JSON.stringify({
      token: pushToken,
      platform: Platform.OS === "ios" ? "ios" : "android",
    }),
  });
}

export async function scheduleAppointmentNotifications(
  appointment: Appointment,
  service: Service,
) {
  await cancelAppointmentNotifications(appointment.id);
  const permission = await Notifications.getPermissionsAsync();
  const status = permission.granted
    ? permission.status
    : (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return;

  const appointmentAt = new Date(`${appointment.date}T${appointment.start}:00`);
  const reminders = [
    { offset: 24 * 60 * 60 * 1000, title: "Seu horário é amanhã" },
    { offset: 60 * 60 * 1000, title: "Seu horário é em 1 hora" },
  ];
  const identifiers: string[] = [];

  for (const reminder of reminders) {
    const triggerAt = new Date(appointmentAt.getTime() - reminder.offset);
    if (triggerAt.getTime() <= Date.now()) continue;
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: `${service.name} às ${appointment.start}.`,
        data: { appointmentId: appointment.id },
        sound: true,
      },
      trigger: { date: triggerAt, channelId: "appointments" },
    });
    identifiers.push(identifier);
  }

  await SecureStore.setItemAsync(
    `${notificationKeyPrefix}${appointment.id}`,
    JSON.stringify(identifiers),
  );
}

export async function cancelAppointmentNotifications(appointmentId: string) {
  const key = `${notificationKeyPrefix}${appointmentId}`;
  const stored = await SecureStore.getItemAsync(key);
  if (stored) {
    const parsed: unknown = JSON.parse(stored);
    const identifiers = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
    await Promise.all(
      identifiers.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
    );
  }
  await SecureStore.deleteItemAsync(key);
}
