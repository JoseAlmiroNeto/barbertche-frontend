import type { components } from "../../generated/api-types";
import {
  apiClient,
  authorized,
  unwrapApiResponse,
} from "../../services/api";
import type { Product } from "./products.types";
import { uploadImageIfNeeded } from "../uploads/uploads.api";

type ProductResponse = components["schemas"]["ProductResponseDto"];
type ProductPayload = components["schemas"]["UpdateProductDto"];

const fallbackProductImage =
  "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=900&q=80";

export async function getProducts(token: string) {
  return unwrapApiResponse(
    await apiClient.GET("/api/products", { headers: authorized(token) }),
  );
}

export async function createProduct(
  token: string,
  name: string,
  price: number,
  image?: string,
) {
  const imageUrl = image
    ? await uploadImageIfNeeded(token, image, "products")
    : fallbackProductImage;
  const product = unwrapApiResponse(
    await apiClient.POST("/api/products", {
      headers: authorized(token),
      body: {
        name,
        price,
        image: imageUrl,
        description: "Produto vendido no estabelecimento.",
        available: true,
      },
    }),
  );
  return normalizeProduct(product);
}

export async function updateProduct(
  token: string,
  id: string,
  payload: ProductPayload,
) {
  const imageUrl = payload.image
    ? await uploadImageIfNeeded(token, payload.image, "products")
    : undefined;
  const product = unwrapApiResponse(
    await apiClient.PATCH("/api/products/{id}", {
      headers: authorized(token),
      params: { path: { id } },
      body: {
        ...payload,
        ...(imageUrl ? { image: imageUrl } : {}),
      },
    }),
  );
  return normalizeProduct(product);
}

export function deleteProduct(token: string, id: string) {
  return apiClient
    .DELETE("/api/products/{id}", {
      headers: authorized(token),
      params: { path: { id } },
    })
    .then(unwrapApiResponse);
}

function normalizeProduct(product: ProductResponse): Product {
  return {
    ...product,
    image: product.image ?? fallbackProductImage,
    description: product.description ?? "Produto vendido no estabelecimento.",
  };
}
