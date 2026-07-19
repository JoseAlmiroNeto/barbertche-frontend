import { useState } from "react";
import type { Appointment, BusinessHours, ClientTab, Service } from "../../types";
import { weekdayOf } from "../../utils/date";

export type AppointmentView = "upcoming" | "history";

type Options = {
  tab: ClientTab;
  services: Service[];
  dateOptions: string[];
  availableSlots: string[];
  clientAppointments: Appointment[];
  businessHours: BusinessHours;
  closedDates: string[];
  savingAppointment?: boolean;
  onTabChange: (tab: ClientTab) => void;
  onDateChange: (date: string) => void;
  onServiceChange: (serviceId: string) => void;
  onBookSlot: (start: string) => boolean | void | Promise<boolean | void>;
  onCancelAppointment: (id: string) => boolean | void | Promise<boolean | void>;
  onRescheduleAppointment: (id: string, date: string, start: string) =>
    boolean | void | Promise<boolean | void>;
};

export function useClientBookingFlow(options: Options) {
  const [appointmentView, setAppointmentView] = useState<AppointmentView>("upcoming");
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const todayIso = new Date().toISOString().slice(0, 10);
  const upcomingAppointments = options.clientAppointments.filter(
    (item) => item.status === "SCHEDULED" && item.date >= todayIso,
  );
  const historyAppointments = options.clientAppointments.filter(
    (item) => item.status !== "SCHEDULED" || item.date < todayIso,
  );
  const selectedAppointments = appointmentView === "upcoming" ? upcomingAppointments : historyAppointments;
  const draftService = options.services.find((item) => item.id === bookingServiceId) ?? null;
  const visibleAvailableSlots = draftService && bookingDate ? options.availableSlots : [];
  const openDateOptions = options.dateOptions.filter((date) => {
    const hours = options.businessHours[weekdayOf(date)];
    return Boolean(hours) && !options.closedDates.includes(date);
  });
  const bottomActiveTab = options.tab === "book" ? "mine" : options.tab === "gallery" ? "home" : options.tab;

  function startNewBooking() {
    setReschedulingId(null);
    setBookingServiceId(null);
    setBookingDate(null);
    setBookingSlot(null);
    setConfirmVisible(false);
    options.onTabChange("book");
  }

  function startReschedule(appointment: Appointment) {
    setReschedulingId(appointment.id);
    setBookingServiceId(appointment.serviceId);
    setBookingDate(null);
    setBookingSlot(null);
    setConfirmVisible(false);
    options.onServiceChange(appointment.serviceId);
    options.onTabChange("book");
  }

  function repeatAppointment(appointment: Appointment) {
    setReschedulingId(null);
    setBookingServiceId(appointment.serviceId);
    setBookingDate(null);
    setBookingSlot(null);
    setConfirmVisible(false);
    options.onServiceChange(appointment.serviceId);
    options.onTabChange("book");
  }

  function handleServiceSelect(serviceId: string) {
    setBookingServiceId(serviceId);
    setBookingSlot(null);
    options.onServiceChange(serviceId);
  }

  function handleDateSelect(date: string) {
    setBookingDate(date);
    setBookingSlot(null);
    options.onDateChange(date);
  }

  async function confirmBooking() {
    if (!bookingSlot || !bookingDate || options.savingAppointment) return;
    const success = reschedulingId
      ? await options.onRescheduleAppointment(reschedulingId, bookingDate, bookingSlot)
      : await options.onBookSlot(bookingSlot);
    if (success === false) {
      setConfirmVisible(false);
      setBookingSlot(null);
      return;
    }
    setConfirmVisible(false);
    setReschedulingId(null);
    setBookingSlot(null);
    setAppointmentView("upcoming");
    options.onTabChange("mine");
  }

  async function confirmCancelAppointment() {
    if (!cancelTarget || options.savingAppointment) return;
    const success = await options.onCancelAppointment(cancelTarget.id);
    if (success === false) return;
    setCancelTarget(null);
    setAppointmentView("upcoming");
  }

  return {
    appointmentView, setAppointmentView, bookingServiceId, bookingDate, bookingSlot,
    setBookingSlot, confirmVisible, setConfirmVisible, reschedulingId, cancelTarget,
    setCancelTarget, todayIso, upcomingAppointments, selectedAppointments, draftService, visibleAvailableSlots,
    openDateOptions, bottomActiveTab, startNewBooking, startReschedule, repeatAppointment,
    handleServiceSelect, handleDateSelect, confirmBooking, confirmCancelAppointment,
  };
}
