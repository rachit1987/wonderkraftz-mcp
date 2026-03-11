import { z } from "zod";
import { storefrontQuery } from "../shopify/client.js";
import { CREATE_CART, ADD_TO_CART, UPDATE_CART_LINES, REMOVE_CART_LINES, GET_CART } from "../shopify/mutations.js";
import type { Cart } from "../shopify/types.js";
import { formatCart } from "../utils/formatters.js";

export const createCartSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().describe("Product variant ID (e.g., 'gid://shopify/ProductVariant/12345')"),
    quantity: z.number().min(1).default(1).describe("Quantity to add"),
  })).min(1).describe("Items to add to the new cart"),
});

export const addToCartSchema = z.object({
  cartId: z.string().describe("Cart ID (e.g., 'gid://shopify/Cart/...')"),
  items: z.array(z.object({
    variantId: z.string().describe("Product variant ID"),
    quantity: z.number().min(1).default(1).describe("Quantity to add"),
  })).min(1).describe("Items to add"),
});

export const updateCartSchema = z.object({
  cartId: z.string().describe("Cart ID"),
  items: z.array(z.object({
    lineId: z.string().describe("Cart line item ID (from get_cart)"),
    quantity: z.number().min(0).describe("New quantity (0 to remove)"),
  })).min(1).describe("Line items to update"),
});

export const removeFromCartSchema = z.object({
  cartId: z.string().describe("Cart ID"),
  lineIds: z.array(z.string()).min(1).describe("Cart line item IDs to remove"),
});

export const getCartSchema = z.object({
  cartId: z.string().describe("Cart ID"),
});

export type CreateCartInput = z.infer<typeof createCartSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
export type GetCartInput = z.infer<typeof getCartSchema>;

function handleUserErrors(errors: Array<{ field: string[]; message: string }>): string | null {
  if (errors.length > 0) {
    return `Cart operation failed:\n${errors.map((e) => `  - ${e.message} (field: ${e.field.join(".")})`).join("\n")}`;
  }
  return null;
}

export async function createCart(input: CreateCartInput): Promise<string> {
  const lines = input.items.map((item) => ({
    merchandiseId: item.variantId,
    quantity: item.quantity,
  }));

  const data = await storefrontQuery<{
    cartCreate: { cart: Cart; userErrors: Array<{ field: string[]; message: string }> };
  }>(CREATE_CART, { input: { lines } });

  const errorMsg = handleUserErrors(data.cartCreate.userErrors);
  if (errorMsg) return errorMsg;

  return [
    "Cart created successfully!",
    "",
    formatCart(data.cartCreate.cart),
  ].join("\n");
}

export async function addToCart(input: AddToCartInput): Promise<string> {
  const lines = input.items.map((item) => ({
    merchandiseId: item.variantId,
    quantity: item.quantity,
  }));

  const data = await storefrontQuery<{
    cartLinesAdd: { cart: Cart; userErrors: Array<{ field: string[]; message: string }> };
  }>(ADD_TO_CART, { cartId: input.cartId, lines });

  const errorMsg = handleUserErrors(data.cartLinesAdd.userErrors);
  if (errorMsg) return errorMsg;

  return [
    "Items added to cart!",
    "",
    formatCart(data.cartLinesAdd.cart),
  ].join("\n");
}

export async function updateCart(input: UpdateCartInput): Promise<string> {
  const lines = input.items.map((item) => ({
    id: item.lineId,
    quantity: item.quantity,
  }));

  const data = await storefrontQuery<{
    cartLinesUpdate: { cart: Cart; userErrors: Array<{ field: string[]; message: string }> };
  }>(UPDATE_CART_LINES, { cartId: input.cartId, lines });

  const errorMsg = handleUserErrors(data.cartLinesUpdate.userErrors);
  if (errorMsg) return errorMsg;

  return [
    "Cart updated!",
    "",
    formatCart(data.cartLinesUpdate.cart),
  ].join("\n");
}

export async function removeFromCart(input: RemoveFromCartInput): Promise<string> {
  const data = await storefrontQuery<{
    cartLinesRemove: { cart: Cart; userErrors: Array<{ field: string[]; message: string }> };
  }>(REMOVE_CART_LINES, { cartId: input.cartId, lineIds: input.lineIds });

  const errorMsg = handleUserErrors(data.cartLinesRemove.userErrors);
  if (errorMsg) return errorMsg;

  return [
    "Items removed from cart!",
    "",
    formatCart(data.cartLinesRemove.cart),
  ].join("\n");
}

export async function getCart(input: GetCartInput): Promise<string> {
  const data = await storefrontQuery<{ cart: Cart | null }>(GET_CART, {
    cartId: input.cartId,
  });

  if (!data.cart) {
    return "Cart not found. It may have expired or been completed.";
  }

  return formatCart(data.cart);
}
