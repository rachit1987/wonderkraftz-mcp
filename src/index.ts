#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createWonderkraftzServer } from "./server.js";

async function main() {
  const server = createWonderkraftzServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Wonderkraftz MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
