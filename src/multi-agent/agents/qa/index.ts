/**
 * QA Agent Wrapper
 * 
 * This file provides a clean interface for invoking the QA agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import * as fs from "fs/promises";
import * as path from "path";

const AGENT_ID = "qa";
const AGENTS_FILE = path.join(__dirname, "..", "qa", "AGENTS.md");
const MEMORY_FILE = path.join(__dirname, "..", "memory", "qa-memory.json");

export interface QAConfig {
  agentId: string;
  name: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
}

export const qaConfig: QAConfig = {
  agentId: AGENT_ID,
  name: "QA Agent",
  allowedPaths: ["reports/"],
  forbiddenPaths: ["src/"],
};

export async function getQASystemPrompt(): Promise<string> {
  try {
    return await fs.readFile(AGENTS_FILE, "utf-8");
  } catch {
    return "";
  }
}

export async function readQAMemory(): Promise<any> {
  try {
    const content = await fs.readFile(MEMORY_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export default function qaExtension(pi: ExtensionAPI) {
  // This extension provides QA-specific tools and context
  pi.on("agent_start", async () => {
    console.log("[QA] Agent initialized");
  });
}
