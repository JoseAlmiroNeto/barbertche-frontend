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
import { ApiError, apiRequest, type AuthUser } from "./api";

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
  warnings: string[];
};

const fallbackProductImage =
  "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=900&q=80";
const fallbackGalleryImage =
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80";

export async function loadAppData(token: string): Promise<AppData> {
  const essentialPromise = Promise.all([
    apiRequest<Client[]>("/clients", { token }),
    apiRequest<Service[]>("/services", { token }),
    apiRequest<BackendAppointment[]>("/appointments", { token }),
    apiRequest<RecurringBooking[]>("/appointments/recurring", { token }),
    apiRequest<SettingsResponse>("/settings", { token }),
  ] as const);
  const productsPromise = loadOptional(
    () => apiRequest<BackendProduct[]>("/products", { token }),
    "produtos",
  );
  const galleryPromise = loadOptional(
    () => apiRequest<BackendGalleryItem[]>("/gallery", { token }),
    "galeria",
  );
  const [essential, productsResult, galleryResult] = await Promise.all([
    essentialPromise,
    productsPromise,
    galleryPromise,
  ]);
  const [clients, services, appointments, recurring, settings] = essential;

  return {
    clients,
    services,
    appointments: appointments.map(normalizeAppointment),
    recurring,
    blocks: settings.blocks ?? [],
    businessHours: settings.businessHours,
    closedDates: normalizeClosedDates(settings.closedDates ?? []),
    gallery: galleryResult.data.map(normalizeGalleryItem),
    products: productsResult.data.map(normalizeProduct),
    warnings: collectWarnings(productsResult, galleryResult),
  };
}

export async function loadClientAppData(
  token: string,
  user: AuthUser,
): Promise<AppData> {
  if (!user.client) {
    throw new Error("Cliente autenticado nao encontrado.");
  }

  const essentialPromise = Promise.all([
    apiRequest<Service[]>("/services", { token }),
    apiRequest<MyAppointmentsResponse>("/appointments/me", { token }),
    apiRequest<SettingsResponse>("/settings", { token }),
  ] as const);
  const productsPromise = loadOptional(
    () => apiRequest<BackendProduct[]>("/products", { token }),
    "produtos",
  );
  const galleryPromise = loadOptional(
    () => apiRequest<BackendGalleryItem[]>("/gallery", { token }),
    "galeria",
  );
  const [essential, productsResult, galleryResult] = await Promise.all([
    essentialPromise,
    productsPromise,
    galleryPromise,
  ]);
  const [services, mine, settings] = essential;

  return {
    clients: [user.client],
    services,
    appointments: mine.appointments.map(normalizeAppointment),
    recurring: mine.recurring,
    blocks: settings.blocks ?? [],
    businessHours: settings.businessHours,
    closedDates: normalizeClosedDates(settings.closedDates ?? []),
    gallery: galleryResult.data.map(normalizeGalleryItem),
    products: productsResult.data.map(normalizeProduct),
    warnings: collectWarnings(productsResult, galleryResult),
  };
}

type OptionalResult<T> = { data: T[]; warning?: string };

async function loadOptional<T>(
  request: () => Promise<T[]>,
  label: string,
): Promise<OptionalResult<T>> {
  try {
    return { data: await retryOnce(request) };
  } catch {
    return {
      data: [],
      warning: `Não foi possível carregar ${label}. Tente novamente mais tarde.`,
    };
  }
}

async function retryOnce<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiError && error.kind === "unauthorized") {
      throw error;
    }
    return request();
  }
}

function collectWarnings(...results: OptionalResult<unknown>[]) {
  return results.flatMap((result) =>
    result.warning ? [result.warning] : [],
  );
}

function normalizeAppointment(appointment: BackendAppointment): Appointment {
  return {
    ...appointment,
    status: appointment.status ?? "confirmed",
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
