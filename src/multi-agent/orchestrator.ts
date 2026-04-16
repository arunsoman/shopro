/**
 * Pi Multi-Agent Orchestrator
 * 
 * Coordinates 5 specialist agents (FE, BE, DB, Tester, QA) using Pi's SDK.
 * Manages state transitions, retry loops, and inter-agent communication.
 * 
 * State Machine:
 * IDLE → DECOMPOSED → DB_PENDING → BE_PENDING → FE_PENDING → TEST_PENDING → QA_PENDING
 *                           ↓           ↓           ↓            ↓            ↓
 *                         DONE       DONE       DONE        DONE        COMPLETED/RETRY
 */

import {
  AuthStorage,
  createAgentSession,
  DefaultResourceLoader,
  ModelRegistry,
  SessionManager,
  createCodingTools,
} from "@mariozechner/pi-coding-agent";
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

// Types
interface TaskState {
  taskId: string;
  taskDescription: string;
  status: TaskStatus;
  attempt: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  agentOutputs: Record<string, AgentOutput>;
}

type TaskStatus = 
  | "IDLE" 
  | "DECOMPOSED" 
  | "DB_PENDING" 
  | "DB_DONE" 
  | "BE_PENDING" 
  | "BE_DONE" 
  | "FE_PENDING" 
  | "FE_DONE" 
  | "TEST_PENDING" 
  | "TEST_DONE" 
  | "QA_PENDING" 
  | "COMPLETED" 
  | "RETRY_FE" 
  | "RETRY_BE" 
  | "FAILED";

interface AgentOutput {
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  outputPath: string | null;
  filesCreated?: string[];
  filesModified?: string[];
  notes?: string;
}

interface QAReport {
  taskId: string;
  attempt: number;
  executedAt: string;
  status: "PASS" | "FAIL";
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    coveragePercent: number;
  };
  failures: QAFailure[];
  fullLogPath: string;
}

interface QAFailure {
  testName: string;
  layer: "frontend" | "backend";
  file: string;
  errorMessage: string;
  stackTrace: string;
  affectedFile: string;
}

interface RetryContext {
  retryAttempt: number;
  maxRetries: number;
  failureSummary: string;
  failures: QAFailure[];
  agentMemorySnapshot: string;
  instruction: string;
}

// Constants
const PROJECT_ROOT = process.cwd();
const STATE_DIR = path.join(PROJECT_ROOT, "state");
const REPORTS_DIR = path.join(PROJECT_ROOT, "reports");
const AGENTS_DIR = path.join(PROJECT_ROOT, "src/multi-agent/agents");
const MEMORY_DIR = path.join(PROJECT_ROOT, "src/multi-agent/memory");
const SESSIONS_DIR = path.join(PROJECT_ROOT, ".pi/sessions");
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_PROVIDER = "openrouter";
const DEFAULT_MODEL = "google/gemma-4-31b-it:free";

// Agent configurations
const AGENT_CONFIGS = {
  "debugger": {
    name: "Debugger Agent",
    agentsFile: path.join(AGENTS_DIR, "debugger/AGENTS.md"),
    allowedPaths: [
      "shopro-res/logs/",
      "shopro-res/simlogs/",
      "*.log",
      "shopro-res-web/test-results/",
    ],
    forbiddenPaths: [],
  },
  "db-developer": {
    name: "Database Developer",
    agentsFile: path.join(AGENTS_DIR, "db-developer/AGENTS.md"),
    allowedPaths: ["src/db/", "src/backend/entities/"],
    forbiddenPaths: ["src/frontend/", "src/backend/controller/", "src/test/"],
  },
  "be-developer": {
    name: "Backend Developer",
    agentsFile: path.join(AGENTS_DIR, "be-developer/AGENTS.md"),
    allowedPaths: ["src/backend/"],
    forbiddenPaths: ["src/frontend/", "src/db/", "src/test/"],
  },
  "fe-developer": {
    name: "Frontend Developer",
    agentsFile: path.join(AGENTS_DIR, "fe-developer/AGENTS.md"),
    allowedPaths: ["src/frontend/"],
    forbiddenPaths: ["src/backend/", "src/db/", "src/test/"],
  },
  "tester": {
    name: "Tester",
    agentsFile: path.join(AGENTS_DIR, "tester/AGENTS.md"),
    allowedPaths: ["src/test/"],
    forbiddenPaths: ["src/frontend/", "src/backend/", "src/db/"],
  },
  "qa": {
    name: "QA Agent",
    agentsFile: path.join(AGENTS_DIR, "qa/AGENTS.md"),
    allowedPaths: ["reports/"],
    forbiddenPaths: ["src/"],
  },
};

