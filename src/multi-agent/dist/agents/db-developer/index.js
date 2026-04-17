/**
 * Database Developer Agent Wrapper
 *
 * This file provides a clean interface for invoking the DB developer agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */
import * as fs from "fs/promises";
import * as path from "path";
const AGENT_ID = "db-developer";
const AGENTS_FILE = path.join(__dirname, "..", "agents", "db-developer", "AGENTS.md");
const MEMORY_FILE = path.join(__dirname, "..", "memory", "db-developer-memory.json");
export const dbDeveloperConfig = {
    agentId: AGENT_ID,
    name: "Database Developer",
    allowedPaths: ["src/db/", "src/backend/entities/"],
    forbiddenPaths: ["src/frontend/", "src/backend/controller/", "src/test/"],
};
export async function getDBDeveloperSystemPrompt() {
    try {
        return await fs.readFile(AGENTS_FILE, "utf-8");
    }
    catch {
        return "";
    }
}
export async function readDBDeveloperMemory() {
    try {
        const content = await fs.readFile(MEMORY_FILE, "utf-8");
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export default function dbDeveloperExtension(pi) {
    // This extension provides DB-specific tools and context
    pi.on("agent_start", async () => {
        console.log("[DB Developer] Agent initialized");
    });
}
//# sourceMappingURL=index.js.map