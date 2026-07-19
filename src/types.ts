// Compatibilidade para componentes compartilhados. Novos módulos devem importar
// diretamente do domínio responsável pelo tipo.
export type {
  Appointment,
  AppointmentStatus,
  Interval,
  RecurringBooking,
} from "./features/appointments/appointments.types";
export type { Client } from "./features/clients/clients.types";
export type { GalleryItem } from "./features/gallery/gallery.types";
export type {
  AdminTab,
  ClientTab,
  Role,
} from "./features/navigation/navigation.types";
export type { Product } from "./features/products/products.types";
export type { Service } from "./features/services/services.types";
export type {
  BusinessHours,
  ManualBlock,
} from "./features/settings/settings.types";
