import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Header } from "./src/components/common";
import { businessHours as initialBusinessHours, closedDates as initialClosedDates, initialAppointments, initialBlocks, initialClients, initialGallery, initialProducts, initialRecurring, initialServices } from "./src/data/mockData";
import { AdminApp } from "./src/screens/AdminApp";
import { AuthScreen, type AuthMode } from "./src/screens/AuthScreen";
import { ClientApp } from "./src/screens/ClientApp";
import {
  createClient as createClientRequest,
  createAppointment as createAppointmentRequest,
  createClosedDate as createClosedDateRequest,
  createGalleryItem as createGalleryItemRequest,
  createManualBlock as createManualBlockRequest,
  createProduct as createProductRequest,
  createRecurringBooking as createRecurringBookingRequest,
  createService as createServiceRequest,
  deleteAppointment as deleteAppointmentRequest,
  deleteClosedDate as deleteClosedDateRequest,
  deleteGalleryItem as deleteGalleryItemRequest,
  deleteProduct as deleteProductRequest,
  deleteRecurringBooking as deleteRecurringBookingRequest,
  deleteService as deleteServiceRequest,
  rescheduleAppointment as rescheduleAppointmentRequest,
  updateBusinessHour as updateBusinessHourRequest,
  updateGalleryItem as updateGalleryItemRequest,
  updateProduct as updateProductRequest,
  updateRecurringBooking as updateRecurringBookingRequest,
  updateService as updateServiceRequest
} from "./src/services/adminApi";
import { apiRequest, type AuthResponse } from "./src/services/api";
import { loadAppData, type AppData } from "./src/services/appData";
import { styles } from "./src/theme";
import type { AdminTab, Appointment, BusinessHours, ClientTab, GalleryItem, Product, RecurringBooking, Role, Service } from "./src/types";
import { isoForOffset, weekdayOf } from "./src/utils/date";
import { addMinutes } from "./src/utils/time";
import { canUseSlot, getAvailableSlots, getBookingsForDate, serviceById } from "./src/utils/schedule";

