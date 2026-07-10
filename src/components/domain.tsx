import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { Appointment, BusinessHours, GalleryItem, Product, Service } from "../types";
import { palette, styles } from "../theme";
import { dateLabel, weekdayOf } from "../utils/date";
import { money } from "../utils/time";
import { serviceById } from "../utils/schedule";
import { MiniButton } from "./common";

export function AvailabilitySummary({
  date,
  service,
  slots,
  businessHours,
  closedDates
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
  compact
}: {
  appointment: Appointment;
  services: Service[];
  actions?: { label: string; danger?: boolean; onPress: () => void }[];
  compact?: boolean;
}) {
  const service = serviceById(services, appointment.serviceId);
  const sourceLabel = appointment.source === "recurring" ? "Fixo semanal" : appointment.source === "manual" ? "Manual" : "App";
  const statusLabel = {
    pending: "Pendente",
    confirmed: "Confirmado",
    completed: "Concluído",
    cancelled: "Cancelado",
  }[appointment.status];
  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.cardTitle}>{appointment.clientName}</Text>
          <Text style={styles.cardText}>{dateLabel(appointment.date)} - {appointment.start} - {appointment.end}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{sourceLabel}</Text>
        </View>
      </View>
      <Text style={styles.cardText}>{service.name} - {money(service.price)}</Text>
      <Text style={styles.cardText}>Status: {statusLabel}</Text>
      {actions ? (
        <View style={styles.actionRow}>
          {actions.map((action) => (
            <MiniButton key={action.label} label={action.label} danger={action.danger} onPress={action.onPress} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function ProductList({ products }: { products: Product[] }) {
  return (
    <View style={styles.productGrid}>
      {products.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productBody}>
            <Text style={styles.cardTitle}>{product.name}</Text>
            <Text style={styles.cardText}>{product.description}</Text>
            <View style={styles.cardTop}>
              <Text style={styles.price}>{money(product.price)}</Text>
              <Text style={[styles.stock, !product.available && styles.stockOff]}>{product.available ? "Disponível" : "Indisp."}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function ProductCarousel({ products, onViewMore }: { products: Product[]; onViewMore: () => void }) {
  const visibleProducts = products.slice(0, 4);
  const hasMore = products.length > 4;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselRow}>
      {visibleProducts.map((product) => (
        <View key={product.id} style={[styles.productCard, styles.carouselCard]}>
          <Image source={{ uri: product.image }} style={styles.carouselImage} />
          <View style={styles.productBody}>
            <Text style={styles.cardTitle}>{product.name}</Text>
            <Text style={styles.cardText}>{product.description}</Text>
            <View style={styles.cardTop}>
              <Text style={styles.price}>{money(product.price)}</Text>
              <Text style={[styles.stock, !product.available && styles.stockOff]}>{product.available ? "Disponível" : "Indisp."}</Text>
            </View>
          </View>
        </View>
      ))}
      {hasMore ? <ViewMoreCard label="Ver Mais" onPress={onViewMore} /> : null}
    </ScrollView>
  );
}

export function GalleryGrid({ items, renderAction }: { items: GalleryItem[]; renderAction?: (item: GalleryItem) => React.ReactNode }) {
  return (
    <View style={styles.galleryGrid}>
      {items.map((item) => (
        <View key={item.id} style={styles.galleryCard}>
          <Image source={{ uri: item.image }} style={styles.galleryImage} />
          <Text style={styles.galleryTitle}>{item.title}</Text>
          {renderAction?.(item)}
        </View>
      ))}
    </View>
  );
}

export function GalleryCarousel({ items, onViewMore }: { items: GalleryItem[]; onViewMore: () => void }) {
  const visibleItems = items.slice(0, 4);
  const hasMore = items.length > 4;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselRow}>
      {visibleItems.map((item) => (
        <View key={item.id} style={[styles.galleryCard, styles.carouselCard]}>
          <Image source={{ uri: item.image }} style={styles.carouselImage} />
          <Text style={styles.galleryTitle}>{item.title}</Text>
        </View>
      ))}
      {hasMore ? <ViewMoreCard label="Ver Mais" onPress={onViewMore} /> : null}
    </ScrollView>
  );
}

function ViewMoreCard({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.viewMoreCard} onPress={onPress}>
      <Text style={styles.viewMoreText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ProfilePanel({
  name,
  phone,
  onLogout,
}: {
  name: string;
  phone: string;
  onLogout: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{name}</Text>
      <Text style={styles.cardText}>{phone}</Text>
      <View style={styles.actionRow}>
        <MiniButton label="Sair" danger onPress={onLogout} />
      </View>
    </View>
  );
}
