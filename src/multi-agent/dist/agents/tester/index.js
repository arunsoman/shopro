/**
 * Tester Agent Wrapper
 *
 * This file provides a clean interface for invoking the Tester agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */
import * as fs from "fs/promises";
import * as path from "path";
const AGENT_ID = "tester";
const AGENTS_FILE = path.join(__dirname, "..", "tester", "AGENTS.md");
const MEMORY_FILE = path.join(__dirname, "..", "memory", "tester-memory.json");
export const testerConfig = {
    agentId: AGENT_ID,
    name: "Tester",
    allowedPaths: ["src/test/"],
    forbiddenPaths: ["src/frontend/", "src/backend/", "src/db/"],
};
export async function getTesterSystemPrompt() {
    try {
        return await fs.readFile(AGENTS_FILE, "utf-8");
    }
    catch {
        return "";
    }
}
export async function readTesterMemory() {
    try {
        const content = await fs.readFile(MEMORY_FILE, "utf-8");
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export default function testerExtension(pi) {
    // This extension provides Tester-specific tools and context
    pi.on("agent_start", async () => {
        console.log("[Tester] Agent initialized");
    });
}
//# sourceMappingURL=index.js.map