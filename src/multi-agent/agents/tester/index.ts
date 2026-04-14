/**
 * Tester Agent Wrapper
 * 
 * This file provides a clean interface for invoking the Tester agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import * as fs from "fs/promises";
import * as path from "path";

const AGENT_ID = "tester";
const AGENTS_FILE = path.join(__dirname, "..", "tester", "AGENTS.md");
const MEMORY_FILE = path.join(__dirname, "..", "memory", "tester-memory.json");

export interface TesterConfig {
  agentId: string;
  name: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
}

export const testerConfig: TesterConfig = {
  agentId: AGENT_ID,
  name: "Tester",
  allowedPaths: ["src/test/"],
  forbiddenPaths: ["src/frontend/", "src/backend/", "src/db/"],
};

export async function getTesterSystemPrompt(): Promise<string> {
  try {
    return await fs.readFile(AGENTS_FILE, "utf-8");
  } catch {
    return "";
  }
}

export async function readTesterMemory(): Promise<any> {
  try {
    const content = await fs.readFile(MEMORY_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export default function testerExtension(pi: ExtensionAPI) {
  // This extension provides Tester-specific tools and context
  pi.on("agent_start", async () => {
    console.log("[Tester] Agent initialized");
  });
}
