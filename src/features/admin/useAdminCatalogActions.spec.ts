import { useAdminCatalogActions } from "./useAdminCatalogActions";
import * as servicesApi from "../services/services.api";

jest.mock("../services/services.api");
jest.mock("../../app/notify", () => ({ notify: jest.fn() }));

describe("useAdminCatalogActions", () => {
  it("adiciona no estado o serviço confirmado pelo backend", async () => {
    const created = { id: "s2", name: "Barba", duration: 30, price: 45, active: true };
    jest.mocked(servicesApi.createService).mockResolvedValue(created);
    const setServices = jest.fn((updater) => updater([{ id: "s1", name: "Corte", duration: 30, price: 50, active: true }]));
    const actions = useAdminCatalogActions({
      requireToken: () => "token",
      startAction: () => true,
      finishAction: jest.fn(),
      setClients: jest.fn(), setServices, setProducts: jest.fn(), setGallery: jest.fn(),
      setBusinessHours: jest.fn(), setClosedDates: jest.fn(),
    });

    await expect(actions.addService("Barba", 45, 30)).resolves.toBe(true);
    expect(servicesApi.createService).toHaveBeenCalledWith("token", { name: "Barba", price: 45, duration: 30, active: true });
    expect(setServices.mock.results[0].value).toEqual(expect.arrayContaining([created]));
  });
});
