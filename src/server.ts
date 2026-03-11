import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { searchProducts, searchProductsSchema } from "./tools/search-products.js";
import { getProductDetails, getProductDetailsSchema } from "./tools/get-product-details.js";
import {
  getCollections,
  getCollectionsSchema,
  getCollectionProducts,
  getCollectionProductsSchema,
} from "./tools/get-collections.js";
import { getRecommendations, getRecommendationsSchema } from "./tools/get-recommendations.js";
import {
  createCart,
  createCartSchema,
  addToCart,
  addToCartSchema,
  updateCart,
  updateCartSchema,
  removeFromCart,
  removeFromCartSchema,
  getCart,
  getCartSchema,
} from "./tools/cart.js";
import { getStorePolicies } from "./tools/store-policies.js";
import { storefrontQuery } from "./shopify/client.js";
import { GET_SHOP_INFO, GET_COLLECTIONS } from "./shopify/queries.js";
import type { ShopInfo, Collection, PageInfo } from "./shopify/types.js";

export function createWonderkraftzServer(): McpServer {
  const server = new McpServer({
    name: "wonderkraftz",
    version: "1.0.0",
    description:
      "MCP server for Wonderkraftz Premium Gifting Studio. Browse products, get recommendations, manage cart, and checkout.",
  });

  // --- Tools ---

  server.tool(
    "search_products",
    "Search the Wonderkraftz product catalog by keyword, occasion, or gift type. Returns product names, prices, availability, and IDs.",
    searchProductsSchema.shape,
    async (input) => {
      const result = await searchProducts(searchProductsSchema.parse(input));
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "get_product_details",
    "Get full details for a specific Wonderkraftz product including all variants, pricing, images, and options. Use handle (slug) or product ID.",
    getProductDetailsSchema.shape,
    async (input) => {
      const result = await getProductDetails(getProductDetailsSchema.parse(input));
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "get_collections",
    "List all product collections/categories in the Wonderkraftz store (e.g., Corporate Gifts, Wedding Gifts, Festival Hampers).",
    getCollectionsSchema.shape,
    async (input) => {
      const result = await getCollections(getCollectionsSchema.parse(input));
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "get_collection_products",
    "Browse products within a specific Wonderkraftz collection by its handle/slug.",
    getCollectionProductsSchema.shape,
    async (input) => {
      const result = await getCollectionProducts(getCollectionProductsSchema.parse(input));
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "get_recommendations",
    "Get product recommendations based on a specific Wonderkraftz product. Useful for suggesting similar or complementary gifts.",
    getRecommendationsSchema.shape,
    async (input) => {
      const result = await getRecommendations(getRecommendationsSchema.parse(input));
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "create_cart",
    "Create a new shopping cart with one or more Wonderkraftz products. Returns cart ID and checkout URL.",
    createCartSchema.shape,
    async (input) => {
      const result = await createCart(createCartSchema.parse(input));
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "add_to_cart",
    "Add products to an existing Wonderkraftz shopping cart.",
    addToCartSchema.shape,
    async (input) => {
      const result = await addToCart(addToCartSchema.parse(input));
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "update_cart",
    "Update quantities of items in a Wonderkraftz shopping cart. Set quantity to 0 to remove an item.",
    updateCartSchema.shape,
    async (input) => {
      const result = await updateCart(updateCartSchema.parse(input));
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "remove_from_cart",
    "Remove specific items from a Wonderkraftz shopping cart by their line item IDs.",
    removeFromCartSchema.shape,
    async (input) => {
      const result = await removeFromCart(removeFromCartSchema.parse(input));
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "get_cart",
    "View the current contents of a Wonderkraftz shopping cart including items, quantities, totals, and checkout URL.",
    getCartSchema.shape,
    async (input) => {
      const result = await getCart(getCartSchema.parse(input));
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "get_checkout_url",
    "Get the checkout URL for a Wonderkraftz shopping cart to complete the purchase in a browser.",
    getCartSchema.shape,
    async (input) => {
      const parsed = getCartSchema.parse(input);
      const data = await storefrontQuery<{ cart: { checkoutUrl: string } | null }>(
        `query GetCheckoutUrl($cartId: ID!) { cart(id: $cartId) { checkoutUrl } }`,
        { cartId: parsed.cartId }
      );
      if (!data.cart) {
        return { content: [{ type: "text", text: "Cart not found." }] };
      }
      return {
        content: [
          {
            type: "text",
            text: `Checkout URL: ${data.cart.checkoutUrl}\n\nOpen this URL in a browser to complete your purchase.`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_store_policies",
    "Get Wonderkraftz store policies including shipping, returns, privacy, and terms of service.",
    {},
    async () => {
      const result = await getStorePolicies();
      return { content: [{ type: "text", text: result }] };
    }
  );

  // --- Resources ---

  server.resource(
    "store-info",
    "wonderkraftz://store/info",
    { description: "Wonderkraftz store information, branding, and payment settings" },
    async () => {
      const data = await storefrontQuery<{ shop: ShopInfo }>(GET_SHOP_INFO);
      const shop = data.shop;

      const info = [
        `# ${shop.name}`,
        "",
        shop.description || "",
        "",
        shop.brand?.slogan ? `**Slogan:** ${shop.brand.slogan}` : "",
        shop.brand?.shortDescription ? `**About:** ${shop.brand.shortDescription}` : "",
        shop.brand?.logo?.image?.url ? `**Logo:** ${shop.brand.logo.image.url}` : "",
        "",
        shop.paymentSettings
          ? [
              `**Currency:** ${shop.paymentSettings.currencyCode}`,
              `**Accepted Cards:** ${shop.paymentSettings.acceptedCardBrands.join(", ")}`,
            ].join("\n")
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      return { contents: [{ uri: "wonderkraftz://store/info", text: info, mimeType: "text/markdown" }] };
    }
  );

  server.resource(
    "collections",
    "wonderkraftz://collections",
    { description: "List of all Wonderkraftz product collections" },
    async () => {
      const data = await storefrontQuery<{
        collections: { edges: Array<{ node: Collection }>; pageInfo: PageInfo };
      }>(GET_COLLECTIONS, { first: 50 });

      const collections = data.collections.edges.map((e) => e.node);
      const text = collections
        .map(
          (c) =>
            `- **${c.title}** (${c.handle}): ${c.description || "No description"}`
        )
        .join("\n");

      return {
        contents: [
          {
            uri: "wonderkraftz://collections",
            text: `# Wonderkraftz Collections\n\n${text}`,
            mimeType: "text/markdown",
          },
        ],
      };
    }
  );

  return server;
}
