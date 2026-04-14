/**
 * Memory Extension for Pi Multi-Agent System
 * 
 * Implements persistent memory for each agent using event hooks.
 * This extension is loaded by each Pi agent session to inject memory context.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import * as fs from "fs/promises";
import * as path from "path";

const MEMORY_DIR = path.join(process.cwd(), "src/multi-agent", "memory");
const MAX_MEMORY_SIZE = 16 * 1024;
const MAX_CORE_LEARNINGS = 50;
const MAX_RECENT_FIXES = 10;

// Track agent ID across events
let currentAgentId = "unknown";

function getMemoryFileJsonPath(agentId: string): string {
  return path.join(MEMORY_DIR, `${agentId}-memory.json`);
}

async function ensureMemoryDir(): Promise<void> {
  try {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

async function readMemoryJson(agentId: string): Promise<any> {
  const jsonPath = getMemoryFileJsonPath(agentId);
  try {
    const content = await fs.readFile(jsonPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function writeMemoryJson(agentId: string, data: any): Promise<void> {
  await ensureMemoryDir();
  const jsonPath = getMemoryFileJsonPath(agentId);
  await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), "utf-8");
}

function generateMemoryMarkdown(data: any): string {
  if (!data) return "";
  
  let md = "# Memory\n> Auto-managed.\n\n";
  
  md += "## Core Learnings\n";
  const learnings = data.coreLearnings || [];
  for (const entry of learnings.slice(0, MAX_CORE_LEARNINGS)) {
    md += `- [${entry.timestamp}] ${entry.content}\n`;
  }
  
  md += "\n## Recent Fixes\n";
  const fixes = data.recentFixes || [];
  for (const entry of fixes.slice(0, MAX_RECENT_FIXES)) {
    md += `- [${(entry.timestamp || "").split('T')[0]}] ${entry.content}\n`;
  }
  
  md += "\n## Patterns Established\n";
  for (const pattern of (data.patternsEstablished || [])) {
    md += `- ${pattern}\n`;
  }
  
  md += "\n## Known Pitfalls\n";
  for (const pitfall of (data.knownPitfalls || [])) {
    md += `- ${pitfall}\n`;
  }
  
  return md;
}

export default function memoryExtension(pi: ExtensionAPI) {
  // Set agent ID on session start
  pi.on("session_start", () => {
    console.log(`[Memory] Extension loaded`);
  });

  // Inject memory before agent starts
  pi.on("before_agent_start", async (ctx) => {
    try {
      // Try to determine agent ID from system prompt or other context
      // Default to reading from memory file names
      const possibleAgents = ["fe-developer", "be-developer", "db-developer", "tester", "qa"];
      
      // Read memory files to find which one has data or just use first one
      for (const agent of possibleAgents) {
        const memData = await readMemoryJson(agent);
        if (memData && (memData.coreLearnings?.length > 0 || memData.recentFixes?.length > 0)) {
          currentAgentId = agent;
          break;
        }
      }
      
      const memoryData = await readMemoryJson(currentAgentId);
      
      if (!memoryData) {
        console.log(`[Memory] No memory file for ${currentAgentId}`);
        return;
      }
      
      const memoryMarkdown = generateMemoryMarkdown(memoryData);
      
      if (memoryMarkdown.length > MAX_MEMORY_SIZE) {
        console.log(`[Memory] Pruning memory...`);
        const pruned = { ...memoryData };
        while (generateMemoryMarkdown(pruned).length > MAX_MEMORY_SIZE && pruned.coreLearnings?.length > 0) {
          pruned.coreLearnings.shift();
        }
        await writeMemoryJson(currentAgentId, pruned);
      }
      
      // Get and modify system prompt
      const enhancedPrompt = ctx.systemPrompt + "\n\n## My Accumulated Learnings\n" + generateMemoryMarkdown(memoryData);
      console.log(`[Memory] Injected for ${currentAgentId}`);
      return { systemPrompt: enhancedPrompt };
    } catch (error) {
      console.error(`[Memory] Error:`, error);
      return undefined;
    }
  });

  // Save learnings after agent ends
  pi.on("agent_end", async (ctx) => {
    try {
      const messages = ctx.messages;
      const lastMessage = messages[messages.length - 1];
      
      if (!lastMessage || lastMessage.role !== "assistant") return;
      
      // Get response content
      const responseText = lastMessage.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n");
      
      // Extract potential learnings
      const patterns = [/learned:?\s*(.*)/i, /important:?\s*(.*)/i, /note:?\s*(.*)/i];
      const learnings: string[] = [];
      
      for (const pattern of patterns) {
        const match = responseText.match(pattern);
        if (match && match[1]) {
          learnings.push(match[1].trim());
        }
      }
      
      if (learnings.length > 0) {
        const memoryData = await readMemoryJson(currentAgentId) || {
          coreLearnings: [],
          recentFixes: [],
          patternsEstablished: [],
          knownPitfalls: [],
        };
        
        const timestamp = new Date().toISOString();
        
        for (const learning of learnings) {
          memoryData.coreLearnings = memoryData.coreLearnings || [];
          memoryData.coreLearnings.push({ timestamp, content: learning });
        }
        
        if (memoryData.coreLearnings.length > MAX_CORE_LEARNINGS) {
          memoryData.coreLearnings = memoryData.coreLearnings.slice(-MAX_CORE_LEARNINGS);
        }
        
        await writeMemoryJson(currentAgentId, memoryData);
        console.log(`[Memory] Saved ${learnings.length} learnings`);
      }
    } catch (error) {
      console.error(`[Memory] Save error:`, error);
    }
  });
}

export { };
