import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import type {
  AdminTab,
  Appointment,
  BusinessHours,
  Client,
  GalleryItem,
  ManualBlock,
  Product,
  RecurringBooking,
  Service,
} from "../types";
import {
  BottomTabs,
  ConfirmActionModal,
  EmptyState,
  InfoRow,
  MiniButton,
  SectionTitle,
} from "../components/common";
import {
  AdminClientsSection,
  AdminDashboardSection,
  AdminGallerySection,
  AdminMoreSection,
  AdminProductsSection,
  AdminRecurringSection,
  AdminServicesSection,
} from "./admin/AdminSections";
import {
  ClientModal,
  GalleryModal,
  ManualBlockModal,
  ManualBookingModal,
  ProductModal,
  RecurringModal,
  ServiceModal,
} from "./admin/modals/AdminModals";
import { styles } from "../theme";
import { dateLabel, weekdayName, weekdayOf } from "../utils/date";
import { addMinutes, money, toMinutes, toTime } from "../utils/time";
import { serviceById } from "../utils/schedule";

function buildStartOptions(open: string, close: string, duration: number) {
  const slots: string[] = [];
  for (
    let cursor = toMinutes(open);
    cursor + duration <= toMinutes(close);
    cursor += 30
  ) {
    slots.push(toTime(cursor));
  }
  return slots;
}

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type ConfirmAction = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => boolean | void | Promise<boolean | void>;
};

