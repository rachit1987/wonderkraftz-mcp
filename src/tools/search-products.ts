import { z } from "zod";
import { storefrontQuery } from "../shopify/client.js";
import { SEARCH_PRODUCTS } from "../shopify/queries.js";
import type { SearchResult } from "../shopify/types.js";
import { formatProductSummary } from "../utils/formatters.js";

export const searchProductsSchema = z.object({
  query: z.string().describe("Search query (e.g., 'corporate gifts', 'wedding hamper', 'chocolate box')"),
  limit: z.number().min(1).max(20).default(10).describe("Number of results to return (max 20)"),
});

export type SearchProductsInput = z.infer<typeof searchProductsSchema>;

export async function searchProducts(input: SearchProductsInput): Promise<string> {
  const data = await storefrontQuery<{ search: SearchResult }>(SEARCH_PRODUCTS, {
    query: input.query,
    first: input.limit,
  });

  const products = data.search.edges.map((edge) => edge.node);

  if (products.length === 0) {
    return `No products found for "${input.query}". Try a different search term.`;
  }

  const results = products.map(formatProductSummary);

  return [
    `Found ${data.search.totalCount} products for "${input.query}" (showing ${products.length}):`,
    "",
    ...results,
  ].join("\n");
}
