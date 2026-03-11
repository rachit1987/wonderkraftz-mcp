export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number;
  price: Money;
  compareAtPrice?: Money | null;
  selectedOptions?: Array<{ name: string; value: string }>;
  image?: Image | null;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  productType: string;
  tags: string[];
  vendor: string;
  availableForSale: boolean;
  createdAt?: string;
  updatedAt?: string;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange?: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  images: {
    edges: Array<{ node: Image }>;
  };
  variants: {
    edges: Array<{ node: ProductVariant }>;
  };
  options?: Array<{ name: string; values: string[] }>;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: Image | null;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: Money;
    product: {
      title: string;
      handle: string;
    };
    image?: Image | null;
  };
  cost: {
    totalAmount: Money;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  createdAt?: string;
  updatedAt?: string;
  cost: {
    totalAmount: Money;
    subtotalAmount: Money;
    totalTaxAmount?: Money;
  };
  lines: {
    edges: Array<{ node: CartLine }>;
  };
}

export interface ShopPolicy {
  title: string;
  body: string;
  url: string;
}

export interface ShopInfo {
  name: string;
  description: string;
  brand?: {
    shortDescription?: string;
    slogan?: string;
    logo?: { image?: { url: string } };
    colors?: {
      primary?: { background: string; foreground: string };
      secondary?: { background: string; foreground: string };
    };
  };
  paymentSettings?: {
    currencyCode: string;
    acceptedCardBrands: string[];
    enabledPresentmentCurrencies: string[];
  };
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface SearchResult {
  edges: Array<{ node: Product }>;
  pageInfo: PageInfo;
  totalCount: number;
}
