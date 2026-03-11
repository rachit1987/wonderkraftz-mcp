import { z } from "zod";
import { storefrontQuery } from "../shopify/client.js";
import { GET_PRODUCT_BY_HANDLE, GET_PRODUCT_BY_ID } from "../shopify/queries.js";
import type { Product } from "../shopify/types.js";
import { formatProductDetailed } from "../utils/formatters.js";

export const getProductDetailsSchema = z.object({
  handle: z.string().optional().describe("Product handle/slug (e.g., 'luxury-gift-hamper')"),
  id: z.string().optional().describe("Shopify product ID (e.g., 'gid://shopify/Product/12345')"),
});

export type GetProductDetailsInput = z.infer<typeof getProductDetailsSchema>;

export async function getProductDetails(input: GetProductDetailsInput): Promise<string> {
  if (!input.handle && !input.id) {
    return "Please provide either a product 'handle' (slug) or 'id'.";
  }

  let product: Product | null = null;

  if (input.handle) {
    const data = await storefrontQuery<{ productByHandle: Product | null }>(
      GET_PRODUCT_BY_HANDLE,
      { handle: input.handle }
    );
    product = data.productByHandle;
  } else if (input.id) {
    const data = await storefrontQuery<{ product: Product | null }>(
      GET_PRODUCT_BY_ID,
      { id: input.id }
    );
    product = data.product;
  }

  if (!product) {
    return `Product not found. Please check the handle or ID and try again.`;
  }

  return formatProductDetailed(product);
}
