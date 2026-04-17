/**
 * Frontend Developer Agent Wrapper
 *
 * This file provides a clean interface for invoking the FE developer agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */
import * as fs from "fs/promises";
import * as path from "path";
const AGENT_ID = "fe-developer";
const AGENTS_FILE = path.join(__dirname, "..", "fe-developer", "AGENTS.md");
const MEMORY_FILE = path.join(__dirname, "..", "memory", "fe-developer-memory.json");
export const feDeveloperConfig = {
    agentId: AGENT_ID,
    name: "Frontend Developer",
    allowedPaths: ["src/frontend/"],
    forbiddenPaths: ["src/backend/", "src/db/", "src/test/"],
};
export async function getFEDeveloperSystemPrompt() {
    try {
        return await fs.readFile(AGENTS_FILE, "utf-8");
    }
    catch {
        return "";
    }
}
export async function readFEDeveloperMemory() {
    try {
        const content = await fs.readFile(MEMORY_FILE, "utf-8");
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export default function feDeveloperExtension(pi) {
    // This extension provides FE-specific tools and context
    pi.on("agent_start", async () => {
        console.log("[FE Developer] Agent initialized");
    });
}
//# sourceMappingURL=index.js.map