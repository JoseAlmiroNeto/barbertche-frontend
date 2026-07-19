import type { Dispatch, SetStateAction } from "react";
import type { BusinessHours, Client, GalleryItem, Product, Service } from "../../types";
import { notify } from "../../app/notify";
import { createClient, deleteClient, updateClient } from "../clients/clients.api";
import { createGalleryItem, deleteGalleryItem, updateGalleryItem } from "../gallery/gallery.api";
import { createProduct, deleteProduct, updateProduct } from "../products/products.api";
import { createService, deleteService, updateService } from "../services/services.api";
import { createClosedDate, deleteClosedDate, updateBusinessHour } from "../settings/settings.api";

type StateSetter<T> = Dispatch<SetStateAction<T>>;

type Params = {
  requireToken: () => string | null;
  startAction: (name: string) => boolean;
  finishAction: () => void;
  setClients: StateSetter<Client[]>;
  setServices: StateSetter<Service[]>;
  setProducts: StateSetter<Product[]>;
  setGallery: StateSetter<GalleryItem[]>;
  setBusinessHours: StateSetter<BusinessHours>;
  setClosedDates: StateSetter<string[]>;
};

export function useAdminCatalogActions(params: Params) {
  const { requireToken, startAction, finishAction, setClients, setServices, setProducts, setGallery, setBusinessHours, setClosedDates } = params;

  async function withBusyAction<T>(action: string, operation: (token: string) => Promise<T>, success: (result: T) => void, errorTitle: string) {
    const token = requireToken();
    if (!token || !startAction(action)) return false;
    try { success(await operation(token)); return true; }
    catch (error) { notify(errorTitle, error instanceof Error ? error.message : "Não foi possível concluir a operação."); return false; }
    finally { finishAction(); }
  }

  const addGalleryItem = (title: string, image: string) => withBusyAction("save-gallery", (token) => createGalleryItem(token, { title, image }), (item) => {
    setGallery((current) => [item, ...current]); notify("Imagem adicionada", `${item.title} foi adicionada ao portfólio.`);
  }, "Erro ao salvar");
  const editGalleryItem = (id: string, title: string, image: string) => withBusyAction("save-gallery", (token) => updateGalleryItem(token, id, { title, image }), (item) => {
    setGallery((current) => current.map((value) => value.id === id ? item : value)); notify("Imagem atualizada", `${item.title} foi salva.`);
  }, "Erro ao salvar");
  async function removeGalleryItem(id: string) {
    const token = requireToken(); if (!token) return false;
    try { await deleteGalleryItem(token, id); setGallery((current) => current.filter((item) => item.id !== id)); notify("Imagem removida", "A imagem foi removida do portfólio."); return true; }
    catch (error) { notify("Erro ao remover", error instanceof Error ? error.message : "Não foi possível remover a imagem."); return false; }
  }

  async function saveBusinessHour(weekday: number, hours: BusinessHours[number]) {
    const token = requireToken(); if (!token) return false;
    try { setBusinessHours(await updateBusinessHour(token, weekday, hours)); return true; }
    catch (error) { notify("Erro ao salvar horário", error instanceof Error ? error.message : "Não foi possível salvar o expediente."); return false; }
  }
  async function addClosedDate(date: string) {
    const token = requireToken(); if (!token) return false;
    try { setClosedDates(await createClosedDate(token, date)); notify("Fechamento cadastrado", "A data não aparecerá para clientes."); return true; }
    catch (error) { notify("Erro ao cadastrar fechamento", error instanceof Error ? error.message : "Não foi possível cadastrar o fechamento."); return false; }
  }
  async function removeClosedDate(date: string) {
    const token = requireToken(); if (!token) return false;
    try { setClosedDates(await deleteClosedDate(token, date)); notify("Fechamento removido", "A data voltou a seguir o expediente configurado."); return true; }
    catch (error) { notify("Erro ao remover fechamento", error instanceof Error ? error.message : "Não foi possível remover o fechamento."); return false; }
  }

  async function addClient(name: string, phone: string) {
    const token = requireToken(); if (!token) return false;
    try { const client = await createClient(token, name, phone); setClients((current) => [...current, client]); notify("Cliente cadastrado", `${client.name} foi adicionado.`); return true; }
    catch (error) { notify("Erro ao cadastrar", error instanceof Error ? error.message : "Não foi possível cadastrar o cliente."); return false; }
  }
  const editClient = (id: string, name: string, phone: string) => withBusyAction("save-client", (token) => updateClient(token, id, { name, phone }), (client) => {
    setClients((current) => current.map((item) => item.id === id ? client : item)); notify("Cliente atualizado", `${client.name} foi salvo.`);
  }, "Erro ao editar cliente");
  const removeClient = (id: string) => withBusyAction("remove-client", (token) => deleteClient(token, id), () => {
    setClients((current) => current.filter((client) => client.id !== id)); notify("Cliente excluído", "O cadastro foi removido.");
  }, "Erro ao excluir cliente");

  const addService = (name: string, price: number, duration: number) => withBusyAction("save-service", (token) => createService(token, { name, price, duration, active: true }), (service) => {
    setServices((current) => [...current, service]); notify("Serviço cadastrado", `${service.name} foi adicionado.`);
  }, "Erro ao salvar serviço");
  const editService = (id: string, payload: { name: string; price: number; duration: number }) => withBusyAction("save-service", (token) => updateService(token, id, payload), (service) => {
    setServices((current) => current.map((item) => item.id === id ? service : item)); notify("Serviço atualizado", `${service.name} foi salvo.`);
  }, "Erro ao salvar serviço");
  const removeService = (id: string) => withBusyAction("remove-service", (token) => deleteService(token, id), () => {
    setServices((current) => current.filter((service) => service.id !== id)); notify("Serviço excluído", "O serviço foi removido.");
  }, "Erro ao excluir serviço");

  const addProduct = (name: string, price: number, image?: string) => withBusyAction("save-product", (token) => createProduct(token, name, price, image), (product) => {
    setProducts((current) => [...current, product]); notify("Produto cadastrado", `${product.name} foi adicionado.`);
  }, "Erro ao salvar produto");
  const editProduct = (id: string, payload: Partial<Pick<Product, "name" | "price" | "available" | "image">>) => withBusyAction("save-product", (token) => updateProduct(token, id, payload), (product) => {
    setProducts((current) => current.map((item) => item.id === id ? product : item)); notify("Produto atualizado", `${product.name} foi salvo.`);
  }, "Erro ao salvar produto");
  const removeProduct = (id: string) => withBusyAction("remove-product", (token) => deleteProduct(token, id), () => {
    setProducts((current) => current.filter((product) => product.id !== id)); notify("Produto excluído", "O produto foi removido da loja.");
  }, "Erro ao excluir produto");

  return { addGalleryItem, editGalleryItem, removeGalleryItem, saveBusinessHour, addClosedDate, removeClosedDate, addClient, editClient, removeClient, addService, editService, removeService, addProduct, editProduct, removeProduct };
}
