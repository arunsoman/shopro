/**
 * Backend Developer Agent Wrapper
 *
 * This file provides a clean interface for invoking the BE developer agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */
import * as fs from "fs/promises";
import * as path from "path";
const AGENT_ID = "be-developer";
const AGENTS_FILE = path.join(__dirname, "..", "be-developer", "AGENTS.md");
const MEMORY_FILE = path.join(__dirname, "..", "memory", "be-developer-memory.json");
export const beDeveloperConfig = {
    agentId: AGENT_ID,
    name: "Backend Developer",
    allowedPaths: ["src/backend/"],
    forbiddenPaths: ["src/frontend/", "src/db/", "src/test/"],
};
export async function getBEDeveloperSystemPrompt() {
    try {
        return await fs.readFile(AGENTS_FILE, "utf-8");
    }
    catch {
        return "";
    }
}
export async function readBEDeveloperMemory() {
    try {
        const content = await fs.readFile(MEMORY_FILE, "utf-8");
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export default function beDeveloperExtension(pi) {
    // This extension provides BE-specific tools and context
    pi.on("agent_start", async () => {
        console.log("[BE Developer] Agent initialized");
    });
}
//# sourceMappingURL=index.js.map