class Orchestrator {
  private authStorage: AuthStorage;
  private modelRegistry: ModelRegistry;
  private taskState: TaskState | null = null;
  private model: any;

  constructor() {
    this.authStorage = AuthStorage.create();
    this.modelRegistry = ModelRegistry.create(this.authStorage);
  }

  async initialize(): Promise<void> {
    // Ensure directories exist
    await fs.mkdir(STATE_DIR, { recursive: true });
    await fs.mkdir(REPORTS_DIR, { recursive: true });
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
    await fs.mkdir(MEMORY_DIR, { recursive: true });

    // Get the model from Pi's registry (reads ~/.pi/agent/models.json)
    this.modelRegistry.refresh();
    this.model = this.modelRegistry.find(DEFAULT_PROVIDER, DEFAULT_MODEL);
    if (!this.model) {
      throw new Error(`Model ${DEFAULT_PROVIDER}/${DEFAULT_MODEL} not found in Pi model registry`);
    }

    console.log("[Orchestrator] Initialized successfully");
  }

  async runTask(taskDescription: string, maxRetries: number = DEFAULT_MAX_RETRIES): Promise<void> {
    const taskId = crypto.randomUUID();
    console.log(`[Orchestrator] Starting task ${taskId}: ${taskDescription}`);

    // Initialize task state
    this.taskState = {
      taskId,
      taskDescription,
      status: "DECOMPOSED",
      attempt: 1,
      maxRetries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agentOutputs: {
        "debugger": { status: "PENDING", outputPath: null },
        "db-developer": { status: "PENDING", outputPath: null },
        "be-developer": { status: "PENDING", outputPath: null },
        "fe-developer": { status: "PENDING", outputPath: null },
        "tester": { status: "PENDING", outputPath: null },
        "qa": { status: "PENDING", outputPath: null },
      },
    };

    await this.saveTaskState();

    // Execute the pipeline
    await this.executePipeline();
  }

  private async executePipeline(): Promise<void> {
    if (!this.taskState) return;

    let currentAttempt = 1;
    const maxAttempts = this.taskState.maxRetries;

    while (currentAttempt <= maxAttempts) {
      console.log(`[Orchestrator] Attempt ${currentAttempt}/${maxAttempts}`);

      try {
        // Phase 1: DB Developer
        await this.updateStatus("DB_PENDING");
        await this.runAgent("db-developer", {
          task: this.getTaskContext(),
          taskDescription: this.taskState.taskDescription,
        });
        await this.updateStatus("DB_DONE");

        // Phase 2: BE Developer
        await this.updateStatus("BE_PENDING");
        await this.runAgent("be-developer", {
          task: this.getTaskContext(),
          taskDescription: this.taskState.taskDescription,
        });
        await this.updateStatus("BE_DONE");

        // Phase 3: FE Developer
        await this.updateStatus("FE_PENDING");
        await this.runAgent("fe-developer", {
          task: this.getTaskContext(),
          taskDescription: this.taskState.taskDescription,
        });
        await this.updateStatus("FE_DONE");

        // Phase 4: Tester
        await this.updateStatus("TEST_PENDING");
        await this.runAgent("tester", {
          task: this.getTaskContext(),
          taskDescription: this.taskState.taskDescription,
        });
        await this.updateStatus("TEST_DONE");

        // Phase 5: QA
        await this.updateStatus("QA_PENDING");
        await this.runAgent("qa", {
          task: this.getTaskContext(),
          taskDescription: this.taskState.taskDescription,
        });
        await this.updateStatus("QA_PENDING"); // Keep in QA_PENDING to check result

        // Check QA result
        const latestReport = await this.getLatestQAReport();
        if (latestReport && latestReport.status === "PASS") {
          await this.updateStatus("COMPLETED");
          console.log("[Orchestrator] Task completed successfully!");
          return;
        }

        // QA failed - need to retry
        console.log("[Orchestrator] QA failed, analyzing failures for retry...");
        
        if (latestReport) {
          const retryContext = await this.buildRetryContext(latestReport);
          
          // Determine which agents need to retry
          const backendFailures = latestReport.failures.filter(f => f.layer === "backend");
          const frontendFailures = latestReport.failures.filter(f => f.layer === "frontend");

          if (backendFailures.length > 0) {
            await this.updateStatus("RETRY_BE");
            await this.runAgent("be-developer", {
              task: retryContext.instruction,
              retryContext,
              taskDescription: this.taskState.taskDescription,
            });
          }

          if (frontendFailures.length > 0) {
            await this.updateStatus("RETRY_FE");
            await this.runAgent("fe-developer", {
              task: retryContext.instruction,
              retryContext,
              taskDescription: this.taskState.taskDescription,
            });
          }

          // Re-run tests after fixes
          await this.updateStatus("TEST_PENDING");
          await this.runAgent("tester", {
            task: "Re-run tests for the fixed code",
            taskDescription: this.taskState.taskDescription,
          });
          await this.updateStatus("TEST_DONE");

          // Re-run QA
          await this.updateStatus("QA_PENDING");
          await this.runAgent("qa", {
            task: "Execute tests again to verify fixes",
            taskDescription: this.taskState.taskDescription,
          });

          const finalReport = await this.getLatestQAReport();
          if (finalReport && finalReport.status === "PASS") {
            await this.updateStatus("COMPLETED");
            console.log("[Orchestrator] Task completed after retry!");
            return;
          }
        }

        // Increment attempt counter
        currentAttempt++;
        this.taskState.attempt = currentAttempt;
        this.taskState.updatedAt = new Date().toISOString();
        await this.saveTaskState();

      } catch (error) {
        console.error("[Orchestrator] Error in pipeline:", error);
        await this.handleError(error);
      }
    }

    // Max retries exceeded
    await this.updateStatus("FAILED");
    console.log("[Orchestrator] Task failed after max retries");
  }

