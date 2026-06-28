import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { Appointment, BusinessHours, Client, ClientTab, GalleryItem, Product, Service } from "../types";
import { BottomTabs, Chip, ChipRow, DateStrip, EmptyState, HeroCard, SectionTitle, Segmented } from "../components/common";
import { AppointmentCard, AvailabilitySummary, GalleryCarousel, GalleryGrid, ProductCarousel, ProductList, ProfilePanel } from "../components/domain";
import { styles } from "../theme";
import { dateLabel, weekdayOf } from "../utils/date";
import { money } from "../utils/time";

type AppointmentView = "upcoming" | "history";

export function ClientApp({
  tab,
  currentClient,
  services,
  products,
  gallery,
  dateOptions,
  selectedDate,
  selectedService,
  selectedServiceId,
  availableSlots,
  occupiedSlots,
  clientAppointments,
  businessHours,
  closedDates,
  onTabChange,
  onDateChange,
  onServiceChange,
  onBookSlot,
  onCancelAppointment,
  onRescheduleAppointment,
  onLogout,
  onAdmin
}: {
  tab: ClientTab;
  currentClient: Client;
  services: Service[];
  products: Product[];
  gallery: GalleryItem[];
  dateOptions: string[];
  selectedDate: string;
  selectedService: Service;
  selectedServiceId: string;
  availableSlots: string[];
  occupiedSlots: string[];
  clientAppointments: Appointment[];
  businessHours: BusinessHours;
  closedDates: string[];
  onTabChange: (tab: ClientTab) => void;
  onDateChange: (date: string) => void;
  onServiceChange: (serviceId: string) => void;
  onBookSlot: (start: string) => void | Promise<void>;
  onCancelAppointment: (id: string) => void | Promise<void>;
  onRescheduleAppointment: (id: string, date: string, start: string) => void | Promise<void>;
  onLogout: () => void;
  onAdmin: () => void;
}) {
  const [appointmentView, setAppointmentView] = useState<AppointmentView>("upcoming");
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const todayIso = new Date().toISOString().slice(0, 10);
  const upcomingAppointments = clientAppointments.filter((appointment) => appointment.status === "confirmed" && appointment.date >= todayIso);
  const historyAppointments = clientAppointments.filter((appointment) => appointment.status === "confirmed" && appointment.date < todayIso);
  const selectedAppointments =
    appointmentView === "upcoming"
      ? upcomingAppointments
      : historyAppointments;
  const draftService = services.find((service) => service.id === bookingServiceId) ?? null;
  const canShowSlots = Boolean(draftService && bookingDate);
  const visibleAvailableSlots = canShowSlots ? availableSlots.filter((slot) => !occupiedSlots.includes(slot)) : [];
  const openDateOptions = dateOptions.filter((date) => {
    const hours = businessHours[weekdayOf(date)];
    return Boolean(hours) && !closedDates.includes(date);
  });
  const bottomActiveTab = tab === "book" ? "mine" : tab === "gallery" ? "home" : tab;

  function startNewBooking() {
    setReschedulingId(null);
    setBookingServiceId(null);
    setBookingDate(null);
    setBookingSlot(null);
    setConfirmVisible(false);
    onTabChange("book");
  }

  function startReschedule(appointment: Appointment) {
    setReschedulingId(appointment.id);
    setBookingServiceId(appointment.serviceId);
    setBookingDate(null);
    setBookingSlot(null);
    setConfirmVisible(false);
    onServiceChange(appointment.serviceId);
    onTabChange("book");
  }

  function handleServiceSelect(serviceId: string) {
    setBookingServiceId(serviceId);
    setBookingSlot(null);
    onServiceChange(serviceId);
  }

  function handleDateSelect(date: string) {
    setBookingDate(date);
    setBookingSlot(null);
    onDateChange(date);
  }

  function confirmBooking() {
    if (!bookingSlot || !bookingDate) {
      return;
    }

    if (reschedulingId) {
      onRescheduleAppointment(reschedulingId, bookingDate, bookingSlot);
    } else {
      onBookSlot(bookingSlot);
    }

    setConfirmVisible(false);
    setReschedulingId(null);
    setBookingSlot(null);
    setAppointmentView("upcoming");
    onTabChange("mine");
  }

  function confirmCancelAppointment() {
    if (!cancelTarget) {
      return;
    }

    onCancelAppointment(cancelTarget.id);
    setCancelTarget(null);
    setAppointmentView("upcoming");
  }

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {tab === "home" ? (
          <>
            <HeroCard
              title={`Bom dia, ${currentClient.name.split(" ")[0]}`}
              text="Veja seu próximo horário, acompanhe inspirações e agende quando precisar."
              action="Agendar Horário"
              onPress={startNewBooking}
            />
            <SectionTitle title="Próximo horário" action="Ver horários" onPress={() => onTabChange("mine")} />
            {upcomingAppointments[0] ? (
              <AppointmentCard appointment={upcomingAppointments[0]} services={services} />
            ) : (
              <EmptyState text="Você ainda não tem horário marcado." />
            )}
            <SectionTitle title="Cortes em destaque" action="Ver inspirações" onPress={() => onTabChange("gallery")} />
            <GalleryCarousel items={gallery} onViewMore={() => onTabChange("gallery")} />
            <SectionTitle title="Promoções" />
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Combo cabelo + barba</Text>
              <Text style={styles.cardText}>Atendimento completo com acabamento premium e preço especial nesta semana.</Text>
            </View>
            <SectionTitle title="Produtos" action="Abrir loja" onPress={() => onTabChange("products")} />
            <ProductCarousel products={products.filter((product) => product.available)} onViewMore={() => onTabChange("products")} />
          </>
        ) : null}

        {tab === "book" ? (
          <>
            <SectionTitle title={reschedulingId ? "Remarcar agendamento" : "Novo agendamento"} action="Voltar" onPress={() => onTabChange("mine")} />
            <SectionTitle title="Escolha o serviço" />
            <ChipRow>
              {services.filter((service) => service.active).map((service) => (
                <Chip key={service.id} active={service.id === bookingServiceId} onPress={() => handleServiceSelect(service.id)}>
                  {service.name} - {service.duration}min
                </Chip>
              ))}
            </ChipRow>
            
            <SectionTitle title="Dia" />
            <DateStrip dates={openDateOptions} selectedDate={bookingDate ?? ""} closedDates={closedDates} onSelect={handleDateSelect} />
            {draftService && bookingDate ? (
              <>
                <AvailabilitySummary date={bookingDate} service={draftService} slots={visibleAvailableSlots} businessHours={businessHours} closedDates={closedDates} />
                
                <SectionTitle title="Selecione um horário disponível" />
                <View style={styles.slotGrid}>
                  {visibleAvailableSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={[styles.slot, bookingSlot === slot && styles.slotSelected]}
                      onPress={() => setBookingSlot(slot)}
                    >
                      <Text style={[styles.slotText, bookingSlot === slot && styles.slotTextSelected]}>{slot}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {visibleAvailableSlots.length === 0 ? <EmptyState text="Não há horários livres para este serviço neste dia." /> : null}
                {bookingSlot ? (
                  <TouchableOpacity style={styles.primaryButton} onPress={() => setConfirmVisible(true)}>
                    <Text style={styles.primaryButtonText}>{reschedulingId ? "Remarcar" : "Agendar"}</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <EmptyState text="Selecione um serviço e um dia para ver os horários disponíveis." />
            )}
          </>
        ) : null}

        {tab === "mine" ? (
          <>
            <SectionTitle title="Meus Horários" />
            <TouchableOpacity style={styles.primaryButton} onPress={startNewBooking}>
              <Text style={styles.primaryButtonText}>+ Novo Agendamento</Text>
            </TouchableOpacity>
            <Segmented
              options={[
                { label: "Próximos", value: "upcoming" },
                { label: "Histórico", value: "history" }
              ]}
              value={appointmentView}
              onChange={setAppointmentView}
            />
            {selectedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                services={services}
                actions={appointment.status === "confirmed" && appointment.date >= todayIso && appointment.source !== "recurring" ? [
                  { label: "Remarcar", onPress: () => startReschedule(appointment) },
                  { label: "Cancelar agendamento", danger: true, onPress: () => setCancelTarget(appointment) }
                ] : undefined}
              />
            ))}
            {selectedAppointments.length === 0 ? <EmptyState text="Nenhum horário encontrado nesta categoria." /> : null}
          </>
        ) : null}

        {tab === "gallery" ? (
          <>
            <SectionTitle title="Inspirações" action="Voltar" onPress={() => onTabChange("home")} />
            <GalleryGrid items={gallery} />
          </>
        ) : null}
        {tab === "products" ? <ProductList products={products} /> : null}
        {tab === "profile" ? (
          <>
            <ProfilePanel name={currentClient.name} phone={currentClient.phone} onLogout={onLogout} />
            <SectionTitle title="Histórico de cortes" />
            <EmptyState text="Seus cortes finalizados aparecerão aqui." />
          </>
        ) : null}
      </ScrollView>
      <BottomTabs
        tabs={[
          ["home", "Início", "home"],
          ["mine", "Horários", "calendar"],
          ["products", "Loja", "bag"],
          ["profile", "Perfil", "person"]
        ]}
        active={bottomActiveTab}
        onChange={(value) => onTabChange(value as ClientTab)}
      />
      <Modal transparent visible={confirmVisible} animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{reschedulingId ? "Confirmar remarcação" : "Confirmar agendamento"}</Text>
            <Text style={styles.cardText}>Serviço: {draftService?.name}</Text>
            <Text style={styles.cardText}>Dia: {bookingDate ? dateLabel(bookingDate) : "-"}</Text>
            <Text style={styles.cardText}>Horário: {bookingSlot ?? "-"}</Text>
            {draftService ? <Text style={styles.price}>{money(draftService.price)}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.secondaryButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={confirmBooking}>
                <Text style={styles.primaryButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal transparent visible={Boolean(cancelTarget)} animationType="fade" onRequestClose={() => setCancelTarget(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancelar agendamento?</Text>
            <Text style={styles.cardText}>Tem certeza que deseja cancelar este horário?</Text>
            <Text style={styles.cardText}>Dia: {cancelTarget ? dateLabel(cancelTarget.date) : "-"}</Text>
            <Text style={styles.cardText}>Horário: {cancelTarget?.start ?? "-"} - {cancelTarget?.end ?? "-"}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setCancelTarget(null)}>
                <Text style={styles.secondaryButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, styles.dangerButton]} onPress={confirmCancelAppointment}>
                <Text style={styles.primaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