export function AdminApp({
  tab,
  selectedDate,
  dateOptions,
  clients,
  services,
  products,
  gallery,
  recurring,
  blocks,
  closedDates,
  businessHours,
  bookingsToday,
  bookingsTomorrow,
  getBookingsForDate,
  onTabChange,
  onDateChange,
  onManualBooking,
  onManualBlock,
  onAddClient,
  onAddService,
  onUpdateService,
  onRemoveService,
  onAddRecurring,
  onUpdateRecurring,
  onRemoveRecurring,
  onAddGalleryItem,
  onUpdateGalleryItem,
  onRemoveGalleryItem,
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct,
  onEditBusinessHours,
  onSaveBusinessHour,
  onAddClosedDate,
  onRemoveClosedDate,
  saving,
  onLogout,
}: {
  tab: AdminTab;
  selectedDate: string;
  dateOptions: string[];
  clients: Client[];
  services: Service[];
  products: Product[];
  gallery: GalleryItem[];
  recurring: RecurringBooking[];
  blocks: ManualBlock[];
  closedDates: string[];
  businessHours: BusinessHours;
  bookingsToday: Appointment[];
  bookingsTomorrow: Appointment[];
  getBookingsForDate: (date: string) => Appointment[];
  onTabChange: (tab: AdminTab) => void;
  onDateChange: (date: string) => void;
  onManualBooking: (
    clientName: string,
    serviceId: string,
    start: string,
  ) => boolean | void | Promise<boolean | void>;
  onManualBlock: (
    start: string,
    duration: number,
    reason: string,
  ) => boolean | void | Promise<boolean | void>;
  onAddClient: (name: string, phone: string) => void | Promise<void>;
  onAddService: (
    name: string,
    price: number,
    duration: number,
  ) => boolean | void | Promise<boolean | void>;
  onUpdateService: (
    id: string,
    payload: { name: string; price: number; duration: number },
  ) => boolean | void | Promise<boolean | void>;
  onRemoveService: (id: string) => boolean | void | Promise<boolean | void>;
  onAddRecurring: (
    clientId: string,
    serviceId: string,
    weekday: number,
    start: string,
  ) => void | Promise<void>;
  onUpdateRecurring: (
    id: string,
    payload: Omit<RecurringBooking, "id">,
  ) => void | Promise<void>;
  onRemoveRecurring: (id: string) => void | Promise<void>;
  onAddGalleryItem: (title: string, image: string) => void | Promise<void>;
  onUpdateGalleryItem: (
    id: string,
    title: string,
    image: string,
  ) => void | Promise<void>;
  onRemoveGalleryItem: (id: string) => void | Promise<void>;
  onAddProduct: (
    name: string,
    price: number,
  ) => boolean | void | Promise<boolean | void>;
  onUpdateProduct: (
    id: string,
    payload: Partial<Pick<Product, "name" | "price" | "available">>,
  ) => boolean | void | Promise<boolean | void>;
  onRemoveProduct: (id: string) => boolean | void | Promise<boolean | void>;
  onEditBusinessHours: React.Dispatch<React.SetStateAction<BusinessHours>>;
  onSaveBusinessHour: (
    weekday: number,
    hours: BusinessHours[number],
  ) => void | Promise<void>;
  onAddClosedDate: (date: string) => void | Promise<void>;
  onRemoveClosedDate: (date: string) => void | Promise<void>;
  saving?: boolean;
  onLogout: () => void;
}) {
  const [manualBookingVisible, setManualBookingVisible] = useState(false);
  const [manualBlockVisible, setManualBlockVisible] = useState(false);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [recurringModalVisible, setRecurringModalVisible] = useState(false);
  const [manualClientName, setManualClientName] = useState("Cliente sem app");
  const [manualServiceId, setManualServiceId] = useState(services[0]?.id ?? "");
  const [manualBookingStart, setManualBookingStart] = useState("09:00");
  const [blockStart, setBlockStart] = useState("12:00");
  const [blockDuration, setBlockDuration] = useState(60);
  const [blockReason, setBlockReason] = useState("Bloqueio manual");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryImage, setNewGalleryImage] = useState("");
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(
    null,
  );
  const [recurringClientId, setRecurringClientId] = useState(
    clients[0]?.id ?? "",
  );
  const [recurringServiceId, setRecurringServiceId] = useState(
    services[0]?.id ?? "",
  );
  const [recurringWeekday, setRecurringWeekday] = useState(
    weekdayOf(selectedDate),
  );
  const [recurringStart, setRecurringStart] = useState("09:00");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );
  const selectedManualService = serviceById(services, manualServiceId);
  const selectedRecurringService = serviceById(services, recurringServiceId);
  const selectedDateHours = businessHours[weekdayOf(selectedDate)];
  const selectedDateBookings = getBookingsForDate(selectedDate);
  const occupiedStarts = selectedDateBookings.map((booking) => booking.start);
  const manualBookingSlots = selectedDateHours
    ? buildStartOptions(
        selectedDateHours.open,
        selectedDateHours.close,
        selectedManualService.duration,
      ).filter((slot) => !occupiedStarts.includes(slot))
    : [];
  const blockStartOptions = selectedDateHours
    ? buildStartOptions(selectedDateHours.open, selectedDateHours.close, 30)
    : [];
  const recurringHours = businessHours[recurringWeekday];
  const recurringStartOptions = recurringHours
    ? buildStartOptions(
        recurringHours.open,
        recurringHours.close,
        selectedRecurringService.duration,
      )
    : [];
  const dashboardWeekDates = dateOptions.slice(0, 7);
  const dashboardWeekBookings = dashboardWeekDates.flatMap((date) =>
    getBookingsForDate(date),
  );

  function requestConfirmation(action: ConfirmAction) {
    setConfirmAction(action);
  }

  async function confirmPendingAction() {
    if (!confirmAction) {
      return;
    }

    const success = await confirmAction.onConfirm();
    if (success === false) {
      return;
    }
    setConfirmAction(null);
  }

  function openManualBookingModal() {
    setManualClientName("Cliente sem app");
    setManualServiceId(services[0]?.id ?? "");
    setManualBookingStart(
      manualBookingSlots[0] ?? selectedDateHours?.open ?? "09:00",
    );
    setManualBookingVisible(true);
  }

  function openManualBlockModal() {
    setBlockStart(blockStartOptions[0] ?? selectedDateHours?.open ?? "09:00");
    setBlockDuration(60);
    setBlockReason("Bloqueio manual");
    setManualBlockVisible(true);
  }

  function openClientModal() {
    setNewClientName("");
    setNewClientPhone("");
    setClientModalVisible(true);
  }

  function openServiceModal(service?: Service) {
    setEditingServiceId(service?.id ?? null);
    setNewServiceName(service?.name ?? "");
    setNewServicePrice(service ? String(service.price).replace(".", ",") : "");
    setNewServiceDuration(service ? String(service.duration) : "");
    setServiceModalVisible(true);
  }

  function openRecurringModal(item?: RecurringBooking) {
    if (item) {
      const service = serviceById(services, item.serviceId);
      const hours = businessHours[item.weekday];
      setEditingRecurringId(item.id);
      setRecurringClientId(item.clientId);
      setRecurringServiceId(item.serviceId);
      setRecurringWeekday(item.weekday);
      setRecurringStart(
        hours
          ? buildStartOptions(
              hours.open,
              hours.close,
              service.duration,
            ).includes(item.start)
            ? item.start
            : hours.open
          : item.start,
      );
      setRecurringModalVisible(true);
      return;
    }

    const nextWeekday = weekdayOf(selectedDate);
    const nextServiceId = services[0]?.id ?? "";
    const nextService = serviceById(services, nextServiceId);
    const hours = businessHours[nextWeekday];
    setEditingRecurringId(null);
    setRecurringClientId(clients[0]?.id ?? "");
    setRecurringServiceId(nextServiceId);
    setRecurringWeekday(nextWeekday);
    setRecurringStart(
      hours
        ? (buildStartOptions(
            hours.open,
            hours.close,
            nextService.duration,
          )[0] ?? hours.open)
        : "09:00",
    );
    setRecurringModalVisible(true);
  }

  function openProductModal(product?: Product) {
    setEditingProductId(product?.id ?? null);
    setNewProductName(product?.name ?? "");
    setNewProductPrice(product ? String(product.price).replace(".", ",") : "");
    setProductModalVisible(true);
  }

  function openGalleryModal(item?: GalleryItem) {
    setEditingGalleryId(item?.id ?? null);
    setNewGalleryTitle(item?.title ?? "");
    setNewGalleryImage(item?.image ?? "");
    setGalleryModalVisible(true);
  }

  async function pickGalleryImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Autorize o acesso á galeria para selecionar uma foto.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled) {
      setNewGalleryImage(result.assets[0]?.uri ?? "");
    }
  }

  async function confirmManualBooking() {
    if (saving) {
      return;
    }

    const success = await onManualBooking(
      manualClientName.trim() || "Cliente sem app",
      manualServiceId,
      manualBookingStart,
    );
    if (success === false) {
      return;
    }

    setManualBookingVisible(false);
  }

  async function confirmManualBlock() {
    if (saving) {
      return;
    }

    const success = await onManualBlock(
      blockStart,
      blockDuration,
      blockReason.trim() || "Bloqueio manual",
    );
    if (success === false) {
      return;
    }

    setManualBlockVisible(false);
  }

  async function confirmClient() {
    const name = newClientName.trim();
    const phone = newClientPhone.trim();

    if (!name || !phone) {
      return;
    }

    await onAddClient(name, phone);
    setClientModalVisible(false);
  }

  async function confirmNewService() {
    if (saving) {
      return;
    }

    const name = newServiceName.trim();
    const price = Number(newServicePrice.replace(",", "."));
    const duration = Number(newServiceDuration);

    if (
      !name ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return;
    }

    const success = editingServiceId
      ? await onUpdateService(editingServiceId, {
          name,
          price,
          duration: Math.round(duration),
        })
      : await onAddService(name, price, Math.round(duration));

    if (success === false) {
      return;
    }

    setServiceModalVisible(false);
  }

  async function confirmProduct() {
    if (saving) {
      return;
    }

    const name = newProductName.trim();
    const price = Number(newProductPrice.replace(",", "."));

    if (!name || !Number.isFinite(price) || price <= 0) {
      return;
    }

    const success = editingProductId
      ? await onUpdateProduct(editingProductId, { name, price })
      : await onAddProduct(name, price);

    if (success === false) {
      return;
    }

    setProductModalVisible(false);
  }

  async function confirmGalleryItem() {
    const title = newGalleryTitle.trim();
    const image = newGalleryImage.trim();

    if (!title || !image) {
      return;
    }

    if (editingGalleryId) {
      await onUpdateGalleryItem(editingGalleryId, title, image);
    } else {
      await onAddGalleryItem(title, image);
    }

    setGalleryModalVisible(false);
  }

  async function confirmRecurring() {
    if (!recurringClientId || !recurringServiceId || !recurringStart) {
      return;
    }

    if (editingRecurringId) {
      await onUpdateRecurring(editingRecurringId, {
        clientId: recurringClientId,
        serviceId: recurringServiceId,
        weekday: recurringWeekday,
        start: recurringStart,
        active: true,
      });
    } else {
      await onAddRecurring(
        recurringClientId,
        recurringServiceId,
        recurringWeekday,
        recurringStart,
      );
    }

    setEditingRecurringId(null);
    setRecurringModalVisible(false);
  }

  function requestRemoveService(service: Service) {
    requestConfirmation({
      title: "Excluir serviço?",
      message: `Tem certeza que deseja excluir "${service.name}"? Essa ação remove o serviço do cadastro.`,
      confirmLabel: "Excluir",
      onConfirm: () => onRemoveService(service.id),
    });
  }

  function requestRemoveRecurring(item: RecurringBooking) {
    const client = clients.find((candidate) => candidate.id === item.clientId);
    requestConfirmation({
      title: "Excluir agendamento fixo?",
      message: `Tem certeza que deseja excluir o horário fixo de ${client?.name ?? "cliente"}? Ele deixará de bloquear a agenda semanal.`,
      confirmLabel: "Excluir",
      onConfirm: () => onRemoveRecurring(item.id),
    });
  }

  function requestRemoveGalleryItem(item: GalleryItem) {
    requestConfirmation({
      title: "Remover imagem?",
      message: `Tem certeza que deseja remover "${item.title}" do portfólio?`,
      confirmLabel: "Remover",
      onConfirm: () => onRemoveGalleryItem(item.id),
    });
  }

  function requestRemoveProduct(product: Product) {
    requestConfirmation({
      title: "Excluir produto?",
      message: `Tem certeza que deseja excluir "${product.name}" da loja?`,
      confirmLabel: "Excluir",
      onConfirm: () => onRemoveProduct(product.id),
    });
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {tab === "dashboard" ? (
          <AdminDashboardSection
            todayDate={dateOptions[0]}
            weekDates={dashboardWeekDates}
            bookingsToday={bookingsToday}
            bookingsWeek={dashboardWeekBookings}
            recurring={recurring}
            services={services}
            blocks={blocks}
            businessHours={businessHours}
            closedDates={closedDates}
            onTabChange={onTabChange}
          />
        ) : null}

        {tab === "more" ? (
          <AdminMoreSection onTabChange={onTabChange} onLogout={onLogout} />
        ) : null}

        {tab === "schedule" ? (
          <>
            <SectionTitle title="Agenda administrativa" />
            <AdminCalendar
              selectedDate={selectedDate}
              onSelect={onDateChange}
            />
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={openManualBookingModal}
              >
                <Text style={styles.secondaryButtonText}>Agendar balcão</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={openManualBlockModal}
              >
                <Text style={styles.secondaryButtonText}>Bloquear horário</Text>
              </TouchableOpacity>
            </View>
            <AdminAgendaList
              selectedDate={selectedDate}
              services={services}
              blocks={blocks}
              closedDates={closedDates}
              businessHours={businessHours}
              getBookingsForDate={getBookingsForDate}
            />
          </>
        ) : null}

        {tab === "clients" ? (
          <AdminClientsSection
            clients={clients}
            onAddClient={openClientModal}
          />
        ) : null}

        {tab === "services" ? (
          <AdminServicesSection
            services={services}
            onOpenService={openServiceModal}
            onRequestRemoveService={requestRemoveService}
          />
        ) : null}

        {tab === "recurring" ? (
          <AdminRecurringSection
            recurring={recurring}
            clients={clients}
            services={services}
            onOpenRecurring={openRecurringModal}
            onRequestRemoveRecurring={requestRemoveRecurring}
          />
        ) : null}

        {tab === "gallery" ? (
          <AdminGallerySection
            gallery={gallery}
            onOpenGallery={openGalleryModal}
            onRequestRemoveGalleryItem={requestRemoveGalleryItem}
          />
        ) : null}

        {tab === "products" ? (
          <AdminProductsSection
            products={products}
            onOpenProduct={openProductModal}
            onToggleProductAvailability={(product) =>
              onUpdateProduct(product.id, { available: !product.available })
            }
            onRequestRemoveProduct={requestRemoveProduct}
          />
        ) : null}

        {tab === "settings" ? (
          <AdminSettings
            selectedDate={selectedDate}
            businessHours={businessHours}
            closedDates={closedDates}
            onEditBusinessHours={onEditBusinessHours}
            onSaveBusinessHour={onSaveBusinessHour}
            onAddClosedDate={onAddClosedDate}
            onRemoveClosedDate={onRemoveClosedDate}
            onRequestConfirmation={requestConfirmation}
          />
        ) : null}
      </ScrollView>
      <BottomTabs
        tabs={[
          ["dashboard", "Dashboard", "stats-chart"],
          ["schedule", "Agenda", "calendar"],
          ["clients", "Clientes", "people"],
          ["more", "Mais", "ellipsis-horizontal"],
        ]}
        active={
          ["services", "recurring", "gallery", "products", "settings"].includes(
            tab,
          )
            ? "more"
            : tab
        }
        onChange={(value) => onTabChange(value as AdminTab)}
      />
      <ClientModal
        visible={clientModalVisible}
        name={newClientName}
        phone={newClientPhone}
        onChangeName={setNewClientName}
        onChangePhone={setNewClientPhone}
        onConfirm={confirmClient}
        onClose={() => setClientModalVisible(false)}
      />
      <RecurringModal
        visible={recurringModalVisible}
        editingRecurringId={editingRecurringId}
        clients={clients}
        services={services}
        businessHours={businessHours}
        recurringClientId={recurringClientId}
        recurringServiceId={recurringServiceId}
        recurringWeekday={recurringWeekday}
        recurringStart={recurringStart}
        recurringStartOptions={recurringStartOptions}
        selectedRecurringServiceDuration={selectedRecurringService.duration}
        onSelectClient={setRecurringClientId}
        onSelectService={(service) => {
          setRecurringServiceId(service.id);
          const hours = businessHours[recurringWeekday];
          setRecurringStart(
            hours
              ? (buildStartOptions(
                  hours.open,
                  hours.close,
                  service.duration,
                )[0] ?? hours.open)
              : "09:00",
          );
        }}
        onSelectWeekday={(weekday, nextStart) => {
          setRecurringWeekday(weekday);
          setRecurringStart(nextStart);
        }}
        onSelectStart={setRecurringStart}
        onConfirm={confirmRecurring}
        onClose={() => {
          setEditingRecurringId(null);
          setRecurringModalVisible(false);
        }}
      />
      <ServiceModal
        visible={serviceModalVisible}
        editingServiceId={editingServiceId}
        name={newServiceName}
        price={newServicePrice}
        duration={newServiceDuration}
        onChangeName={setNewServiceName}
        onChangePrice={setNewServicePrice}
        onChangeDuration={setNewServiceDuration}
        saving={saving}
        onConfirm={confirmNewService}
        onClose={() => setServiceModalVisible(false)}
      />
      <ProductModal
        visible={productModalVisible}
        editingProductId={editingProductId}
        name={newProductName}
        price={newProductPrice}
        onChangeName={setNewProductName}
        onChangePrice={setNewProductPrice}
        saving={saving}
        onConfirm={confirmProduct}
        onClose={() => setProductModalVisible(false)}
      />
      <GalleryModal
        visible={galleryModalVisible}
        editingGalleryId={editingGalleryId}
        title={newGalleryTitle}
        image={newGalleryImage}
        onChangeTitle={setNewGalleryTitle}
        onPickImage={pickGalleryImage}
        onConfirm={confirmGalleryItem}
        onClose={() => setGalleryModalVisible(false)}
      />
      <ManualBookingModal
        visible={manualBookingVisible}
        selectedDate={selectedDate}
        services={services}
        selectedDateHours={selectedDateHours}
        occupiedStarts={occupiedStarts}
        clientName={manualClientName}
        serviceId={manualServiceId}
        bookingStart={manualBookingStart}
        bookingSlots={manualBookingSlots}
        onChangeClientName={setManualClientName}
        onSelectService={(serviceId, nextStart) => {
          setManualServiceId(serviceId);
          setManualBookingStart(nextStart);
        }}
        onSelectStart={setManualBookingStart}
        saving={saving}
        onConfirm={confirmManualBooking}
        onClose={() => setManualBookingVisible(false)}
      />
      <ManualBlockModal
        visible={manualBlockVisible}
        selectedDate={selectedDate}
        reason={blockReason}
        start={blockStart}
        duration={blockDuration}
        startOptions={blockStartOptions}
        onChangeReason={setBlockReason}
        onSelectStart={setBlockStart}
        onSelectDuration={setBlockDuration}
        saving={saving}
        onConfirm={confirmManualBlock}
        onClose={() => setManualBlockVisible(false)}
      />
      <ConfirmActionModal
        visible={Boolean(confirmAction)}
        title={confirmAction?.title ?? ""}
        message={confirmAction?.message ?? ""}
        confirmLabel={confirmAction?.confirmLabel}
        onConfirm={confirmPendingAction}
        onClose={() => setConfirmAction(null)}
      />
    </>
  );
}

function AdminCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  function openNativeCalendar() {
    if (Platform.OS !== "android") {
      return;
    }

    DateTimePickerAndroid.open({
      value: new Date(`${selectedDate}T12:00:00`),
      mode: "date",
      display: "calendar",
      onChange: (_event, date) => {
        if (!date) {
          return;
        }

        onSelect(toLocalIsoDate(date));
      },
    });
  }

  return (
    <TouchableOpacity
      style={styles.adminCalendarInput}
      onPress={openNativeCalendar}
    >
      <View>
        <Text style={styles.adminCalendarInputLabel}>Dia da agenda</Text>
        <Text style={styles.adminCalendarInputValue}>
          {dateLabel(selectedDate)}
        </Text>
      </View>
      <Text style={styles.adminCalendarInputAction}>Alterar</Text>
    </TouchableOpacity>
  );
}

function AdminSettings({
  selectedDate,
  businessHours,
  closedDates,
  onEditBusinessHours,
  onSaveBusinessHour,
  onAddClosedDate,
  onRemoveClosedDate,
  onRequestConfirmation,
}: {
  selectedDate: string;
  businessHours: BusinessHours;
  closedDates: string[];
  onEditBusinessHours: React.Dispatch<React.SetStateAction<BusinessHours>>;
  onSaveBusinessHour: (
    weekday: number,
    hours: BusinessHours[number],
  ) => void | Promise<void>;
  onAddClosedDate: (date: string) => void | Promise<void>;
  onRemoveClosedDate: (date: string) => void | Promise<void>;
  onRequestConfirmation: (action: ConfirmAction) => void;
}) {
  const weekdays = [1, 2, 3, 4, 5, 6, 0];
  const [newClosedDate, setNewClosedDate] = useState(selectedDate);
  const newClosedDateIsRegistered = closedDates.includes(newClosedDate);

  function toggleWeekday(weekday: number) {
    const nextHours = businessHours[weekday]
      ? null
      : { open: "09:00", close: "18:00" };
    onEditBusinessHours((current) => ({
      ...current,
      [weekday]: nextHours,
    }));
    void onSaveBusinessHour(weekday, nextHours);
  }

  function requestToggleWeekday(weekday: number) {
    const hours = businessHours[weekday];

    if (!hours) {
      toggleWeekday(weekday);
      return;
    }

    onRequestConfirmation({
      title: "Fechar expediente?",
      message: `Tem certeza que deseja fechar ${weekdayName(weekday)}? Esse dia deixará de aparecer para clientes.`,
      confirmLabel: "Fechar",
      onConfirm: () => toggleWeekday(weekday),
    });
  }

  function updateWeekdayHour(
    weekday: number,
    field: "open" | "close",
    value: string,
  ) {
    onEditBusinessHours((current) => {
      const hours = current[weekday] ?? { open: "09:00", close: "18:00" };
      return {
        ...current,
        [weekday]: {
          ...hours,
          [field]: value,
        },
      };
    });
  }

  function saveWeekdayHour(weekday: number) {
    void onSaveBusinessHour(weekday, businessHours[weekday]);
  }

  function openClosedDatePicker() {
    if (Platform.OS !== "android") {
      return;
    }

    DateTimePickerAndroid.open({
      value: new Date(`${newClosedDate}T12:00:00`),
      mode: "date",
      display: "calendar",
      onChange: (_event, date) => {
        if (!date) {
          return;
        }

        setNewClosedDate(toLocalIsoDate(date));
      },
    });
  }

  function registerClosedDate() {
    void onAddClosedDate(newClosedDate);
  }

  function requestRemoveClosedDate(date: string) {
    onRequestConfirmation({
      title: "Remover fechamento?",
      message: `Tem certeza que deseja remover o fechamento de ${dateLabel(date)}? A data voltará a aparecer para clientes se houver expediente configurado.`,
      confirmLabel: "Remover",
      onConfirm: () => onRemoveClosedDate(date),
    });
  }

  return (
    <>
      <SectionTitle title="Configurações" />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Funcionamento semanal</Text>
        <Text style={styles.cardText}>
          Defina os dias abertos e o expediente usado para calcular horários
          livres.
        </Text>
        {weekdays.map((weekday) => {
          const hours = businessHours[weekday];
          return (
            <View key={weekday} style={styles.settingsRow}>
              <View style={styles.settingsRowHeader}>
                <View>
                  <Text style={styles.cardTitle}>{weekdayName(weekday)}</Text>
                  <Text style={styles.cardText}>
                    {hours ? `${hours.open} - ${hours.close}` : "Fechado"}
                  </Text>
                </View>
                <MiniButton
                  label={hours ? "Fechar" : "Abrir"}
                  danger={Boolean(hours)}
                  onPress={() => requestToggleWeekday(weekday)}
                />
              </View>
              {hours ? (
                <View style={styles.settingsTimeRow}>
                  <TextInput
                    value={hours.open}
                    onChangeText={(value) =>
                      updateWeekdayHour(weekday, "open", value)
                    }
                    onEndEditing={() => saveWeekdayHour(weekday)}
                    placeholder="09:00"
                    placeholderTextColor="#b59f82"
                    style={[styles.input, styles.settingsTimeInput]}
                  />
                  <TextInput
                    value={hours.close}
                    onChangeText={(value) =>
                      updateWeekdayHour(weekday, "close", value)
                    }
                    onEndEditing={() => saveWeekdayHour(weekday)}
                    placeholder="18:00"
                    placeholderTextColor="#b59f82"
                    style={[styles.input, styles.settingsTimeInput]}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fechamentos e feriados</Text>
        <Text style={styles.cardText}>
          Cadastre dias do mês em que o estabelecimento ficará¡ fechado para
          clientes.
        </Text>
        <View style={styles.closedDatePickerRow}>
          <TouchableOpacity
            style={[styles.adminCalendarInput, styles.closedDateInput]}
            onPress={openClosedDatePicker}
          >
            <View>
              <Text style={styles.adminCalendarInputLabel}>
                Data do fechamento
              </Text>
              <Text style={styles.adminCalendarInputValue}>
                {dateLabel(newClosedDate)}
              </Text>
            </View>
            <Text style={styles.adminCalendarInputAction}>Alterar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              newClosedDateIsRegistered && styles.primaryButtonDisabled,
            ]}
            onPress={newClosedDateIsRegistered ? undefined : registerClosedDate}
          >
            <Text style={styles.primaryButtonText}>
              {newClosedDateIsRegistered ? "Já cadastrado" : "Cadastrar"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.settingsRowHeader}>
          <View>
            <Text style={styles.cardTitle}>Fechamentos cadastrados</Text>
            <Text style={styles.cardText}>
              {closedDates.length}{" "}
              {closedDates.length === 1 ? "dia fechado" : "dias fechados"}
            </Text>
          </View>
        </View>
        {closedDates.length > 0 ? (
          <View style={styles.closedDatesList}>
            {closedDates.map((date) => (
              <View key={date} style={styles.closedDateRow}>
                <Text style={styles.cardText}>{dateLabel(date)}</Text>
                <MiniButton
                  label="Remover"
                  danger
                  onPress={() => requestRemoveClosedDate(date)}
                />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState text="Nenhum fechamento cadastrado." />
        )}
      </View>
    </>
  );
}

function AdminAgendaList({
  selectedDate,
  services,
  blocks,
  closedDates,
  businessHours,
  getBookingsForDate,
}: {
  selectedDate: string;
  services: Service[];
  blocks: ManualBlock[];
  closedDates: string[];
  businessHours: BusinessHours;
  getBookingsForDate: (date: string) => Appointment[];
}) {
  const visibleDates = [selectedDate];
  return (
    <View>
      {visibleDates.map((date) => {
        const items = getBookingsForDate(date);
        const dayBlocks = blocks.filter((block) => block.date === date);
        const hours = businessHours[weekdayOf(date)];
        const isClosed = closedDates.includes(date) || !hours;
        const bookedMinutes = items.reduce(
          (total, appointment) =>
            total +
            Math.max(
              0,
              toMinutes(appointment.end) - toMinutes(appointment.start),
            ),
          0,
        );
        const blockedMinutes = dayBlocks.reduce(
          (total, block) =>
            total + Math.max(0, toMinutes(block.end) - toMinutes(block.start)),
          0,
        );
        const workMinutes = hours
          ? Math.max(0, toMinutes(hours.close) - toMinutes(hours.open))
          : 0;
        const busyPercent = workMinutes
          ? Math.min(
              100,
              Math.round(
                ((bookedMinutes + blockedMinutes) / workMinutes) * 100,
              ),
            )
          : 0;
        const timeline = hours
          ? buildAdminTimeline(hours.open, hours.close, items, dayBlocks)
          : [];

        return (
          <View key={date} style={[styles.dayPanel, styles.dayPanelFeatured]}>
            <View style={styles.adminAgendaHero}>
              <View>
                <Text style={styles.dayTitle}>{dateLabel(date)}</Text>
                <Text style={styles.dayMeta}>
                  {hours ? `${hours.open} - ${hours.close}` : "Fechado"}
                </Text>
              </View>
              <View style={styles.adminAgendaCounter}>
                <Text style={styles.adminAgendaCounterValue}>
                  {items.length}
                </Text>
                <Text style={styles.adminAgendaCounterLabel}>atend.</Text>
              </View>
            </View>
            <View style={styles.adminAgendaSummary}>
              <Text style={styles.adminAgendaSummaryText}>
                {items.length} atendimentos
              </Text>
              <Text style={styles.adminAgendaSummaryMuted}>
                {busyPercent}% ocupado
              </Text>
              {dayBlocks.length > 0 ? (
                <Text style={styles.adminAgendaSummaryMuted}>
                  {dayBlocks.length} bloqueios
                </Text>
              ) : null}
            </View>
            {isClosed ? (
              <InfoRow
                title="Dia fechado / feriado"
                detail="Nao aparece para clientes"
                icon="lock-closed"
              />
            ) : null}
            {!isClosed ? (
              <View style={styles.timelineList}>
                {timeline.map((slot) => {
                  if (slot.type === "appointment" && slot.appointment) {
                    const service = serviceById(
                      services,
                      slot.appointment.serviceId,
                    );
                    return (
                      <View
                        key={slot.key}
                        style={[styles.timelineItem, styles.timelineItemBusy]}
                      >
                        <View style={styles.timelineTimeRail}>
                          <Text style={styles.timelineTime}>{slot.start}</Text>
                          <View style={styles.timelineDot} />
                        </View>
                        <View style={styles.timelineContent}>
                          <View style={styles.cardTop}>
                            <Text style={styles.cardTitle}>
                              {slot.appointment.clientName}
                            </Text>
                            <Text style={styles.timelineBadge}>
                              {slot.appointment.source === "recurring"
                                ? "Fixo"
                                : slot.appointment.source === "manual"
                                  ? "Manual"
                                  : "App"}
                            </Text>
                          </View>
                          <Text style={styles.cardText}>
                            {service.name} - {slot.start} ás {slot.end}
                          </Text>
                          <Text style={styles.price}>
                            {money(service.price)}
                          </Text>
                        </View>
                      </View>
                    );
                  }

                  if (slot.type === "block" && slot.block) {
                    return (
                      <View
                        key={slot.key}
                        style={[
                          styles.timelineItem,
                          styles.timelineItemBlocked,
                        ]}
                      >
                        <View style={styles.timelineTimeRail}>
                          <Text style={styles.timelineTime}>{slot.start}</Text>
                          <View style={styles.timelineDotMuted} />
                        </View>
                        <View style={styles.timelineContent}>
                          <Text style={styles.cardTitle}>
                            Horário bloqueado
                          </Text>
                          <Text style={styles.cardText}>
                            {slot.block.reason} - {slot.start} ás {slot.end}
                          </Text>
                        </View>
                      </View>
                    );
                  }

                  return (
                    <View key={slot.key} style={styles.timelineFreeRow}>
                      <Text style={styles.timelineFreeTime}>{slot.start}</Text>
                      <Text style={styles.timelineFreeText}>Livre</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function buildAdminTimeline(
  open: string,
  close: string,
  appointments: Appointment[],
  blocks: ManualBlock[],
) {
  const rows: {
    key: string;
    type: "appointment" | "block" | "free";
    start: string;
    end: string;
    appointment?: Appointment;
    block?: ManualBlock;
  }[] = [];

  for (let cursor = toMinutes(open); cursor < toMinutes(close); cursor += 30) {
    const start = toTime(cursor);
    const end = toTime(Math.min(cursor + 30, toMinutes(close)));
    const appointment = appointments.find(
      (item) => toMinutes(item.start) <= cursor && cursor < toMinutes(item.end),
    );
    const block = blocks.find(
      (item) => toMinutes(item.start) <= cursor && cursor < toMinutes(item.end),
    );

    if (appointment) {
      rows.push({
        key: `appointment-${appointment.id}-${start}`,
        type: "appointment",
        start,
        end: appointment.end,
        appointment,
      });
      cursor = toMinutes(appointment.end) - 30;
      continue;
    }

    if (block) {
      rows.push({
        key: `block-${block.id}-${start}`,
        type: "block",
        start,
        end: block.end,
        block,
      });
      cursor = toMinutes(block.end) - 30;
      continue;
    }

    rows.push({
      key: `free-${start}`,
      type: "free",
      start,
      end: addMinutes(start, 30),
    });
  }

  return rows;
}
