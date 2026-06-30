import type {
  Appointment,
  BusinessHours,
  Client,
  GalleryItem,
  ManualBlock,
  Product,
  RecurringBooking,
  Service,
} from "../types";
import { apiRequest, type AuthUser } from "./api";

type BackendAppointment = Omit<Appointment, "status"> & {
  status?: Appointment["status"];
};

type BackendClosedDate =
  | string
  | {
      date: string;
      reason?: string | null;
    };

type BackendProduct = Omit<Product, "image" | "description"> & {
  image?: string | null;
  description?: string | null;
};

type BackendGalleryItem = Omit<GalleryItem, "image"> & {
  image?: string | null;
};

type SettingsResponse = {
  businessHours: BusinessHours;
  closedDates: BackendClosedDate[];
  blocks: ManualBlock[];
};

type MyAppointmentsResponse = {
  appointments: BackendAppointment[];
  recurring: RecurringBooking[];
};

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
    apiRequest<Client[]>("/clients", { token }),
    apiRequest<Service[]>("/services", { token }),
    apiRequest<BackendAppointment[]>("/appointments", { token }),
    apiRequest<RecurringBooking[]>("/appointments/recurring", { token }),
    apiRequest<SettingsResponse>("/settings", { token }),
    apiRequest<BackendProduct[]>("/products", { token }),
    apiRequest<BackendGalleryItem[]>("/gallery", { token }),
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
    apiRequest<Service[]>("/services", { token }),
    apiRequest<MyAppointmentsResponse>("/appointments/me", { token }),
    apiRequest<SettingsResponse>("/settings", { token }),
    apiRequest<BackendProduct[]>("/products", { token }),
    apiRequest<BackendGalleryItem[]>("/gallery", { token }),
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
  return {
    ...appointment,
    status: "confirmed",
  };
}

function normalizeClosedDates(closedDates: BackendClosedDate[]) {
  return closedDates.map((item) =>
    typeof item === "string" ? item : item.date,
  );
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
