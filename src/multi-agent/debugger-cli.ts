#!/usr/bin/env npx ts-node
/**
 * Debugger Agent CLI
 * 
 * Usage:
 *   npx ts-node src/multi-agent/debugger-cli.ts "Login button not working"
 *   npx ts-node src/multi-agent/debugger-cli.ts --issue "API returns 500 on /api/ingredients"
 */

import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import {
  AuthStorage,
  createAgentSession,
  DefaultResourceLoader,
  ModelRegistry,
  SessionManager,
  createCodingTools,
} from "@mariozechner/pi-coding-agent";

const PROJECT_ROOT = process.cwd();
const MEMORY_FILE = path.join(PROJECT_ROOT, "src/multi-agent/memory/debugger-memory.json");
const STATE_DIR = path.join(PROJECT_ROOT, "state");
const AGENTS_DIR = path.join(PROJECT_ROOT, "src/multi-agent/agents");

async function getDebuggerSystemPrompt(): Promise<string> {
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

## Project Context
- Backend: shopro-res (Spring Boot 3.x, Java, PostgreSQL)
- Frontend: shopro-res-web (React 19, Vite, TypeScript)
- Database: PostgreSQL on localhost:5432
- Backend runs on port 8080
- Frontend runs on port 5173 (dev)
`;
}

async function readDebuggerMemory(): Promise<any> {
  try {
    const content = await fs.readFile(MEMORY_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Parse the category from debugger output
 */
function parseCategory(output: string): string | null {
  const patterns = [
    /Category.*?:\s*\*\*(Frontend|FE)\*\*/i,
    /Category.*?:\s*\*\*(Backend|BE)\*\*/i,
    /Category.*?:\s*\*\*(Database|DB)\*\*/i,
    /Category.*?:\s*\*\*(Integration)\*\*/i,
    /Routing.*?(Frontend|FE)/i,
    /Route.*?(Frontend|FE)/i,
    /Category.*?:\s*(Frontend|FE)/i,
    /Category.*?:\s*(Backend|BE)/i,
  ];
  
  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match) {
      const category = match[1].toUpperCase();
      if (category === 'FRONTEND') return 'FE';
      if (category === 'BACKEND') return 'BE';
      if (category === 'DATABASE') return 'DB';
      return category;
    }
  }
  return null;
}

/**
 * Invoke the orchestrator with the issue context
 */
async function invokeOrchestrator(issueDescription: string, category: string, context: string) {
  console.log("\n" + "=".repeat(60));
  console.log("🔄 INVOKING ORCHESTRATOR - Pipeline: DB → BE → FE → TESTER → QA");
  console.log("=".repeat(60));
  console.log("   Issue Category: " + category);
  console.log("   Context: " + context.substring(0, 200) + "...\n");

  // Determine which agent to run based on category
  let agentToRun = "";
  if (category === "BE" || category === "DB") {
    agentToRun = "be-developer";
  } else if (category === "FE") {
    agentToRun = "fe-developer";
  } else if (category === "DB") {
    agentToRun = "db-developer";
  }

  // Load the appropriate agent config
  const agentsFile = path.join(AGENTS_DIR, agentToRun, "AGENTS.md");
  
  try {
    const agentsContent = await fs.readFile(agentsFile, "utf-8");
    
    const authStorage = AuthStorage.create();
    const modelRegistry = ModelRegistry.create(authStorage);
    modelRegistry.refresh();
    
    const model = modelRegistry.find("ollama", "minimax-m2:cloud");
    if (!model) {
      throw new Error("Model not found");
    }

    const loader = new DefaultResourceLoader({
      cwd: PROJECT_ROOT,
      agentsFilesOverride: () => ({
        agentsFiles: [{ path: agentsFile, content: agentsContent }],
      }),
    });
    await loader.reload();

    const { session } = await createAgentSession({
      cwd: PROJECT_ROOT,
      model,
      authStorage,
      modelRegistry,
      tools: createCodingTools(PROJECT_ROOT),
      resourceLoader: loader,
    });

    // Build the prompt for the agent
    const prompt = 
`# Task: Fix the issue reported

## Original Issue
${issueDescription}

## Debugger Analysis
${context}

## Your Task
1. Analyze the issue based on the debugger's findings
2. Implement the fix
3. Write tests if needed
4. Write summary to state/${agentToRun}-output.json

Follow the ${agentToRun} agent guidelines.`;

    console.log("\n🚀 Running " + agentToRun + " agent...\n");
    
    await session.prompt(prompt);

    console.log("\n✅ " + agentToRun + " completed");
    console.log("   Output saved to: state/" + agentToRun + "-output.json");
    
  } catch (error) {
    console.error("\n❌ Orchestrator error:", error);
  }
}

/**
 * Run the full orchestrator pipeline
 */
async function runFullOrchestrator(issueDescription: string, context: string) {
  console.log("\n" + "=".repeat(60));
  console.log("🔄 INVOKING FULL ORCHESTRATOR PIPELINE");
  console.log("   Pipeline: DB → BE → FE → TESTER → QA");
  console.log("   Max Retries: 3");
  console.log("=".repeat(60) + "\n");

  const authStorage = AuthStorage.create();
  const modelRegistry = ModelRegistry.create(authStorage);
  modelRegistry.refresh();
  
  const model = modelRegistry.find("ollama", "minimax-m2:cloud");
  if (!model) {
    throw new Error("Model not found. Run pi login first.");
  }

  // Create orchestrator session with all agents
  const orchestratorPrompt = 
`# Full-Stack Orchestrator Pipeline

## Issue
${issueDescription}

## Debugger Analysis
${context}

---

## Execute the Full Pipeline

Please execute the following phases in order:

### Phase 1: DB Developer
- If database changes are needed, run db-developer agent

### Phase 2: Backend Developer  
- Run be-developer agent to fix backend issues

### Phase 3: Frontend Developer
- Run fe-developer agent to fix frontend issues

### Phase 4: Tester
- Run tester agent to write/update tests

### Phase 5: QA
- Run qa agent to verify the fix
- If QA fails, retry the appropriate agents

## Important
- After each phase, write output to state/{agent}-output.json
- After QA, write report to reports/qa-report-{timestamp}.json
- Continue to next phase even if one agent reports minor issues
- If critical failures occur, stop and report

Start with Phase 1 and proceed through all phases.`;

  try {
    const { session } = await createAgentSession({
      cwd: PROJECT_ROOT,
      model,
      authStorage,
      modelRegistry,
      tools: createCodingTools(PROJECT_ROOT),
    });

    console.log("🚀 Starting orchestrator pipeline...\n");
    
    await session.prompt(orchestratorPrompt);

    console.log("\n" + "=".repeat(60));
    console.log("✅ FULL PIPELINE COMPLETE");
    console.log("=".repeat(60));
    console.log("Check state/ and reports/ for outputs");
    
  } catch (error) {
    console.error("\n❌ Orchestrator failed:", error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Debugger Agent CLI
==================

Usage:
  npx ts-node src/multi-agent/debugger-cli.ts "Your issue description"
  npx ts-node src/multi-agent/debugger-cli.ts --issue "API returns 500 on /api/ingredients"
  npx ts-node src/multi-agent/debugger-cli.ts --file issue.md
  npx ts-node src/multi-agent/debugger-cli.ts --full "Your issue"  # Run full pipeline

Options:
  --issue, -i    Issue description (inline)
  --file, -f     Issue from file
  --full,        Run full orchestrator pipeline after debug
  --help, -h     Show this help message

The Debugger Agent will:
1. Verify the issue exists
2. Analyze logs and stack traces
3. Categorize the issue (FE/BE/DB/Integration)
4. Route to the appropriate agent via orchestrator with full context
5. Run full pipeline (DB→BE→FE→TESTER→QA) if --full flag is used
`);
    return;
  }

  // Parse arguments
  let issueDescription = "";
  let runFullPipeline = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === "--issue" || arg === "-i") {
      issueDescription = args[++i] || "";
    } else if (arg === "--file" || arg === "-f") {
      const filePath = args[++i];
      if (filePath) {
        issueDescription = await fs.readFile(path.resolve(PROJECT_ROOT, filePath), "utf-8");
      }
    } else if (arg === "--full") {
      runFullPipeline = true;
    } else if (!arg.startsWith("-")) {
      issueDescription = arg;
    }
  }

  if (!issueDescription) {
    console.error("Error: No issue description provided");
    process.exit(1);
  }

  console.log("\n🔍 Starting Debugger Agent");
  console.log("   Issue: " + issueDescription + "\n");

  // Ensure directories exist
  await fs.mkdir(STATE_DIR, { recursive: true });

  try {
    // Initialize Pi SDK
    const authStorage = AuthStorage.create();
    const modelRegistry = ModelRegistry.create(authStorage);
    modelRegistry.refresh();
    
    const model = modelRegistry.find("ollama", "minimax-m2:cloud");
    if (!model) {
      throw new Error("Model ollama/minimax-m2:cloud not found. Run pi login first.");
    }

    // Read debugger memory
    const memory = await readDebuggerMemory();
    const systemPrompt = await getDebuggerSystemPrompt();
    
    // Build context from memory
    let context = "\n\n## Your Memory:\n";
    if (memory?.coreLearnings?.length > 0) {
      context += "### Core Learnings:\n";
      for (const learning of memory.coreLearnings.slice(0, 10)) {
        context += "- " + learning.content + "\n";
      }
    }
    if (memory?.patternsEstablished?.length > 0) {
      context += "\n### Patterns Established:\n";
      for (const pattern of memory.patternsEstablished) {
        context += "- " + pattern + "\n";
      }
    }

    // Create agent session using the correct API
    const { session } = await createAgentSession({
      cwd: PROJECT_ROOT,
      model,
      authStorage,
      modelRegistry,
      tools: createCodingTools(PROJECT_ROOT),
    });

    // Build the prompt with system prompt included
    const prompt = `${systemPrompt}${context}

---

## Current Task

Investigate and verify this issue: "${issueDescription}"

Follow your workflow:
1. Read recent server logs (server_log.txt, app_startup.log)
2. Try to reproduce the issue (curl for API, or describe frontend reproduction steps)
3. Identify the root cause domain (FE/BE/DB/Integration/WebSocket)
4. Gather full context (exact error, stack trace, steps to reproduce)
5. Determine which agent(s) should handle this (FE, BE, or both)
6. Provide a detailed report with your findings

IMPORTANT: End your report with a clear "Category: [FE/BE/DB/Integration]" line so the orchestrator knows which agent to route to.

Remember: Your job is to VERIFY and ROUTE, not to fix!`;

    // Run the debugger task using prompt() and subscribe to get output
    let result = "";
    session.subscribe((event) => {
      if (event.type === "message_update" && event.assistantMessageEvent?.type === "text_delta") {
        result += event.assistantMessageEvent.delta;
      }
    });

    await session.prompt(prompt);

    console.log("\n📋 Debugger Agent Report:");
    console.log("=".repeat(50));
    console.log(result);
    console.log("=".repeat(50));

    // Save debugger output
    const debuggerOutputPath = path.join(STATE_DIR, "debugger-output.json");
    await fs.writeFile(debuggerOutputPath, JSON.stringify({
      taskId: crypto.randomUUID(),
      issue: issueDescription,
      completedAt: new Date().toISOString(),
      report: result,
    }, null, 2));

    // Parse category from result
    const category = parseCategory(result);
    
    if (runFullPipeline) {
      // Run full orchestrator pipeline
      await runFullOrchestrator(issueDescription, result);
    } else if (category) {
      // Route to specific agent based on category
      console.log("\n📌 Detected Category: " + category);
      await invokeOrchestrator(issueDescription, category, result);
    } else {
      console.log("\n⚠️  Could not determine category from debugger output");
      console.log("   Use --full flag to run the full orchestrator pipeline");
    }
    
    console.log("\n✅ Debug investigation complete");
    
  } catch (error) {
    console.error("\n❌ Debugger failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
