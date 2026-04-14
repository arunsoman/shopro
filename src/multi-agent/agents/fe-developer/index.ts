/**
 * Frontend Developer Agent Wrapper
 * 
 * This file provides a clean interface for invoking the FE developer agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import * as fs from "fs/promises";
import * as path from "path";

const AGENT_ID = "fe-developer";
const AGENTS_FILE = path.join(__dirname, "..", "fe-developer", "AGENTS.md");
const MEMORY_FILE = path.join(__dirname, "..", "memory", "fe-developer-memory.json");

export interface FEDeveloperConfig {
  agentId: string;
  name: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
}

export const feDeveloperConfig: FEDeveloperConfig = {
  agentId: AGENT_ID,
  name: "Frontend Developer",
  allowedPaths: ["src/frontend/"],
  forbiddenPaths: ["src/backend/", "src/db/", "src/test/"],
};

export async function getFEDeveloperSystemPrompt(): Promise<string> {
  try {
    return await fs.readFile(AGENTS_FILE, "utf-8");
  } catch {
    return "";
  }
}

export async function readFEDeveloperMemory(): Promise<any> {
  try {
    const content = await fs.readFile(MEMORY_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export default function feDeveloperExtension(pi: ExtensionAPI) {
  // This extension provides FE-specific tools and context
  pi.on("agent_start", async () => {
    console.log("[FE Developer] Agent initialized");
  });
}
