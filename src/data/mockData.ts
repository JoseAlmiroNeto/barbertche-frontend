import type { Appointment, BusinessHours, Client, GalleryItem, ManualBlock, Product, RecurringBooking, Service } from "../types";
import { isoForOffset } from "../utils/date";

export const initialClients: Client[] = [
  { id: "c1", name: "Mateus Silva", phone: "(51) 99990-1000" },
  { id: "c2", name: "Joao Martins", phone: "(51) 98888-2020" },
  { id: "c3", name: "Pedro Alves", phone: "(51) 97777-3030" }
];

export const initialServices: Service[] = [
  { id: "s1", name: "Corte premium", duration: 45, price: 70, active: true },
  { id: "s2", name: "Barba navalhada", duration: 30, price: 45, active: true },
  { id: "s3", name: "Cabelo + barba", duration: 75, price: 105, active: true },
  { id: "s4", name: "Hidratacao", duration: 40, price: 60, active: true }
];

export const initialAppointments: Appointment[] = [
  { id: "a1", date: isoForOffset(1), start: "09:30", end: "10:15", clientId: "c1", clientName: "Mateus Silva", serviceId: "s1", status: "SCHEDULED", source: "app" },
  { id: "a2", date: isoForOffset(1), start: "14:00", end: "15:15", clientName: "Cliente balcão", serviceId: "s3", status: "SCHEDULED", source: "manual" },
  { id: "a3", date: isoForOffset(2), start: "11:00", end: "11:30", clientId: "c3", clientName: "Pedro Alves", serviceId: "s2", status: "SCHEDULED", source: "app" }
];

export const initialRecurring: RecurringBooking[] = [
  { id: "r1", clientId: "c2", serviceId: "s3", weekday: 6, start: "10:00", active: true }
];

export const initialBlocks: ManualBlock[] = [
  { id: "b1", date: isoForOffset(3), start: "12:00", end: "13:30", reason: "Treinamento da equipe" }
];

export const initialGallery: GalleryItem[] = [
  { id: "g1", title: "Fade baixo texturizado", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80" },
  { id: "g2", title: "Barba marcada", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80" },
  { id: "g3", title: "Corte classico executivo", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80" }
];

export const initialProducts: Product[] = [
  { id: "p1", name: "Pomada matte", image: "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?auto=format&fit=crop&w=900&q=80", description: "Fixacao forte, acabamento seco.", price: 59.9, available: true },
  { id: "p2", name: "Oleo para barba", image: "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=900&q=80", description: "Maciez e brilho com perfume amadeirado.", price: 49.9, available: true },
  { id: "p3", name: "Shampoo refrescante", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80", description: "Limpeza diaria para couro cabeludo.", price: 42, available: false }
];

export const closedDates = [isoForOffset(5)];

export const businessHours: BusinessHours = {
  0: null,
  1: { open: "09:00", close: "19:00" },
  2: { open: "09:00", close: "19:00" },
  3: { open: "09:00", close: "19:00" },
  4: { open: "09:00", close: "19:00" },
  5: { open: "09:00", close: "19:00" },
  6: { open: "09:00", close: "17:00" }
};
