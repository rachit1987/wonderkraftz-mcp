import type { Product, Cart, Money } from "../shopify/types.js";

function formatMoney(money: Money): string {
  const amount = parseFloat(money.amount);
  return `${money.currencyCode} ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatProductSummary(product: Product): string {
  const price = formatMoney(product.priceRange.minVariantPrice);
  const maxPrice = formatMoney(product.priceRange.maxVariantPrice);
  const priceDisplay = price === maxPrice ? price : `${price} – ${maxPrice}`;

  const image = product.images.edges[0]?.node;
  const availability = product.availableForSale ? "In Stock" : "Out of Stock";

  const variants = product.variants.edges.map((e) => e.node);
  const variantInfo = variants.length > 1
    ? `  Variants: ${variants.map((v) => `${v.title} (${formatMoney(v.price)})`).join(", ")}`
    : null;

  return [
    `**${product.title}** — ${priceDisplay}`,
    `  Status: ${availability} | Type: ${product.productType || "N/A"}`,
    `  Handle: ${product.handle} | ID: ${product.id}`,
    product.description ? `  ${product.description.substring(0, 150)}${product.description.length > 150 ? "..." : ""}` : null,
    image ? `  Image: ${image.url}` : null,
    variantInfo,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatProductDetailed(product: Product): string {
  const price = formatMoney(product.priceRange.minVariantPrice);
  const maxPrice = formatMoney(product.priceRange.maxVariantPrice);
  const priceDisplay = price === maxPrice ? price : `${price} – ${maxPrice}`;
  const availability = product.availableForSale ? "In Stock" : "Out of Stock";

  const images = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);
  const options = product.options ?? [];

  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN ?? "";
  const productUrl = storeDomain
    ? `https://${storeDomain}/products/${product.handle}`
    : "";

  const sections: string[] = [
    `# ${product.title}`,
    "",
    `**Price:** ${priceDisplay}`,
    `**Status:** ${availability}`,
    `**Type:** ${product.productType || "N/A"}`,
    `**Vendor:** ${product.vendor || "N/A"}`,
    `**Tags:** ${product.tags.length > 0 ? product.tags.join(", ") : "None"}`,
    `**Product ID:** ${product.id}`,
    `**Handle:** ${product.handle}`,
    productUrl ? `**URL:** ${productUrl}` : "",
  ];

  if (product.description) {
    sections.push("", "## Description", "", product.description);
  }

  if (options.length > 0) {
    sections.push("", "## Options");
    for (const opt of options) {
      sections.push(`- **${opt.name}:** ${opt.values.join(", ")}`);
    }
  }

  if (variants.length > 0) {
    sections.push("", "## Variants");
    for (const v of variants) {
      const vAvail = v.availableForSale ? "Available" : "Sold Out";
      const compareAt = v.compareAtPrice
        ? ` (was ${formatMoney(v.compareAtPrice)})`
        : "";
      const optStr = v.selectedOptions
        ? v.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(", ")
        : "";
      sections.push(
        `- **${v.title}** — ${formatMoney(v.price)}${compareAt} [${vAvail}]${optStr ? ` (${optStr})` : ""}`,
        `  Variant ID: ${v.id}`
      );
    }
  }

  if (images.length > 0) {
    sections.push("", "## Images");
    for (const img of images) {
      sections.push(`- ${img.url}${img.altText ? ` (${img.altText})` : ""}`);
    }
  }

  return sections.join("\n");
}

export function formatCart(cart: Cart): string {
  const lines = cart.lines.edges.map((e) => e.node);

  const sections: string[] = [
    `**Shopping Cart** (${cart.totalQuantity} items)`,
    `Cart ID: ${cart.id}`,
    "",
  ];

  if (lines.length === 0) {
    sections.push("Cart is empty.");
  } else {
    sections.push("**Items:**");
    for (const line of lines) {
      const m = line.merchandise;
      sections.push(
        `- ${m.product.title} — ${m.title}`,
        `  Qty: ${line.quantity} × ${formatMoney(m.price)} = ${formatMoney(line.cost.totalAmount)}`,
        `  Line ID: ${line.id}`
      );
    }
  }

  sections.push(
    "",
    `**Subtotal:** ${formatMoney(cart.cost.subtotalAmount)}`,
    `**Total:** ${formatMoney(cart.cost.totalAmount)}`,
    "",
    `**Checkout URL:** ${cart.checkoutUrl}`
  );

  return sections.join("\n");
}
