import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/common";
import {
  businessHours as initialBusinessHours,
  closedDates as initialClosedDates,
  initialAppointments,
  initialBlocks,
  initialClients,
  initialGallery,
  initialProducts,
  initialRecurring,
  initialServices,
} from "../data/mockData";
import { AdminApp } from "../features/admin/AdminApp";
import { AuthScreen, type AuthMode } from "../features/auth/AuthScreen";
import { ClientApp } from "../features/client/ClientApp";
import {
  createAppointment as createAppointmentRequest,
  getAvailability as getAvailabilityRequest,
  createRecurringBooking as createRecurringBookingRequest,
  deleteAppointment as deleteAppointmentRequest,
  deleteRecurringBooking as deleteRecurringBookingRequest,
  rescheduleAppointment as rescheduleAppointmentRequest,
  updateAppointmentStatus as updateAppointmentStatusRequest,
  updateRecurringBooking as updateRecurringBookingRequest,
} from "../features/appointments/appointments.api";
import { createManualBlock as createManualBlockRequest, deleteManualBlock as deleteManualBlockRequest } from "../features/settings/settings.api";
import { useAdminCatalogActions } from "../features/admin/useAdminCatalogActions";
import { getAuthenticatedUser as getAuthenticatedUserRequest, login as loginRequest, logout as logoutRequest, register as registerRequest, removePushToken as removePushTokenRequest } from "../features/auth/auth.api";
import type { AuthResponse, AuthUser } from "../features/auth/auth.types";
import { setSessionExpiredHandler } from "../services/api";
import {
  clearStoredAuthSession,
  getStoredAuthToken,
  getStoredPushToken,
  getStoredRefreshToken,
  storeAuthSession,
} from "../features/auth/auth.storage";
import { useNotificationSettings } from "../features/notifications/useNotificationSettings";
import {
  loadAppData,
  loadClientAppData,
  type AppData,
} from "../features/app-data/appData.api";
import { styles } from "../theme";
import type {
  AdminTab,
  Appointment,
  AppointmentStatus,
  BusinessHours,
  ClientTab,
  GalleryItem,
  Product,
  RecurringBooking,
  Role,
  Service,
} from "../types";
import { isoForOffset, weekdayOf } from "../utils/date";
import { addMinutes } from "../utils/time";
import {
  canUseSlot,
  getAvailableSlots,
  getBookingsForDate,
  serviceById,
} from "../utils/schedule";
import { notify } from "./notify";

