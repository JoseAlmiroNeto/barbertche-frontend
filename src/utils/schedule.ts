import type {
  Appointment,
  AppointmentStatus,
  BusinessHours,
  Client,
  Interval,
  ManualBlock,
  RecurringBooking,
  Service
} from "../types";
import { weekdayOf } from "./date";
import { addMinutes, overlaps, toMinutes, toTime } from "./time";

const emptyService: Service = {
  id: "",
  name: "Servico indisponivel",
  duration: 30,
  price: 0,
  active: false
};

export function serviceById(services: Service[], id: string) {
  return services.find((service) => service.id === id) ?? services[0] ?? emptyService;
}

export function getBookingsForDate(
  date: string,
  appointments: Appointment[],
  recurring: RecurringBooking[],
  services: Service[],
  clients: Client[]
) {
  const regular = appointments.filter((appointment) => appointment.date === date && appointment.status === "confirmed");
  const generated = recurring
    .filter((item) => item.active && item.weekday === weekdayOf(date))
    .map((item) => {
      const service = serviceById(services, item.serviceId);
      const client = clients.find((candidate) => candidate.id === item.clientId);
      return {
        id: `${item.id}-${date}`,
        date,
        start: item.start,
        end: addMinutes(item.start, service.duration),
        clientId: item.clientId,
        clientName: client?.name ?? "Cliente recorrente",
        serviceId: item.serviceId,
        status: "confirmed" as AppointmentStatus,
        source: "recurring" as const
      };
    });

  return [...regular, ...generated].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

export function blockedIntervals(date: string, blocks: ManualBlock[]): Interval[] {
  return blocks.filter((block) => block.date === date).map((block) => ({ start: block.start, end: block.end }));
}

export function canUseSlot(params: {
  date: string;
  start: string;
  service: Service;
  businessHours: BusinessHours;
  closedDates: string[];
  appointments: Appointment[];
  recurring: RecurringBooking[];
  services: Service[];
  clients: Client[];
  blocks: ManualBlock[];
}) {
  const hours = params.businessHours[weekdayOf(params.date)];
  if (!hours || params.closedDates.includes(params.date)) {
    return false;
  }

  const interval = { start: params.start, end: addMinutes(params.start, params.service.duration) };
  if (toMinutes(interval.start) < toMinutes(hours.open) || toMinutes(interval.end) > toMinutes(hours.close)) {
    return false;
  }

  const busy = [
    ...getBookingsForDate(params.date, params.appointments, params.recurring, params.services, params.clients),
    ...blockedIntervals(params.date, params.blocks)
  ];
  return !busy.some((item) => overlaps(interval, item));
}

export function getAvailableSlots(params: {
  date: string;
  service: Service;
  businessHours: BusinessHours;
  closedDates: string[];
  appointments: Appointment[];
  recurring: RecurringBooking[];
  services: Service[];
  clients: Client[];
  blocks: ManualBlock[];
}) {
  const hours = params.businessHours[weekdayOf(params.date)];
  if (!hours || params.closedDates.includes(params.date)) {
    return [];
  }

  const slots: string[] = [];
  for (let cursor = toMinutes(hours.open); cursor + params.service.duration <= toMinutes(hours.close); cursor += 30) {
    const start = toTime(cursor);
    if (canUseSlot({ ...params, start })) {
      slots.push(start);
    }
  }
  return slots;
}
