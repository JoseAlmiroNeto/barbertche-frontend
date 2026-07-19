import React from "react";
import { Text, View } from "react-native";
import { MiniButton } from "../../components/common";
import { styles } from "../../theme";
import { dateLabel, weekdayOf } from "../../utils/date";
import { serviceById } from "../../utils/schedule";
import { money } from "../../utils/time";
import type { Service } from "../services/services.types";
import type { BusinessHours } from "../settings/settings.types";
import type { Appointment } from "./appointments.types";

export function AvailabilitySummary({
  date,
  service,
  slots,
  businessHours,
  closedDates,
}: {
  date: string;
  service: Service;
  slots: string[];
  businessHours: BusinessHours;
  closedDates: string[];
}) {
  const hours = businessHours[weekdayOf(date)];
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryText}>
        {hours && !closedDates.includes(date)
          ? `${slots.length} horários livres para ${service.name}. Expediente ${hours.open}-${hours.close}.`
          : "Dia fechado, feriado ou sem expediente configurado."}
      </Text>
    </View>
  );
}

export function AppointmentCard({
  appointment,
  services,
  actions,
  compact,
}: {
  appointment: Appointment;
  services: Service[];
  actions?: { label: string; danger?: boolean; onPress: () => void }[];
  compact?: boolean;
}) {
  const service = serviceById(services, appointment.serviceId);
  const sourceLabel =
    appointment.source === "recurring"
      ? "Fixo semanal"
      : appointment.source === "manual"
        ? "Manual"
        : "App";
  const statusLabel = {
    SCHEDULED: "Agendado",
    COMPLETED: "Concluído",
    CANCELED: "Cancelado",
    NO_SHOW: "Não compareceu",
  }[appointment.status];

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.cardTitle}>{appointment.clientName}</Text>
          <Text style={styles.cardText}>
            {dateLabel(appointment.date)} - {appointment.start} - {appointment.end}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={styles.cardText}>
        {service.name} - {money(service.price)}
      </Text>
      <Text style={styles.cardText}>Origem: {sourceLabel}</Text>
      {appointment.cancellationReason ? (
        <Text style={styles.cardText}>{appointment.cancellationReason}</Text>
      ) : null}
      {actions ? (
        <View style={styles.actionRow}>
          {actions.map((action) => (
            <MiniButton
              key={action.label}
              label={action.label}
              danger={action.danger}
              onPress={action.onPress}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