export function AppContainer() {
  const [logged, setLogged] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
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
  const [businessHours, setBusinessHours] =
    useState<BusinessHours>(initialBusinessHours);
  const [closedDates, setClosedDates] = useState<string[]>(initialClosedDates);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authClientId, setAuthClientId] = useState<string | null>(null);
  const [clientAvailableSlots, setClientAvailableSlots] = useState<string[]>(
    [],
  );
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const notificationSettings = useNotificationSettings(authToken, logged);
  const adminCatalog = useAdminCatalogActions({
    requireToken: requireAuthToken,
    startAction,
    finishAction,
    setClients,
    setServices,
    setProducts,
    setGallery,
    setBusinessHours,
    setClosedDates,
  });

  const isSaving = Boolean(pendingAction);
  const authenticatedClient = authClientId
    ? (clients.find((client) => client.id === authClientId) ?? null)
    : null;
  const activeServices = useMemo(
    () => services.filter((service) => service.active),
    [services],
  );
  const selectedService = serviceById(activeServices, selectedServiceId);
  const dateOptions = useMemo(
    () => Array.from({ length: 10 }, (_, index) => isoForOffset(index)),
    [],
  );

  useEffect(() => {
    setSessionExpiredHandler(resetAuthState);
    void restoreStoredSession();

    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    if (!logged || role !== "client" || !authToken || !selectedService.id) {
      setClientAvailableSlots([]);
      return;
    }

    let active = true;
    setClientAvailableSlots([]);
    void getAvailabilityRequest(authToken, selectedDate, selectedService.id)
      .then((slots) => {
        if (active) {
          setClientAvailableSlots(slots);
        }
      })
      .catch((error) => {
        if (active) {
          setClientAvailableSlots([]);
          notify(
            "Disponibilidade indisponivel",
            error instanceof Error
              ? error.message
              : "Nao foi possivel carregar os horarios livres.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [
    authToken,
    availabilityVersion,
    logged,
    role,
    selectedDate,
    selectedService.id,
  ]);

  const bookingsForSelectedDate = readBookingsForDate(selectedDate);
  const availableSlots =
    role === "client"
      ? clientAvailableSlots
      : readAvailableSlots(selectedDate, selectedService);
  const clientAppointments = authenticatedClient
    ? [
        ...appointments.filter(
          (appointment) => appointment.clientId === authenticatedClient.id,
        ),
        ...dateOptions
          .flatMap((date) => readBookingsForDate(date))
          .filter(
            (appointment) =>
              appointment.source === "recurring" &&
              appointment.clientId === authenticatedClient.id,
          ),
      ]
        .sort((a, b) =>
          `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`),
        )
    : [];

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
      blocks,
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
      blocks,
    });
  }

  function startAction(action: string) {
    if (pendingAction) {
      return false;
    }

    setPendingAction(action);
    return true;
  }

  function finishAction() {
    setPendingAction(null);
  }

  function refreshClientAvailability() {
    setAvailabilityVersion((current) => current + 1);
  }

  async function bookSlot(
    start: string,
    manualClient?: string,
    serviceId = selectedService.id,
  ) {
    const token = requireAuthToken();
    if (!token) {
      return false;
    }

    const service = serviceById(services, serviceId);
    const client = authenticatedClient;
    if (!manualClient && !client) {
      notify("Cliente não encontrado", "Entre novamente para agendar.");
      return false;
    }

    if (manualClient && !slotIsAvailable(selectedDate, start, service)) {
      notify(
        "Horario indisponivel",
        "Esse horario ja foi ocupado ou bloqueado.",
      );
      return false;
    }

    if (!manualClient && !availableSlots.includes(start)) {
      notify(
        "Horario indisponivel",
        "Esse horario ja foi ocupado ou bloqueado.",
      );
      refreshClientAvailability();
      return false;
    }

    if (!startAction(manualClient ? "manual-booking" : "appointment")) {
      return false;
    }

    try {
      const appointment = await createAppointmentRequest(token, {
        date: selectedDate,
        start,
        serviceId: service.id,
        clientId: manualClient ? undefined : client?.id,
        clientName: manualClient,
        source: manualClient ? "manual" : "app",
      });
      setAppointments((current) => [...current, appointment]);
      if (!manualClient) {
        refreshClientAvailability();
      }
      notify(
        "Agendamento confirmado",
        `${service.name} em ${selectedDate} às ${start}.`,
      );
      return true;
    } catch (error) {
      notify(
        "Erro ao agendar",
        error instanceof Error
          ? error.message
          : "Não foi possível criar o agendamento.",
      );
      return false;
    } finally {
      finishAction();
    }
  }
  async function cancelAppointment(id: string) {
    const token = requireAuthToken();
    if (!token || !startAction("cancel-appointment")) {
      return false;
    }

    try {
      const canceled = await deleteAppointmentRequest(token, id);
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id ? canceled : appointment,
        ),
      );
      notify("Agendamento cancelado", "O horário foi removido da agenda.");
      return true;
    } catch (error) {
      notify(
        "Erro ao cancelar",
        error instanceof Error
          ? error.message
          : "Não foi possível cancelar o agendamento.",
      );
      return false;
    } finally {
      finishAction();
    }
  }
  async function rescheduleAppointment(
    id: string,
    date: string,
    start: string,
  ) {
    const token = requireAuthToken();
    if (!token) {
      return false;
    }

    const appointment = appointments.find((item) => item.id === id);
    if (!appointment) {
      return false;
    }

    const service = serviceById(services, appointment.serviceId);

    if (
      !canUseSlot({
        date,
        start,
        service,
        businessHours,
        closedDates,
        appointments: appointments.filter((item) => item.id !== id),
        recurring,
        services,
        clients,
        blocks,
      })
    ) {
      notify(
        "Horário indisponível",
        "Esse horário já foi ocupado ou bloqueado.",
      );
      return false;
    }

    if (!startAction("reschedule-appointment")) {
      return false;
    }

    try {
      const updated = await rescheduleAppointmentRequest(token, id, {
        date,
        start,
      });
      setAppointments((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
      refreshClientAvailability();
      notify(
        "Agendamento remarcado",
        `${service.name} em ${date} às ${start}.`,
      );
      return true;
    } catch (error) {
      notify(
        "Erro ao remarcar",
        error instanceof Error
          ? error.message
          : "Não foi possível remarcar o agendamento.",
      );
      return false;
    } finally {
      finishAction();
    }
  }
  async function addManualBlock(
    start: string,
    duration: number,
    reason: string,
  ) {
    const token = requireAuthToken();
    if (!token || !startAction("manual-block")) {
      return false;
    }

    try {
      const end = addMinutes(start, duration);
      const block = await createManualBlockRequest(token, {
        date: selectedDate,
        start,
        end,
        reason,
      });
      setBlocks((current) => [...current, block]);
      notify("Horário bloqueado", "O bloqueio foi salvo na agenda.");
      return true;
    } catch (error) {
      notify(
        "Erro ao bloquear",
        error instanceof Error
          ? error.message
          : "Não foi possível bloquear o horário.",
      );
      return false;
    } finally {
      finishAction();
    }
  }
  async function removeManualBlock(id: string) {
    const token = requireAuthToken();
    if (!token || !startAction("remove-manual-block")) {
      return false;
    }

    try {
      await deleteManualBlockRequest(token, id);
      setBlocks((current) => current.filter((block) => block.id !== id));
      notify("Bloqueio removido", "O horário voltou a ficar disponível.");
      return true;
    } catch (error) {
      notify(
        "Erro ao remover bloqueio",
        error instanceof Error
          ? error.message
          : "Não foi possível remover o bloqueio.",
      );
      return false;
    } finally {
      finishAction();
    }
  }

  async function addRecurring(
    clientId: string,
    serviceId: string,
    weekday: number,
    start: string,
  ) {
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
      active: true,
    };
    const sampleDate = dateOptions.find(
      (date) => weekdayOf(date) === candidate.weekday,
    );
    const service = serviceById(services, candidate.serviceId);
    if (sampleDate && !slotIsAvailable(sampleDate, candidate.start, service)) {
      notify(
        "Conflito detectado",
        "Esse horario fixo conflita com agenda, bloqueio ou recorrencia existente.",
      );
      return;
    }

    try {
      const created = await createRecurringBookingRequest(token, {
        clientId,
        serviceId,
        weekday,
        start,
        active: true,
      });
      setRecurring((current) => [...current, created]);
      notify("Agendamento fixo criado", "O horário semanal foi salvo.");
    } catch (error) {
      notify(
        "Erro ao criar fixo",
        error instanceof Error
          ? error.message
          : "Nao foi possivel criar o agendamento fixo.",
      );
    }
  }

  async function editRecurring(
    id: string,
    payload: Omit<RecurringBooking, "id">,
  ) {
    const token = requireAuthToken();
    if (!token) {
      return;
    }

    try {
      const updated = await updateRecurringBookingRequest(token, id, payload);
      setRecurring((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
      notify("Agendamento fixo atualizado", "O horário semanal foi salvo.");
    } catch (error) {
      notify(
        "Erro ao editar fixo",
        error instanceof Error
          ? error.message
          : "Nao foi possivel editar o agendamento fixo.",
      );
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
      notify("Agendamento fixo excluido", "O horário semanal foi removido.");
    } catch (error) {
      notify(
        "Erro ao excluir fixo",
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir o agendamento fixo.",
      );
    }
  }

  function requireAuthToken() {
    if (!authToken) {
      notify("Sessão expirada", "Entre novamente para salvar no servidor.");
      void signOut(false);
      return null;
    }
    return authToken;
  }

  async function restoreStoredSession() {
    try {
      const [token, refreshToken] = await Promise.all([
        getStoredAuthToken(),
        getStoredRefreshToken(),
      ]);
      if (!token || !refreshToken) {
        await clearStoredAuthSession();
        return;
      }

      const response = await getAuthenticatedUserRequest(token);
      const currentToken = (await getStoredAuthToken()) ?? token;
      await applyAuthenticatedUser(response.user, currentToken);
    } catch {
      await clearStoredAuthSession();
      resetAuthState();
    } finally {
      setAuthInitializing(false);
    }
  }

  async function signOut(showMessage = false) {
    const [storedToken, pushToken] = await Promise.all([
      getStoredAuthToken(),
      getStoredPushToken(),
    ]);
    const token = storedToken ?? authToken;
    if (token) {
      if (pushToken) {
        try {
          await removePushTokenRequest(token, pushToken);
        } catch {
          // O logout também remove os tokens vinculados à sessão no servidor.
        }
      }
      try {
        await logoutRequest(token);
      } catch {
        // A sessão local deve ser encerrada mesmo se o servidor estiver indisponível.
      }
    }
    await clearStoredAuthSession();
    resetAuthState();
    if (showMessage) {
      notify("Sessão encerrada", "Você saiu da sua conta.");
    }
  }

  function resetAuthState() {
    setAuthToken(null);
    setAuthClientId(null);
    setClientAvailableSlots([]);
    setAvailabilityVersion(0);
    setLogged(false);
    setRole("client");
    setClientTab("home");
    setAdminTab("dashboard");
    setPendingAction(null);
  }

  async function submitLogin() {
    if (authSubmitting) {
      return;
    }

    setAuthSubmitting(true);
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

        if (!termsAccepted) {
          notify("Aceite necessario", "Aceite os Termos de Uso e a Politica de Privacidade para criar sua conta.");
          return;
        }

        const response = await registerRequest({
          name,
          phone,
          email,
          password,
          passwordConfirmation,
          termsAccepted,
        });
        await applyAuthResponse(response);
        return;
      }

      const response = await loginRequest({ email, password });
      await applyAuthResponse(response);
    } catch (error) {
      await signOut(false);
      notify(
        "Acesso negado",
        error instanceof Error
          ? error.message
          : "Nao foi possivel acessar sua conta.",
      );
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function applyAuthResponse(response: AuthResponse) {
    await storeAuthSession(response.accessToken, response.refreshToken);
    await applyAuthenticatedUser(response.user, response.accessToken);
  }

  async function updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
  ) {
    const token = requireAuthToken();
    if (!token || !startAction("appointment-status")) {
      return false;
    }

    try {
      const updated = await updateAppointmentStatusRequest(token, id, status);
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id ? updated : appointment,
        ),
      );
      refreshClientAvailability();
      notify("Status atualizado", "O agendamento foi atualizado com sucesso.");
      return true;
    } catch (error) {
      notify(
        "Erro ao atualizar status",
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o agendamento.",
      );
      return false;
    } finally {
      finishAction();
    }
  }

  async function applyAuthenticatedUser(user: AuthUser, token: string) {
    const nextRole = user.role === "ADMIN" ? "admin" : "client";

    if (nextRole === "client" && !user.client) {
      throw new Error("Seu usuario ainda nao esta vinculado a um cliente.");
    }

    setAuthToken(token);
    setAuthClientId(user.client?.id ?? null);
    setRole(nextRole);

    if (user.client) {
      setClients((current) => {
        const exists = current.some(
          (client) => client.id === user.client?.id,
        );
        if (exists) {
          return current.map((client) =>
            client.id === user.client?.id
              ? user.client
              : client,
          );
        }
        return [user.client, ...current].filter(
          Boolean,
        ) as typeof current;
      });
      setName(user.client.name);
      setPhone(user.client.phone);
    } else {
      setName(user.name);
      setPhone(user.phone ?? "");
    }

    await loadInitialData(token, nextRole, user);
    setPassword("");
    setPasswordConfirmation("");
    setTermsAccepted(false);
    setLogged(true);
  }

  async function loadInitialData(
    token: string,
    nextRole = role,
    user?: AuthUser,
  ) {
    try {
      const data =
        nextRole === "client" && user
          ? await loadClientAppData(token, user)
          : await loadAppData(token);
      applyAppData(data);
    } catch (error) {
      notify(
        nextRole === "client" ? "Sessao invalida" : "Dados locais",
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar os dados do servidor.",
      );
      if (nextRole === "client") {
        throw error;
      }
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

    const firstActiveServiceId = data.services.find(
      (service) => service.active,
    )?.id;
    setSelectedServiceId(firstActiveServiceId ?? "");
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        {authInitializing ? (
          <View style={styles.loadingScreen}>
            <ActivityIndicator color="#e9bd63" size="large" />
            <Text style={styles.loadingText}>Conectando à barbearia...</Text>
          </View>
        ) : !logged ? (
          <AuthScreen
            mode={authMode}
            name={name}
            phone={phone}
            email={email}
            password={password}
            passwordConfirmation={passwordConfirmation}
            termsAccepted={termsAccepted}
            onModeChange={setAuthMode}
            onNameChange={setName}
            onPhoneChange={setPhone}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onPasswordConfirmationChange={setPasswordConfirmation}
            onTermsAcceptedChange={setTermsAccepted}
            submitting={authSubmitting}
            onSubmit={submitLogin}
          />
        ) : (
          <View style={styles.appShell}>
            <Header role={role} />
            {role === "client" ? (
              authenticatedClient ? (
                <ClientApp
                  tab={clientTab}
                  currentClient={authenticatedClient}
                  services={services}
                  products={products}
                  gallery={gallery}
                  dateOptions={dateOptions}
                  selectedDate={selectedDate}
                  selectedService={selectedService}
                  selectedServiceId={selectedServiceId}
                  availableSlots={availableSlots}
                  clientAppointments={clientAppointments}
                  businessHours={businessHours}
                  closedDates={closedDates}
                  onTabChange={setClientTab}
                  onDateChange={setSelectedDate}
                  onServiceChange={setSelectedServiceId}
                  onBookSlot={bookSlot}
                  onCancelAppointment={cancelAppointment}
                  onRescheduleAppointment={rescheduleAppointment}
                  savingAppointment={isSaving}
                  onLogout={() => void signOut(true)}
                  notificationPreferences={notificationSettings.preferences}
                  notificationPreferencesLoading={notificationSettings.loading}
                  onNotificationPreferencesChange={(changes) => void notificationSettings.update(changes)}
                  onAdmin={() => undefined}
                />
              ) : (
                <View style={styles.loadingScreen}>
                  <ActivityIndicator color="#e9bd63" size="large" />
                  <Text style={styles.loadingText}>
                    Carregando seu perfil...
                  </Text>
                </View>
              )
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
                onManualBooking={(clientName, serviceId, start) =>
                  bookSlot(start, clientName, serviceId)
                }
                onManualBlock={addManualBlock}
                onRemoveManualBlock={removeManualBlock}
                onAddClient={adminCatalog.addClient}
                onUpdateClient={adminCatalog.editClient}
                onRemoveClient={adminCatalog.removeClient}
                onAddService={adminCatalog.addService}
                onUpdateService={adminCatalog.editService}
                onRemoveService={adminCatalog.removeService}
                onAddRecurring={addRecurring}
                onUpdateRecurring={editRecurring}
                onRemoveRecurring={removeRecurring}
                onAddGalleryItem={adminCatalog.addGalleryItem}
                onUpdateGalleryItem={adminCatalog.editGalleryItem}
                onRemoveGalleryItem={(id) => void adminCatalog.removeGalleryItem(id)}
                onAddProduct={adminCatalog.addProduct}
                onUpdateProduct={adminCatalog.editProduct}
                onRemoveProduct={adminCatalog.removeProduct}
                onEditBusinessHours={setBusinessHours}
                onSaveBusinessHour={(weekday, hours) => void adminCatalog.saveBusinessHour(weekday, hours)}
                onAddClosedDate={(date) => void adminCatalog.addClosedDate(date)}
                onRemoveClosedDate={(date) => void adminCatalog.removeClosedDate(date)}
                onUpdateAppointmentStatus={updateAppointmentStatus}
                saving={isSaving}
                onLogout={() => void signOut(true)}
              />
            )}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}


