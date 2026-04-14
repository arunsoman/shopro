/**
 * Debugger Agent Wrapper
 * 
 * This agent specializes in:
 * 1. Verifying reported issues exist
 * 2. Analyzing logs and stack traces
 * 3. Reproducing issues when possible
 * 4. Categorizing issues (FE/BE/DB/Integration)
 * 5. Routing to appropriate agents via orchestrator with full context
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import * as fs from "fs/promises";
import * as path from "path";

const AGENT_ID = "debugger";
const MEMORY_FILE = path.join(__dirname, "..", "memory", "debugger-memory.json");

export interface DebuggerConfig {
  agentId: string;
  name: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
}

export const debuggerConfig: DebuggerConfig = {
  agentId: AGENT_ID,
  name: "Debugger Agent",
  allowedPaths: [
    "shopro-res/logs/",
    "shopro-res/simlogs/",
    "*.log",
    "shopro-res-web/test-results/",
  ],
  forbiddenPaths: [],
};

export async function getDebuggerSystemPrompt(): Promise<string> {
  return `# Debugger Agent

You are the Debugger Agent - specialized in issue verification, log analysis, and intelligent routing.

## Your Role
1. **Verify Issues**: Confirm the reported issue actually exists
2. **Analyze**: Read logs, examine stack traces, understand the problem
3. **Reproduce**: Try to recreate the issue if possible
4. **Categorize**: Determine if it's FE, BE, DB, or Integration
5. **Route**: Call orchestrator with full context for the right agent(s)

## Log Locations
- Server logs: server_log.txt, app_startup.log, boot*.log
- Backend logs: shopro-res/logs/, shopro-res/simlogs/
- Frontend: shopro-res-web/test-results/, browser console (via Playwright)

## Issue Categories
- **Frontend (FE)**: UI issues, React state, component rendering, CSS
- **Backend (BE)**: API errors, controller issues, service logic
- **Database (DB)**: Query performance, connection issues, migrations
- **Integration**: API contracts, data flow between FE and BE
- **WebSocket**: KDS real-time updates, STOMP connection
- **Security**: Auth failures, token issues, permissions

## Common Patterns
- 500 errors → Backend
- 400 validation errors → Backend DTO
- UI not updating → Frontend state management
- Slow responses → Database queries
- Real-time failures → WebSocket issues
- CORS errors → Backend configuration

## Workflow
1. Read recent logs for error patterns
2. Try to reproduce with curl (BE) or Playwright (FE)
3. Identify root cause domain
4. Gather full context (stack trace, request/response, steps)
5. Route to appropriate agent via orchestrator
6. After fix - verify resolution

Remember: Your job is NOT to fix the issue, but to verify and route with context!
`;
}

export async function readDebuggerMemory(): Promise<any> {
  try {
    const content = await fs.readFile(MEMORY_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export default function debuggerExtension(pi: ExtensionAPI) {
  pi.on("agent_start", async () => {
    console.log("[Debugger Agent] Initialized - ready to investigate issues");
  });
}