  private async runAgent(agentId: string, context: {
    task: string;
    taskDescription?: string;
    retryContext?: RetryContext;
  }): Promise<AgentOutput> {
    if (!this.taskState) throw new Error("No task state");

    const config = AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS];
    if (!config) {
      throw new Error(`Unknown agent: ${agentId}`);
    }

    console.log(`[Orchestrator] Running agent: ${agentId}`);

    // Update agent status to running
    this.taskState.agentOutputs[agentId] = {
      status: "RUNNING",
      outputPath: null,
    };
    await this.saveTaskState();

    try {
      // Create session for this agent
      const sessionPath = path.join(SESSIONS_DIR, `${agentId}.jsonl`);
      
      // Load agents file
      let agentsContent = "";
      try {
        agentsContent = await fs.readFile(config.agentsFile, "utf-8");
      } catch (e) {
        console.warn(`[Orchestrator] No AGENTS.md found for ${agentId}`);
      }

      // Create resource loader with agents file
      const loader = new DefaultResourceLoader({
        cwd: PROJECT_ROOT,
        agentsFilesOverride: () => ({
          agentsFiles: [{ path: config.agentsFile, content: agentsContent }],
        }),
        additionalExtensionPaths: [
          path.join(PROJECT_ROOT, "src/multi-agent/extensions/memory-extension.ts"),
          path.join(PROJECT_ROOT, "src/multi-agent/extensions/compaction-extension.ts"),
        ],
      });
      await loader.reload();

      const { session } = await createAgentSession({
        cwd: PROJECT_ROOT,
        model: this.model,
        thinkingLevel: "medium",
        authStorage: this.authStorage,
        modelRegistry: this.modelRegistry,
        tools: createCodingTools(PROJECT_ROOT),
        resourceLoader: loader,
        sessionManager: SessionManager.open(sessionPath),
      });

      // Build the prompt
      let prompt = context.task;
      
      if (context.taskDescription) {
        prompt = `# Task\n\n${context.taskDescription}\n\n# Your Task\n\n${context.task}`;
      }

      if (context.retryContext) {
        prompt = this.buildRetryPrompt(context.retryContext);
      }

      // Execute the agent
      let result = "";
      session.subscribe((event) => {
        if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
          result += event.assistantMessageEvent.delta;
        }
      });

      await session.prompt(prompt);

      // Parse output and save
      const outputPath = path.join(STATE_DIR, `${agentId}-output.json`);
      const agentOutput: AgentOutput = {
        status: "DONE",
        outputPath,
        filesCreated: await this.extractFilesFromOutput(result, "created"),
        filesModified: await this.extractFilesFromOutput(result, "modified"),
        notes: `Completed on ${new Date().toISOString()}`,
      };

      await fs.writeFile(outputPath, JSON.stringify({
        agentId,
        taskId: this.taskState.taskId,
        attempt: this.taskState.attempt,
        ...agentOutput,
        completedAt: new Date().toISOString(),
      }, null, 2));

      // Update task state
      this.taskState.agentOutputs[agentId] = agentOutput;
      await this.saveTaskState();

