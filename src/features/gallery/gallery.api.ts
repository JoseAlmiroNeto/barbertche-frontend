import {
  apiClient,
  authorized,
  unwrapApiResponse,
} from "../../services/api";
import { uploadImageIfNeeded } from "../uploads/uploads.api";
import type { GalleryItem } from "./gallery.types";

export async function getGallery(token: string) {
  return unwrapApiResponse(
    await apiClient.GET("/api/gallery", { headers: authorized(token) }),
  );
}

export async function createGalleryItem(
  token: string,
  payload: Pick<GalleryItem, "title" | "image">,
) {
  const image = await uploadImageIfNeeded(token, payload.image, "gallery");
  return unwrapApiResponse(
    await apiClient.POST("/api/gallery", {
      headers: authorized(token),
      body: { ...payload, image },
    }),
  );
}

export async function updateGalleryItem(
  token: string,
  id: string,
  payload: Pick<GalleryItem, "title" | "image">,
) {
  const image = await uploadImageIfNeeded(token, payload.image, "gallery");
  return unwrapApiResponse(
    await apiClient.PATCH("/api/gallery/{id}", {
      headers: authorized(token),
      params: { path: { id } },
      body: { ...payload, image },
    }),
  );
}

export async function deleteGalleryItem(token: string, id: string) {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/gallery/{id}", {
      headers: authorized(token),
      params: { path: { id } },
    }),
  );
}
