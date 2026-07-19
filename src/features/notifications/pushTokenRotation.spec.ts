import { persistRotatedPushToken } from "./pushTokenRotation";

describe("persistRotatedPushToken", () => {
  it("salva o token novo antes de remover o token anterior", async () => {
    const dependencies = { save: jest.fn().mockResolvedValue({}), remove: jest.fn().mockResolvedValue({}), store: jest.fn().mockResolvedValue({}) };
    await persistRotatedPushToken("access", "new-token", "old-token", "android", dependencies);
    expect(dependencies.save).toHaveBeenCalledWith("access", "new-token", "android");
    expect(dependencies.remove).toHaveBeenCalledWith("access", "old-token");
    expect(dependencies.save.mock.invocationCallOrder[0]).toBeLessThan(dependencies.remove.mock.invocationCallOrder[0]);
    expect(dependencies.store).toHaveBeenCalledWith("new-token");
  });

  it("não remove o token quando ele não mudou", async () => {
    const dependencies = { save: jest.fn().mockResolvedValue({}), remove: jest.fn(), store: jest.fn().mockResolvedValue({}) };
    await persistRotatedPushToken("access", "same-token", "same-token", "ios", dependencies);
    expect(dependencies.remove).not.toHaveBeenCalled();
  });
});
