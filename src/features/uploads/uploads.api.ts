import {
  apiClient,
  authorized,
  unwrapApiResponse,
} from "../../services/api";

export async function uploadImageIfNeeded(
  token: string,
  image: string,
  folder: "gallery" | "products",
) {
  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  const fileName = image.split("/").pop() ?? `image-${Date.now()}.jpg`;
  const extension = fileName.split(".").pop()?.toLowerCase();
  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";
  const file = {
    uri: image,
    name: fileName,
    type: mimeType,
  };

  const uploaded = unwrapApiResponse(
    await apiClient.POST("/api/uploads/image", {
      headers: authorized(token),
      body: { file: image, folder },
      bodySerializer: () => {
        const formData = new FormData();
        formData.append("folder", folder);
        formData.append("file", file as unknown as Blob);
        return formData;
      },
    }),
  );
  return uploaded.url;
}
