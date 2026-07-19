import React from "react";
import { Switch, Text, View } from "react-native";
import { MiniButton } from "../../components/common";
import type { NotificationPreferences, NotificationPreferencesUpdate } from "../notifications/notifications.api";
import { styles } from "../../theme";

export function ProfilePanel({
  name,
  phone,
  notificationPreferences,
  notificationPreferencesLoading,
  onNotificationPreferencesChange,
  onLogout,
}: {
  name: string;
  phone: string;
  notificationPreferences: NotificationPreferences;
  notificationPreferencesLoading: boolean;
  onNotificationPreferencesChange: (changes: NotificationPreferencesUpdate) => void;
  onLogout: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{name}</Text>
      <Text style={styles.cardText}>{phone}</Text>
      <Text style={[styles.cardTitle, { marginTop: 18 }]}>Notificações</Text>
      {([
        ["reminders", "Lembretes de horários"],
        ["appointmentChanges", "Alterações nos agendamentos"],
        ["promotions", "Promoções e novidades"],
      ] as const).map(([key, label]) => (
        <View key={key} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 }}>
          <Text style={styles.cardText}>{label}</Text>
          <Switch
            disabled={notificationPreferencesLoading}
            value={notificationPreferences[key]}
            onValueChange={(value) => onNotificationPreferencesChange({ [key]: value })}
          />
        </View>
      ))}
      <View style={styles.actionRow}>
        <MiniButton label="Sair" danger onPress={onLogout} />
      </View>
    </View>
  );
}
