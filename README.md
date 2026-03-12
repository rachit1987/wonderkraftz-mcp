<p align="center">
  <img src="logo.png" alt="Wonderkraftz Logo" width="120" />
</p>

# Wonderkraftz MCP Server

An MCP (Model Context Protocol) server that connects AI assistants to the [Wonderkraftz](https://wonderkraftz.in) Premium Gifting Studio. Browse products, get personalized gift recommendations, manage your cart, and checkout — all through natural language in your AI assistant.

## Features

- **Product Search** — Search the catalog by keyword, occasion, or gift type
- **Product Details** — Get full product info including variants, pricing, and images
- **Collections** — Browse curated gift collections (Corporate Gifts, Wedding Hampers, etc.)
- **Recommendations** — Get product suggestions based on a product you like
- **Cart Management** — Create carts, add/update/remove items
- **Checkout** — Get a checkout URL to complete your purchase in a browser
- **Store Policies** — View shipping, returns, and privacy policies

## Quick Start

### Option 1: npx (no install needed)

```bash
SHOPIFY_STORE_DOMAIN=64cd5c-2.myshopify.com \
SHOPIFY_STOREFRONT_ACCESS_TOKEN=aeeec5ab77309d1c339d2971f56b6506 \
npx wonderkraftz-mcp
```

### Option 2: Install globally

```bash
npm install -g wonderkraftz-mcp
```

## Setup

### Cursor IDE

Add to your project's `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "wonderkraftz": {
      "command": "npx",
      "args": ["-y", "wonderkraftz-mcp"],
      "env": {
        "SHOPIFY_STORE_DOMAIN": "64cd5c-2.myshopify.com",
        "SHOPIFY_STOREFRONT_ACCESS_TOKEN": "aeeec5ab77309d1c339d2971f56b6506"
      }
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wonderkraftz": {
      "command": "npx",
      "args": ["-y", "wonderkraftz-mcp"],
      "env": {
        "SHOPIFY_STORE_DOMAIN": "64cd5c-2.myshopify.com",
        "SHOPIFY_STOREFRONT_ACCESS_TOKEN": "aeeec5ab77309d1c339d2971f56b6506"
      }
    }
  }
}
```

### ChatGPT / Grok / Remote AI Tools

Use the hosted HTTP endpoint -- no install needed:

```
https://wonderkraftz-mcp.onrender.com/mcp
```

Point your MCP client to this URL. It supports Streamable HTTP transport.

### Self-Hosted HTTP (optional)

To run the HTTP transport yourself:

```bash
SHOPIFY_STORE_DOMAIN=64cd5c-2.myshopify.com \
SHOPIFY_STOREFRONT_ACCESS_TOKEN=aeeec5ab77309d1c339d2971f56b6506 \
npx wonderkraftz-mcp-http
```

The server starts on `http://localhost:3000/mcp` (or set `PORT` env var).

## Transports

| Transport | Entry Point | Use Case |
|---|---|---|
| **stdio** | `wonderkraftz-mcp` | Cursor, Claude Desktop, local AI tools |
| **Streamable HTTP** | `wonderkraftz-mcp-http` | ChatGPT, Grok, remote/cloud AI tools |

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | Shopify store domain (e.g., `your-store.myshopify.com`) | Yes |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Public Storefront API access token | Yes |
| `PORT` | HTTP server port (default: 3000, HTTP transport only) | No |

## Available Tools

| Tool | Description |
|---|---|
| `search_products` | Search the product catalog by keyword |
| `get_product_details` | Get full details for a product by handle or ID |
| `get_collections` | List all product collections |
| `get_collection_products` | Browse products in a specific collection |
| `get_recommendations` | Get product recommendations based on a product |
| `create_cart` | Create a new shopping cart with items |
| `add_to_cart` | Add items to an existing cart |
| `update_cart` | Update item quantities in a cart |
| `remove_from_cart` | Remove items from a cart |
| `get_cart` | View cart contents and totals |
| `get_checkout_url` | Get checkout URL to complete purchase |
| `get_store_policies` | View store shipping, return, and privacy policies |

## Available Resources

| URI | Description |
|---|---|
| `wonderkraftz://store/info` | Store information, branding, and payment settings |
| `wonderkraftz://collections` | List of all product collections |

## Example Conversations

> "Show me corporate gift options under 2000 rupees"

> "I need a wedding gift hamper. What do you recommend?"

> "Add the luxury gift box to my cart and give me the checkout link"

> "What's your return policy?"

## Development

```bash
git clone https://github.com/rachit1987/wonderkraftz-mcp.git
cd wonderkraftz-mcp
npm install
cp .env.example .env  # Add your Shopify credentials
npm run build
npm start             # stdio transport
npm run start:http    # HTTP transport
```

## License

MIT
