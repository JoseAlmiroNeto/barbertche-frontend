import React from "react";
import { Text, View } from "react-native";
import type { AdminTab, Appointment, BusinessHours, Client, GalleryItem, ManualBlock, Product, RecurringBooking, Service } from "../../../types";
import { HeroCard, IconButton, InfoRow, ManagementCard, MiniButton, SectionTitle } from "../../../components/common";
import { GalleryGrid } from "../../gallery/GalleryComponents";
import { styles } from "../../../theme";
import { weekdayName, weekdayOf } from "../../../utils/date";
import { money, overlaps, toMinutes, toTime } from "../../../utils/time";
import { serviceById } from "../../../utils/schedule";

export function AdminDashboardSection({
  todayDate,
  weekDates,
  bookingsToday,
  bookingsWeek,
  recurring,
  services,
  blocks,
  businessHours,
  closedDates,
  onTabChange
}: {
  todayDate: string;
  weekDates: string[];
  bookingsToday: Appointment[];
  bookingsWeek: Appointment[];
  recurring: RecurringBooking[];
  services: Service[];
  blocks: ManualBlock[];
  businessHours: BusinessHours;
  closedDates: string[];
  onTabChange: (tab: AdminTab) => void;
}) {
  const completedToday = bookingsToday.filter(
    (booking) => booking.status === "COMPLETED",
  );
  const completedWeek = bookingsWeek.filter(
    (booking) => booking.status === "COMPLETED",
  );
  const todayRevenue = completedToday.reduce((total, booking) => total + serviceById(services, booking.serviceId).price, 0);
  const activeRecurring = recurring.filter((item) => item.active);
  const recurringClients = new Set(activeRecurring.map((item) => item.clientId)).size;
  const freeSlotsToday = countFreeSlotsToday(todayDate, bookingsToday, blocks, businessHours, closedDates);
  const topServices = getTopServices(completedWeek, services);
  const busiestDay = getBusiestDay(weekDates, completedWeek);

  return (
    <>
      <HeroCard
        title="Dashboard"
        text="Resumo operacional da barbearia para acompanhar agenda, receita e demanda da semana."
        action="Abrir agenda"
        onPress={() => onTabChange("schedule")}
      />

      <View style={styles.dashboardHeroCard}>
        <Text style={styles.dashboardEyebrow}>Faturamento do dia</Text>
        <Text style={styles.dashboardRevenue}>{money(todayRevenue)}</Text>
        <Text style={styles.dashboardMuted}>{completedToday.length} atendimentos concluídos hoje</Text>
      </View>

      <View style={styles.metricGrid}>
        <DashboardMetric label="Atend. semana" value={`${completedWeek.length}`} detail={busiestDay ? `Pico: ${busiestDay}` : "Sem atendimentos concluídos"} />
        <DashboardMetric label="Livres hoje" value={`${freeSlotsToday}`} detail="janelas de 30 min" />
        <DashboardMetric label="Clientes fixos" value={`${recurringClients}`} detail={`${activeRecurring.length} horários recorrentes`} />
        <DashboardMetric label="Serviços ativos" value={`${services.filter((service) => service.active).length}`} detail={`${services.length} cadastrados`} />
      </View>

      <View style={styles.dashboardPanel}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle}>Serviços mais vendidos</Text>
          <Text style={styles.timelineBadge}>7 dias</Text>
        </View>
        {topServices.length > 0 ? (
          <View style={styles.dashboardList}>
            {topServices.map((item, index) => (
              <View key={item.service.id} style={styles.dashboardListRow}>
                <View style={styles.dashboardRank}>
                  <Text style={styles.dashboardRankText}>{index + 1}</Text>
                </View>
                <View style={styles.dashboardListContent}>
                  <Text style={styles.cardTitle}>{item.service.name}</Text>
                  <Text style={styles.cardText}>{item.count} atendimentos concluídos</Text>
                </View>
                <Text style={styles.price}>{money(item.revenue)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.cardText}>Nenhum atendimento concluído nos últimos 7 dias.</Text>
        )}
      </View>
    </>
  );
}

function DashboardMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function countFreeSlotsToday(
  todayDate: string,
  bookingsToday: Appointment[],
  blocks: ManualBlock[],
  businessHours: BusinessHours,
  closedDates: string[]
) {
  const hours = businessHours[weekdayOf(todayDate)];
  if (!hours || closedDates.includes(todayDate)) {
    return 0;
  }

  const scheduledBookings = bookingsToday.filter(
    (booking) => booking.status === "SCHEDULED",
  );
  const todayBlocks = blocks.filter((block) => block.date === todayDate);
  let free = 0;
  for (let cursor = toMinutes(hours.open); cursor + 30 <= toMinutes(hours.close); cursor += 30) {
    const interval = { start: toTime(cursor), end: toTime(cursor + 30) };
    const busy = [...scheduledBookings, ...todayBlocks].some((item) => overlaps(interval, item));
    if (!busy) {
      free += 1;
    }
  }
  return free;
}

function getTopServices(bookings: Appointment[], services: Service[]) {
  return services
    .map((service) => {
      const count = bookings.filter((booking) => booking.serviceId === service.id).length;
      return { service, count, revenue: count * service.price };
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
    .slice(0, 3);
}

function getBusiestDay(weekDates: string[], bookings: Appointment[]) {
  const busiest = weekDates
    .map((date) => ({
      date,
      count: bookings.filter((booking) => booking.date === date).length
    }))
    .sort((a, b) => b.count - a.count)[0];

  if (!busiest || busiest.count === 0) {
    return "";
  }

  return `${weekdayName(weekdayOf(busiest.date))} (${busiest.count})`;
}

export function AdminMoreSection({ onTabChange, onLogout }: { onTabChange: (tab: AdminTab) => void, onLogout: () => void; }) {
  return (
    <>
      <SectionTitle title="Mais" />
      <InfoRow title="Serviços" detail="Druação, preços e disponibilidade de cada atendimento" icon="cut" onPress={() => onTabChange("services")} />
      <InfoRow title="Agendamentos Fixos" detail="Clientes recorrentes com horário semanal reservado" icon="repeat" onPress={() => onTabChange("recurring")} />
      <InfoRow title="Portfólio" detail="Trabalhos realizados e referências para clientes" icon="images" onPress={() => onTabChange("gallery")} />
      <InfoRow title="Loja" detail="Produtos vendidos, preços e disponibilidade" icon="bag" onPress={() => onTabChange("products")} />
      <InfoRow title="Configurações" detail="Horário de funcionamento, fechamentos e preferências" icon="settings" onPress={() => onTabChange("settings")} />
      <MiniButton label="Sair" danger onPress={onLogout} />
    </>
  );
}

export function AdminClientsSection({
  clients,
  onOpenClient,
  onRequestRemoveClient,
}: {
  clients: Client[];
  onOpenClient: (client?: Client) => void;
  onRequestRemoveClient: (client: Client) => void;
}) {
  return (
    <>
      <SectionTitle title="Clientes" action="Cadastrar" onPress={() => onOpenClient()} />
      {clients.map((client) => (
        <ManagementCard key={client.id} title={client.name} detail={client.phone}>
          <View style={styles.iconActionRow}>
            <IconButton icon="pencil" onPress={() => onOpenClient(client)} />
            <IconButton icon="trash" danger onPress={() => onRequestRemoveClient(client)} />
          </View>
        </ManagementCard>
      ))}
    </>
  );
}

export function AdminServicesSection({
  services,
  onOpenService,
  onRequestRemoveService
}: {
  services: Service[];
  onOpenService: (service?: Service) => void;
  onRequestRemoveService: (service: Service) => void;
}) {
  return (
    <>
      <SectionTitle title="Serviços" action="Novo" onPress={() => onOpenService()} />
      {services.map((service) => (
        <ManagementCard key={service.id} title={service.name} detail={`${service.duration} min - ${money(service.price)}`}>
          <View style={styles.iconActionRow}>
            <IconButton icon="pencil" onPress={() => onOpenService(service)} />
            <IconButton icon="trash" danger onPress={() => onRequestRemoveService(service)} />
          </View>
        </ManagementCard>
      ))}
    </>
  );
}

export function AdminRecurringSection({
  recurring,
  clients,
  services,
  onOpenRecurring,
  onRequestRemoveRecurring
}: {
  recurring: RecurringBooking[];
  clients: Client[];
  services: Service[];
  onOpenRecurring: (item?: RecurringBooking) => void;
  onRequestRemoveRecurring: (item: RecurringBooking) => void;
}) {
  return (
    <>
      <SectionTitle title="Agendamentos Fixos" action="Criar fixo" onPress={() => onOpenRecurring()} />
      {recurring.map((item) => {
        const client = clients.find((candidate) => candidate.id === item.clientId);
        const service = serviceById(services, item.serviceId);
        return (
          <ManagementCard key={item.id} title={client?.name ?? "Cliente"} detail={`Todo ${weekdayName(item.weekday)} as ${item.start} - ${service.name}`}>
            <View style={styles.iconActionRow}>
              <IconButton icon="pencil" onPress={() => onOpenRecurring(item)} />
              <IconButton icon="trash" danger onPress={() => onRequestRemoveRecurring(item)} />
            </View>
          </ManagementCard>
        );
      })}
    </>
  );
}

export function AdminGallerySection({
  gallery,
  onOpenGallery,
  onRequestRemoveGalleryItem
}: {
  gallery: GalleryItem[];
  onOpenGallery: (item?: GalleryItem) => void;
  onRequestRemoveGalleryItem: (item: GalleryItem) => void;
}) {
  return (
    <>
      <SectionTitle title="Portfólio" action="Adicionar" onPress={() => onOpenGallery()} />
      <GalleryGrid
        items={gallery}
        renderAction={(item) => (
          <View style={styles.iconActionRow}>
            <IconButton icon="pencil" onPress={() => onOpenGallery(item)} />
            <IconButton icon="trash" danger onPress={() => onRequestRemoveGalleryItem(item)} />
          </View>
        )}
      />
    </>
  );
}

export function AdminProductsSection({
  products,
  onOpenProduct,
  onToggleProductAvailability,
  onRequestRemoveProduct
}: {
  products: Product[];
  onOpenProduct: (product?: Product) => void;
  onToggleProductAvailability: (product: Product) => void;
  onRequestRemoveProduct: (product: Product) => void;
}) {
  return (
    <>
      <SectionTitle title="Loja" action="Adicionar" onPress={() => onOpenProduct()} />
      {products.map((product) => (
        <ManagementCard key={product.id} title={product.name} detail={`${money(product.price)} - ${product.available ? "Disponível" : "Indisponível"}`}>
          <View style={styles.iconActionRow}>
            <IconButton icon="pencil" onPress={() => onOpenProduct(product)} />
            <IconButton icon={product.available ? "eye" : "eye-off"} onPress={() => onToggleProductAvailability(product)} />
            <IconButton icon="trash" danger onPress={() => onRequestRemoveProduct(product)} />
          </View>
        </ManagementCard>
      ))}
    </>
  );
}