      console.log(`[Orchestrator] Agent ${agentId} completed`);
      return agentOutput;

    } catch (error) {
      console.error(`[Orchestrator] Agent ${agentId} failed:`, error);
      
      const outputPath = path.join(STATE_DIR, `${agentId}-output.json`);
      const agentOutput: AgentOutput = {
        status: "FAILED",
        outputPath,
        notes: `Failed: ${error}`,
      };

      await fs.writeFile(outputPath, JSON.stringify({
        agentId,
        taskId: this.taskState.taskId,
        attempt: this.taskState.attempt,
        ...agentOutput,
        failedAt: new Date().toISOString(),
      }, null, 2));

      this.taskState.agentOutputs[agentId] = agentOutput;
      await this.saveTaskState();

      throw error;
    }
  }

  private buildRetryPrompt(retryContext: RetryContext): string {
    return `# Retry Context (Attempt ${retryContext.retryAttempt}/${retryContext.maxRetries})

## Failure Summary
${retryContext.failureSummary}

## Failed Tests
${retryContext.failures.map((f, i) => `
### ${i + 1}. ${f.testName}
- **Layer:** ${f.layer}
- **File:** ${f.file}
- **Error:** ${f.errorMessage}
- **Affected Source:** ${f.affectedFile}
- **Stack Trace:**
\`\`\`
${f.stackTrace}
\`\`\`
`).join("\n")}

## Your Task
${retryContext.instruction}

## Important
- Fix ONLY the failures listed above
- Do NOT change unrelated code
- After fixing, ensure the code compiles and tests pass
- Write summary to state/${retryContext.failures[0]?.layer === "backend" ? "be" : "fe"}-developer-output.json
`;
  }

  private async buildRetryContext(qaReport: QAReport): Promise<RetryContext> {
    const failureSummary = `${qaReport.summary.failed} tests failed out of ${qaReport.summary.totalTests}`;
    
    // Get memory snapshots for relevant agents
    let beMemory = "";
    let feMemory = "";
    
    try {
      beMemory = await fs.readFile(path.join(MEMORY_DIR, "be-developer-memory.json"), "utf-8");
    } catch {}
    
    try {
      feMemory = await fs.readFile(path.join(MEMORY_DIR, "fe-developer-memory.json"), "utf-8");
    } catch {}

    const instruction = `Fix the following test failures. Analyze the error messages and stack traces, identify the root cause in the affected source files, and implement fixes. Do not modify unrelated code.`;

    return {
      retryAttempt: this.taskState?.attempt || 1,
      maxRetries: this.taskState?.maxRetries || DEFAULT_MAX_RETRIES,
      failureSummary,
      failures: qaReport.failures,
      agentMemorySnapshot: `BE: ${beMemory}\nFE: ${feMemory}`,
      instruction,
    };
  }

  private async getLatestQAReport(): Promise<QAReport | null> {
    try {
      const files = await fs.readdir(REPORTS_DIR);
      const qaFiles = files
        .filter(f => f.startsWith("qa-report-") && f.endsWith(".json"))
        .sort()
        .reverse();
      
      if (qaFiles.length === 0) return null;
      
      const content = await fs.readFile(path.join(REPORTS_DIR, qaFiles[0]), "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private async extractFilesFromOutput(output: string, type: "created" | "modified"): Promise<string[]> {
    const regex = new RegExp(`${type}:?\\s*\\n?\\s*([\\s\\S]*?)(?=\\n\\n|\\n$|$)`, "gi");
    const matches = output.match(regex);
    if (!matches) return [];
    
    // Extract file paths from markdown-style lists
    const files: string[] = [];
    for (const match of matches) {
      const fileMatches = match.match(/[-*]\s+`?([^`\n]+)`?/g);
      if (fileMatches) {
        for (const fm of fileMatches) {
          const filePath = fm.replace(/^[-*]\s+`?/, "").replace(/`?$/, "").trim();
          if (filePath && (filePath.startsWith("src/") || filePath.startsWith("."))) {
            files.push(filePath);
          }
        }
      }
    }
    return [...new Set(files)];
  }

  private getTaskContext(): string {
    if (!this.taskState) return "";
    
    // Return the task plan context
    return `# Current Task\n\n${this.taskState.taskDescription}\n\nExecute this task according to your AGENTS.md guidelines.`;
  }

  private async updateStatus(status: TaskStatus): Promise<void> {
    if (!this.taskState) return;
    this.taskState.status = status;
    this.taskState.updatedAt = new Date().toISOString();
    await this.saveTaskState();
    console.log(`[Orchestrator] Status: ${status}`);
  }

  private async saveTaskState(): Promise<void> {
    if (!this.taskState) return;
    await fs.writeFile(
      path.join(STATE_DIR, "task-state.json"),
      JSON.stringify(this.taskState, null, 2)
    );
  }

  private async handleError(error: unknown): Promise<void> {
    console.error("[Orchestrator] Handling error:", error);
    if (this.taskState) {
      this.taskState.status = "FAILED";
      this.taskState.updatedAt = new Date().toISOString();
      await this.saveTaskState();
    }
  }

  async getTaskState(): Promise<TaskState | null> {
    return this.taskState;
  }
}

// Export for use
export { Orchestrator, TaskState, AgentOutput, QAReport, QAFailure, RetryContext };
export default Orchestrator;
