type RotationDependencies = {
  save: (accessToken: string, token: string, platform: "android" | "ios") => Promise<unknown>;
  remove: (accessToken: string, token: string) => Promise<unknown>;
  store: (token: string) => Promise<unknown>;
};

export async function persistRotatedPushToken(
  accessToken: string,
  nextToken: string,
  previousToken: string | null,
  platform: "android" | "ios",
  dependencies: RotationDependencies,
) {
  await dependencies.save(accessToken, nextToken, platform);
  if (previousToken && previousToken !== nextToken) {
    await dependencies.remove(accessToken, previousToken).catch(() => undefined);
  }
  await dependencies.store(nextToken);
  return nextToken;
}
