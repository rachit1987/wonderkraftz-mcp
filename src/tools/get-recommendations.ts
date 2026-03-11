import { z } from "zod";
import { storefrontQuery } from "../shopify/client.js";
import { GET_PRODUCT_RECOMMENDATIONS } from "../shopify/queries.js";
import type { Product } from "../shopify/types.js";
import { formatProductSummary } from "../utils/formatters.js";

export const getRecommendationsSchema = z.object({
  productId: z.string().describe("Shopify product ID to get recommendations for (e.g., 'gid://shopify/Product/12345')"),
});

export type GetRecommendationsInput = z.infer<typeof getRecommendationsSchema>;

export async function getRecommendations(input: GetRecommendationsInput): Promise<string> {
  const data = await storefrontQuery<{
    productRecommendations: Product[] | null;
  }>(GET_PRODUCT_RECOMMENDATIONS, {
    productId: input.productId,
  });

  const products = data.productRecommendations;
  if (!products || products.length === 0) {
    return `No recommendations found for this product. Try searching for related products instead.`;
  }

  const results = products.map(formatProductSummary);

  return [
    `Recommended products (${products.length}):`,
    "",
    ...results,
  ].join("\n");
}
