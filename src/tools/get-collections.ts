import { z } from "zod";
import { storefrontQuery } from "../shopify/client.js";
import { GET_COLLECTIONS, GET_COLLECTION_PRODUCTS } from "../shopify/queries.js";
import type { Collection, Product, PageInfo } from "../shopify/types.js";
import { formatProductSummary } from "../utils/formatters.js";

export const getCollectionsSchema = z.object({
  limit: z.number().min(1).max(50).default(20).describe("Number of collections to return"),
});

export const getCollectionProductsSchema = z.object({
  handle: z.string().describe("Collection handle/slug (e.g., 'corporate-gifts')"),
  limit: z.number().min(1).max(20).default(10).describe("Number of products to return"),
});

export type GetCollectionsInput = z.infer<typeof getCollectionsSchema>;
export type GetCollectionProductsInput = z.infer<typeof getCollectionProductsSchema>;

export async function getCollections(input: GetCollectionsInput): Promise<string> {
  const data = await storefrontQuery<{
    collections: { edges: Array<{ node: Collection }>; pageInfo: PageInfo };
  }>(GET_COLLECTIONS, { first: input.limit });

  const collections = data.collections.edges.map((edge) => edge.node);

  if (collections.length === 0) {
    return "No collections found in the store.";
  }

  const lines = collections.map((c) => {
    return [
      `**${c.title}**`,
      `  Handle: ${c.handle}`,
      c.description ? `  Description: ${c.description}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [`Found ${collections.length} collections:`, "", ...lines].join("\n\n");
}

export async function getCollectionProducts(input: GetCollectionProductsInput): Promise<string> {
  const data = await storefrontQuery<{
    collectionByHandle: {
      id: string;
      title: string;
      description: string;
      products: {
        edges: Array<{ node: Product }>;
        pageInfo: PageInfo;
      };
    } | null;
  }>(GET_COLLECTION_PRODUCTS, {
    handle: input.handle,
    first: input.limit,
  });

  const collection = data.collectionByHandle;
  if (!collection) {
    return `Collection "${input.handle}" not found. Use the get_collections tool to see available collections.`;
  }

  const products = collection.products.edges.map((edge) => edge.node);
  if (products.length === 0) {
    return `Collection "${collection.title}" has no products.`;
  }

  const results = products.map(formatProductSummary);

  return [
    `**${collection.title}**${collection.description ? ` — ${collection.description}` : ""}`,
    `Showing ${products.length} products:`,
    "",
    ...results,
  ].join("\n");
}
