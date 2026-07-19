import type {
  Appointment,
  BusinessHours,
  Client,
  GalleryItem,
  ManualBlock,
  Product,
  RecurringBooking,
  Service,
} from "../../types";
import type { components } from "../../generated/api-types";
import {
  getAppointments,
  getMyAppointments,
  getRecurringBookings,
} from "../appointments/appointments.api";
import type { AuthUser } from "../auth/auth.types";
import { getClients } from "../clients/clients.api";
import { getGallery } from "../gallery/gallery.api";
import { getProducts } from "../products/products.api";
import { getServices } from "../services/services.api";
import { getSettings } from "../settings/settings.api";

type BackendAppointment = components["schemas"]["AppointmentResponseDto"];
type BackendClosedDate = components["schemas"]["ClosedDateResponseDto"];
type BackendProduct = components["schemas"]["ProductResponseDto"];
type BackendGalleryItem = components["schemas"]["GalleryItemResponseDto"];
type SettingsResponse = components["schemas"]["SettingsResponseDto"];
type MyAppointmentsResponse = components["schemas"]["MyAppointmentsResponseDto"];

export type AppData = {
  clients: Client[];
  services: Service[];
  appointments: Appointment[];
  recurring: RecurringBooking[];
  blocks: ManualBlock[];
  businessHours: BusinessHours;
  closedDates: string[];
  gallery: GalleryItem[];
  products: Product[];
};

const fallbackProductImage =
  "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=900&q=80";
const fallbackGalleryImage =
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80";

export async function loadAppData(token: string): Promise<AppData> {
  const [
    clients,
    services,
    appointments,
    recurring,
    settings,
    products,
    gallery,
  ] = await Promise.all([
    getClients(token),
    getServices(token),
    getAppointments(token),
    getRecurringBookings(token),
    getSettings(token),
    getProducts(token),
    getGallery(token),
  ]);

  return {
    clients,
    services,
    appointments: appointments.map(normalizeAppointment),
    recurring,
    blocks: settings.blocks ?? [],
    businessHours: settings.businessHours,
    closedDates: normalizeClosedDates(settings.closedDates ?? []),
    gallery: gallery.map(normalizeGalleryItem),
    products: products.map(normalizeProduct),
  };
}

export async function loadClientAppData(
  token: string,
  user: AuthUser,
): Promise<AppData> {
  if (!user.client) {
    throw new Error("Cliente autenticado nao encontrado.");
  }

  const [services, mine, settings, products, gallery] = await Promise.all([
    getServices(token),
    getMyAppointments(token),
    getSettings(token),
    getProducts(token),
    getGallery(token),
  ]);

  return {
    clients: [user.client],
    services,
    appointments: mine.appointments.map(normalizeAppointment),
    recurring: mine.recurring,
    blocks: settings.blocks ?? [],
    businessHours: settings.businessHours,
    closedDates: normalizeClosedDates(settings.closedDates ?? []),
    gallery: gallery.map(normalizeGalleryItem),
    products: products.map(normalizeProduct),
  };
}

function normalizeAppointment(appointment: BackendAppointment): Appointment {
  return appointment;
}

function normalizeClosedDates(closedDates: BackendClosedDate[]) {
  return closedDates.map((item) => item.date);
}

function normalizeProduct(product: BackendProduct): Product {
  return {
    ...product,
    image: product.image ?? fallbackProductImage,
    description: product.description ?? "Produto vendido no estabelecimento.",
  };
}

function normalizeGalleryItem(item: BackendGalleryItem): GalleryItem {
  return {
    ...item,
    image: item.image ?? fallbackGalleryImage,
  };
}