export default function App() {
  const [logged, setLogged] = useState(false);
  const [role, setRole] = useState<Role>("client");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [clientTab, setClientTab] = useState<ClientTab>("home");
  const [adminTab, setAdminTab] = useState<AdminTab>("dashboard");
  const [selectedDate, setSelectedDate] = useState(isoForOffset(0));
  const [selectedServiceId, setSelectedServiceId] = useState("s1");
  const [clients, setClients] = useState(initialClients);
  const [services, setServices] = useState(initialServices);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [recurring, setRecurring] = useState(initialRecurring);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(initialBusinessHours);
  const [closedDates, setClosedDates] = useState<string[]>(initialClosedDates);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authClientId, setAuthClientId] = useState<string | null>(null);

  const currentClient = clients.find((client) => client.id === authClientId) ?? clients[0];
  const selectedService = serviceById(services, selectedServiceId);
  const dateOptions = useMemo(() => Array.from({ length: 10 }, (_, index) => isoForOffset(index)), []);

  const bookingsForSelectedDate = readBookingsForDate(selectedDate);
  const availableSlots = readAvailableSlots(selectedDate, selectedService);
  const clientAppointments = currentClient ? dateOptions
    .flatMap((date) => readBookingsForDate(date))
    .filter((appointment) => appointment.clientId === currentClient.id)
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)) : [];

  function readBookingsForDate(date: string) {
    return getBookingsForDate(date, appointments, recurring, services, clients);
  }

  function readAvailableSlots(date: string, service: Service) {
    return getAvailableSlots({
      date,
      service,
      businessHours,
      closedDates,
      appointments,
      recurring,
      services,
      clients,
      blocks
    });
  }

  function slotIsAvailable(date: string, start: string, service: Service) {
    return canUseSlot({
      date,
      start,
      service,
      businessHours,
      closedDates,
      appointments,
      recurring,
      services,
      clients,
      blocks
    });
  }

  async function bookSlot(start: string, manualClient?: string, serviceId = selectedService.id) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    const service = serviceById(services, serviceId);
    const client = currentClient;
    if (!manualClient && !client) {
      notify("Cliente não encontrado", "Entre novamente para agendar.");
      return;
    }

    if (!slotIsAvailable(selectedDate, start, service)) {
      notify("Horario indisponivel", "Esse horario ja foi ocupado ou bloqueado.");
      return;
    }

    try {
      const appointment = await createAppointmentRequest(token, {
        date: selectedDate,
        start,
        serviceId: service.id,
        clientId: manualClient ? undefined : client?.id,
        clientName: manualClient,
        source: manualClient ? "manual" : "app"
      });
      setAppointments((current) => [...current, appointment]);
      notify("Agendamento confirmado", `${service.name} em ${selectedDate} as ${start}.`);
    } catch (error) {
      notify("Erro ao agendar", error instanceof Error ? error.message : "Nao foi possivel criar o agendamento.");
    }
  }

  async function cancelAppointment(id: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      await deleteAppointmentRequest(token, id);
      setAppointments((current) => current.filter((appointment) => appointment.id !== id));
      notify("Agendamento cancelado", "O horário foi removido da agenda.");
    } catch (error) {
      notify("Erro ao cancelar", error instanceof Error ? error.message : "Nao foi possivel cancelar o agendamento.");
    }
  }

  async function rescheduleAppointment(id: string, date: string, start: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    const appointment = appointments.find((item) => item.id === id);
    if (!appointment) {
      return;
    }

    const service = serviceById(services, appointment.serviceId);

    if (!canUseSlot({
      date,
      start,
      service,
      businessHours,
      closedDates,
      appointments: appointments.filter((item) => item.id !== id),
      recurring,
      services,
      clients,
      blocks
    })) {
      notify("Horario indisponivel", "Esse horario ja foi ocupado ou bloqueado.");
      return;
    }

    try {
      const updated = await rescheduleAppointmentRequest(token, id, { date, start });
      setAppointments((current) => current.map((item) => item.id === id ? updated : item));
      notify("Agendamento remarcado", `${service.name} em ${date} as ${start}.`);
    } catch (error) {
      notify("Erro ao remarcar", error instanceof Error ? error.message : "Nao foi possivel remarcar o agendamento.");
    }
  }

  async function addManualBlock(start: string, duration: number, reason: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const end = addMinutes(start, duration);
      const block = await createManualBlockRequest(token, { date: selectedDate, start, end, reason });
      setBlocks((current) => [...current, block]);
      notify("Horário bloqueado", "O bloqueio foi salvo na agenda.");
    } catch (error) {
      notify("Erro ao bloquear", error instanceof Error ? error.message : "Nao foi possivel bloquear o horário.");
    }
  }

  async function addRecurring(clientId: string, serviceId: string, weekday: number, start: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    const candidate: RecurringBooking = {
      id: "",
      clientId,
      serviceId,
      weekday,
      start,
      active: true
    };
    const sampleDate = dateOptions.find((date) => weekdayOf(date) === candidate.weekday);
    const service = serviceById(services, candidate.serviceId);
    if (sampleDate && !slotIsAvailable(sampleDate, candidate.start, service)) {
      notify("Conflito detectado", "Esse horario fixo conflita com agenda, bloqueio ou recorrencia existente.");
      return;
    }

    try {
      const created = await createRecurringBookingRequest(token, {
        clientId,
        serviceId,
        weekday,
        start,
        active: true
      });
      setRecurring((current) => [...current, created]);
      notify("Agendamento fixo criado", "O horário semanal foi salvo.");
    } catch (error) {
      notify("Erro ao criar fixo", error instanceof Error ? error.message : "Nao foi possivel criar o agendamento fixo.");
    }
  }

  async function editRecurring(id: string, payload: Omit<RecurringBooking, "id">) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const updated = await updateRecurringBookingRequest(token, id, payload);
      setRecurring((current) => current.map((item) => item.id === id ? updated : item));
      notify("Agendamento fixo atualizado", "O horário semanal foi salvo.");
    } catch (error) {
      notify("Erro ao editar fixo", error instanceof Error ? error.message : "Nao foi possivel editar o agendamento fixo.");
    }
  }

  async function removeRecurring(id: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      await deleteRecurringBookingRequest(token, id);
      setRecurring((current) => current.filter((item) => item.id !== id));
      notify("Agendamento fixo excluído", "O horário semanal foi removido.");
    } catch (error) {
      notify("Erro ao excluir fixo", error instanceof Error ? error.message : "Nao foi possivel excluir o agendamento fixo.");
    }
  }

  async function addGalleryItem(title: string, image: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const item = await createGalleryItemRequest(token, { title, image });
      setGallery((current) => [item, ...current]);
      notify("Imagem adicionada", `${item.title} foi adicionada ao portfólio.`);
    } catch (error) {
      notify("Erro ao salvar", error instanceof Error ? error.message : "Nao foi possivel adicionar a imagem.");
    }
  }

  async function editGalleryItem(id: string, title: string, image: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const item = await updateGalleryItemRequest(token, id, { title, image });
      setGallery((current) => current.map((galleryItem) => galleryItem.id === id ? item : galleryItem));
      notify("Imagem atualizada", `${item.title} foi salva.`);
    } catch (error) {
      notify("Erro ao salvar", error instanceof Error ? error.message : "Nao foi possivel editar a imagem.");
    }
  }

  async function removeGalleryItem(id: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      await deleteGalleryItemRequest(token, id);
      setGallery((current) => current.filter((item) => item.id !== id));
      notify("Imagem removida", "A imagem foi removida do portfólio.");
    } catch (error) {
      notify("Erro ao remover", error instanceof Error ? error.message : "Nao foi possivel remover a imagem.");
    }
  }

  async function saveBusinessHour(weekday: number, hours: BusinessHours[number]) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const updated = await updateBusinessHourRequest(token, weekday, hours);
      setBusinessHours(updated);
    } catch (error) {
      notify("Erro ao salvar horário", error instanceof Error ? error.message : "Nao foi possivel salvar o expediente.");
    }
  }

  async function addClosedDate(date: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const updated = await createClosedDateRequest(token, date);
      setClosedDates(updated);
      notify("Fechamento cadastrado", "A data não aparecerá para clientes.");
    } catch (error) {
      notify("Erro ao cadastrar fechamento", error instanceof Error ? error.message : "Nao foi possivel cadastrar o fechamento.");
    }
  }

  async function removeClosedDate(date: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const updated = await deleteClosedDateRequest(token, date);
      setClosedDates(updated);
      notify("Fechamento removido", "A data voltou a seguir o expediente configurado.");
    } catch (error) {
      notify("Erro ao remover fechamento", error instanceof Error ? error.message : "Nao foi possivel remover o fechamento.");
    }
  }

  async function createClient(name: string, phone: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const client = await createClientRequest(token, name, phone);
      setClients((current) => [...current, client]);
      notify("Cliente cadastrado", `${client.name} foi adicionado.`);
    } catch (error) {
      notify("Erro ao cadastrar", error instanceof Error ? error.message : "Nao foi possivel cadastrar o cliente.");
    }
  }

  async function createService(name: string, price: number, duration: number) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const service = await createServiceRequest(token, { name, price, duration, active: true });
      setServices((current) => [...current, service]);
      notify("Serviço cadastrado", `${service.name} foi adicionado.`);
    } catch (error) {
      notify("Erro ao salvar", error instanceof Error ? error.message : "Nao foi possivel cadastrar o serviço.");
    }
  }

  async function editService(id: string, payload: { name: string; price: number; duration: number }) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const service = await updateServiceRequest(token, id, payload);
      setServices((current) => current.map((item) => item.id === id ? service : item));
      notify("Serviço atualizado", `${service.name} foi salvo.`);
    } catch (error) {
      notify("Erro ao salvar", error instanceof Error ? error.message : "Nao foi possivel editar o serviço.");
    }
  }

  async function removeService(id: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      await deleteServiceRequest(token, id);
      setServices((current) => current.filter((service) => service.id !== id));
      notify("Serviço excluído", "O serviço foi removido.");
    } catch (error) {
      notify("Erro ao excluir", error instanceof Error ? error.message : "Nao foi possivel excluir o serviço.");
    }
  }

  async function createProduct(name: string, price: number) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const product = await createProductRequest(token, name, price);
      setProducts((current) => [...current, product]);
      notify("Produto cadastrado", `${product.name} foi adicionado.`);
    } catch (error) {
      notify("Erro ao salvar", error instanceof Error ? error.message : "Nao foi possivel cadastrar o produto.");
    }
  }

  async function editProduct(id: string, payload: Partial<Pick<Product, "name" | "price" | "available">>) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const product = await updateProductRequest(token, id, payload);
      setProducts((current) => current.map((item) => item.id === id ? product : item));
      notify("Produto atualizado", `${product.name} foi salvo.`);
    } catch (error) {
      notify("Erro ao salvar", error instanceof Error ? error.message : "Nao foi possivel editar o produto.");
    }
  }

  async function removeProduct(id: string) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      await deleteProductRequest(token, id);
      setProducts((current) => current.filter((product) => product.id !== id));
      notify("Produto excluído", "O produto foi removido da loja.");
    } catch (error) {
      notify("Erro ao excluir", error instanceof Error ? error.message : "Nao foi possivel excluir o produto.");
    }
  }

  function requireAuthToken() {
    if (!authToken) {
      notify("Sessão expirada", "Entre novamente para salvar no servidor.");
      return null;
    }
    return authToken;
  }

  async function submitLogin() {
    try {
      if (!email.trim() || !password) {
        notify("Dados obrigatorios", "Informe e-mail e senha.");
        return;
      }

      if (authMode === "register") {
        if (!name.trim() || !phone.trim()) {
          notify("Dados obrigatorios", "Informe nome e telefone.");
          return;
        }

        if (password !== passwordConfirmation) {
          notify("Senhas diferentes", "Digite a mesma senha nos dois campos.");
          return;
        }

        const response = await apiRequest<AuthResponse>("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, phone, email, password, passwordConfirmation })
        });
        await applyAuthResponse(response);
        return;
      }

      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      await applyAuthResponse(response);
    } catch (error) {
      notify("Acesso negado", error instanceof Error ? error.message : "Nao foi possivel acessar sua conta.");
    }
  }

  async function applyAuthResponse(response: AuthResponse) {
    setAuthToken(response.token);
    setAuthClientId(response.user.client?.id ?? null);
    setRole(response.user.role === "ADMIN" ? "admin" : "client");

    if (response.user.client) {
      setClients((current) => {
        const exists = current.some((client) => client.id === response.user.client?.id);
        if (exists) {
          return current.map((client) => client.id === response.user.client?.id ? response.user.client : client);
        }
        return [response.user.client, ...current].filter(Boolean) as typeof current;
      });
      setName(response.user.client.name);
      setPhone(response.user.client.phone);
    } else {
      setName(response.user.name);
      setPhone(response.user.phone ?? "");
    }

    await loadInitialData(response.token);
    setPassword("");
    setPasswordConfirmation("");
    setLogged(true);
  }

  async function loadInitialData(token: string) {
    try {
      const data = await loadAppData(token);
      applyAppData(data);
    } catch (error) {
      notify("Dados locais", error instanceof Error ? error.message : "Nao foi possivel carregar os dados do servidor.");
    }
  }

  function applyAppData(data: AppData) {
    setClients(data.clients);
    setServices(data.services);
    setAppointments(data.appointments);
    setRecurring(data.recurring);
    setBlocks(data.blocks);
    setBusinessHours(data.businessHours);
    setClosedDates(data.closedDates);
    setGallery(data.gallery);
    setProducts(data.products);

    const firstServiceId = data.services[0]?.id;
    if (firstServiceId) {
      setSelectedServiceId(firstServiceId);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        {!logged ? (
          <AuthScreen
            mode={authMode}
            name={name}
            phone={phone}
            email={email}
            password={password}
            passwordConfirmation={passwordConfirmation}
            onModeChange={setAuthMode}
            onNameChange={setName}
            onPhoneChange={setPhone}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onPasswordConfirmationChange={setPasswordConfirmation}
            onSubmit={submitLogin}
          />
        ) : (
          <View style={styles.appShell}>
            <Header role={role} />
            {role === "client" ? (
              <ClientApp
                tab={clientTab}
                currentClient={currentClient}
                services={services}
                products={products}
                gallery={gallery}
                dateOptions={dateOptions}
                selectedDate={selectedDate}
                selectedService={selectedService}
                selectedServiceId={selectedServiceId}
                availableSlots={availableSlots}
                occupiedSlots={bookingsForSelectedDate.map((booking) => booking.start)}
                clientAppointments={clientAppointments}
                businessHours={businessHours}
                closedDates={closedDates}
                onTabChange={setClientTab}
                onDateChange={setSelectedDate}
                onServiceChange={setSelectedServiceId}
                onBookSlot={bookSlot}
                onCancelAppointment={cancelAppointment}
                onRescheduleAppointment={rescheduleAppointment}
                onLogout={() => {
                  setAuthToken(null);
                  setLogged(false);
                }}
                onAdmin={() => undefined}
              />
            ) : (
              <AdminApp
                tab={adminTab}
                selectedDate={selectedDate}
                dateOptions={dateOptions}
                clients={clients}
                services={services}
                products={products}
                gallery={gallery}
                recurring={recurring}
                blocks={blocks}
                closedDates={closedDates}
                businessHours={businessHours}
                bookingsToday={readBookingsForDate(isoForOffset(0))}
                bookingsTomorrow={readBookingsForDate(isoForOffset(1))}
                getBookingsForDate={readBookingsForDate}
                onTabChange={setAdminTab}
                onDateChange={setSelectedDate}
                onManualBooking={(clientName, serviceId, start) => bookSlot(start, clientName, serviceId)}
                onManualBlock={addManualBlock}
                onAddClient={createClient}
                onAddService={createService}
                onUpdateService={editService}
                onRemoveService={removeService}
                onAddRecurring={addRecurring}
                onUpdateRecurring={editRecurring}
                onRemoveRecurring={removeRecurring}
                onAddGalleryItem={addGalleryItem}
                onUpdateGalleryItem={editGalleryItem}
                onRemoveGalleryItem={removeGalleryItem}
                onAddProduct={createProduct}
                onUpdateProduct={editProduct}
                onRemoveProduct={removeProduct}
                onEditBusinessHours={setBusinessHours}
                onSaveBusinessHour={saveBusinessHour}
                onAddClosedDate={addClosedDate}
                onRemoveClosedDate={removeClosedDate}
                onLogout={() => {
                  setAuthToken(null);
                  setLogged(false);
                }}
              />
            )}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function notify(title: string, message: string) {
  if (typeof Alert.alert === "function") {
    Alert.alert(title, message);
  }
}
