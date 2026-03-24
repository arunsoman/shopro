#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import pg from "pg";

const { Pool } = pg;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "shopro_marketplace_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
};

class PostgresServer {
  constructor() {
    this.server = new Server(
      {
        name: "postgres-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.pool = new Pool(dbConfig);

    this.setupTools();
    
    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "query",
          description: "Execute a SQL query against the PostgreSQL database",
          inputSchema: {
            type: "object",
            properties: {
              sql: {
                type: "string",
                description: "The SQL query to execute",
              },
            },
            required: ["sql"],
          },
        },
        {
          name: "list_tables",
          description: "List all tables in the current database",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "describe_table",
          description: "Get the schema of a specific table",
          inputSchema: {
            type: "object",
            properties: {
              table_name: {
                type: "string",
                description: "The name of the table to describe",
              },
            },
            required: ["table_name"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "query": {
          const { sql } = request.params.arguments;
          try {
            const result = await this.pool.query(sql);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result.rows, null, 2),
                },
                ],
            };
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: `Database error: ${error.message}`,
                },
              ],
              isError: true,
            };
          }
        }

        case "list_tables": {
          try {
            const result = await this.pool.query(`
              SELECT table_name 
              FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
            `);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result.rows, null, 2),
                },
              ],
            };
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: `Database error: ${error.message}`,
                },
              ],
              isError: true,
            };
          }
        }

        case "describe_table": {
          const { table_name } = request.params.arguments;
          try {
            const result = await this.pool.query(`
              SELECT column_name, data_type, is_nullable, column_default
              FROM information_schema.columns
              WHERE table_name = $1
              ORDER BY ordinal_position
            `, [table_name]);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result.rows, null, 2),
                },
              ],
            };
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: `Database error: ${error.message}`,
                },
              ],
              isError: true,
            };
          }
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("PostgreSQL MCP server running on stdio");
  }
}

const server = new PostgresServer();
server.run().catch(console.error);
