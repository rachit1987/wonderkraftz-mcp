import { storefrontQuery } from "../shopify/client.js";
import { GET_SHOP_POLICIES } from "../shopify/queries.js";
import type { ShopPolicy } from "../shopify/types.js";

interface PoliciesResponse {
  shop: {
    privacyPolicy: ShopPolicy | null;
    refundPolicy: ShopPolicy | null;
    shippingPolicy: ShopPolicy | null;
    termsOfService: ShopPolicy | null;
  };
}

function formatPolicy(policy: ShopPolicy | null, fallbackTitle: string): string {
  if (!policy) {
    return `**${fallbackTitle}**: Not available`;
  }

  const bodyPreview = policy.body.length > 500
    ? policy.body.substring(0, 500) + "..."
    : policy.body;

  return [
    `**${policy.title}**`,
    bodyPreview,
    policy.url ? `Full policy: ${policy.url}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function getStorePolicies(): Promise<string> {
  const data = await storefrontQuery<PoliciesResponse>(GET_SHOP_POLICIES);

  const sections = [
    formatPolicy(data.shop.shippingPolicy, "Shipping Policy"),
    formatPolicy(data.shop.refundPolicy, "Refund Policy"),
    formatPolicy(data.shop.privacyPolicy, "Privacy Policy"),
    formatPolicy(data.shop.termsOfService, "Terms of Service"),
  ];

  return ["**Wonderkraftz Store Policies**", "", ...sections].join("\n\n---\n\n");
}
