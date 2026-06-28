import type { Appointment, BusinessHours, Client, GalleryItem, ManualBlock, Product, RecurringBooking, Service } from "../types";
import { apiRequest } from "./api";

type AppointmentResponse = Omit<Appointment, "status"> & {
  status?: Appointment["status"];
};

type ClosedDateResponse = string | {
  date: string;
  reason?: string | null;
};

type ProductResponse = Omit<Product, "image" | "description"> & {
  image?: string | null;
  description?: string | null;
};

type ServicePayload = {
  name: string;
  price: number;
  duration: number;
  active?: boolean;
};

type ProductPayload = {
  name?: string;
  price?: number;
  image?: string;
  description?: string;
  available?: boolean;
};

const fallbackProductImage = "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=900&q=80";

export function createClient(token: string, name: string, phone: string) {
  return apiRequest<Client>("/clients", {
    token,
    method: "POST",
    body: JSON.stringify({ name, phone })
  });
}

export function createService(token: string, payload: ServicePayload) {
  return apiRequest<Service>("/services", {
    token,
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateService(token: string, id: string, payload: Partial<ServicePayload>) {
  return apiRequest<Service>(`/services/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteService(token: string, id: string) {
  return apiRequest<{ deleted: boolean }>(`/services/${id}`, {
    token,
    method: "DELETE"
  });
}

export async function createProduct(token: string, name: string, price: number) {
  const product = await apiRequest<ProductResponse>("/products", {
    token,
    method: "POST",
    body: JSON.stringify({
      name,
      price,
      image: fallbackProductImage,
      description: "Produto vendido no estabelecimento.",
      available: true
    })
  });
  return normalizeProduct(product);
}

export async function updateProduct(token: string, id: string, payload: ProductPayload) {
  const product = await apiRequest<ProductResponse>(`/products/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  return normalizeProduct(product);
}

export function deleteProduct(token: string, id: string) {
  return apiRequest<{ deleted: boolean }>(`/products/${id}`, {
    token,
    method: "DELETE"
  });
}

function normalizeProduct(product: ProductResponse): Product {
  return {
    ...product,
    image: product.image ?? fallbackProductImage,
    description: product.description ?? "Produto vendido no estabelecimento."
  };
}

export async function createAppointment(token: string, payload: { date: string; start: string; serviceId: string; clientId?: string; clientName?: string; source?: "app" | "manual" }) {
  const appointment = await apiRequest<AppointmentResponse>("/appointments", {
    token,
    method: "POST",
    body: JSON.stringify(payload)
  });
  return normalizeAppointment(appointment);
}

export async function rescheduleAppointment(token: string, id: string, payload: { date: string; start: string }) {
  const appointment = await apiRequest<AppointmentResponse>(`/appointments/${id}/reschedule`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  return normalizeAppointment(appointment);
}

export function deleteAppointment(token: string, id: string) {
  return apiRequest<{ deleted: boolean }>(`/appointments/${id}`, {
    token,
    method: "DELETE"
  });
}

export function createManualBlock(token: string, payload: { date: string; start: string; end: string; reason: string }) {
  return apiRequest<ManualBlock>("/settings/blocks", {
    token,
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateBusinessHour(token: string, weekday: number, hours: { open: string; close: string } | null) {
  return apiRequest<BusinessHours>("/settings/business-hours", {
    token,
    method: "PATCH",
    body: JSON.stringify(hours ? { weekday, open: hours.open, close: hours.close } : { weekday })
  });
}

export async function createClosedDate(token: string, date: string) {
  const closedDates = await apiRequest<ClosedDateResponse[]>("/settings/closed-dates", {
    token,
    method: "POST",
    body: JSON.stringify({ date, reason: "Fechado pelo estabelecimento." })
  });
  return normalizeClosedDates(closedDates);
}

export async function deleteClosedDate(token: string, date: string) {
  const closedDates = await apiRequest<ClosedDateResponse[]>(`/settings/closed-dates/${date}`, {
    token,
    method: "DELETE"
  });
  return normalizeClosedDates(closedDates);
}

export function createRecurringBooking(token: string, payload: Omit<RecurringBooking, "id">) {
  return apiRequest<RecurringBooking>("/appointments/recurring", {
    token,
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateRecurringBooking(token: string, id: string, payload: Omit<RecurringBooking, "id">) {
  return apiRequest<RecurringBooking>(`/appointments/recurring/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteRecurringBooking(token: string, id: string) {
  return apiRequest<{ deleted: boolean }>(`/appointments/recurring/${id}`, {
    token,
    method: "DELETE"
  });
}

export function createGalleryItem(token: string, payload: Pick<GalleryItem, "title" | "image">) {
  return apiRequest<GalleryItem>("/gallery", {
    token,
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateGalleryItem(token: string, id: string, payload: Pick<GalleryItem, "title" | "image">) {
  return apiRequest<GalleryItem>(`/gallery/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteGalleryItem(token: string, id: string) {
  return apiRequest<{ deleted: boolean }>(`/gallery/${id}`, {
    token,
    method: "DELETE"
  });
}

function normalizeAppointment(appointment: AppointmentResponse): Appointment {
  return {
    ...appointment,
    status: "confirmed"
  };
}

function normalizeClosedDates(closedDates: ClosedDateResponse[]) {
  return closedDates.map((item) => typeof item === "string" ? item : item.date);
}
