#!/usr/bin/env npx ts-node
/**
 * Route to BE Developer
 * 
 * Usage:
 *   npx ts-node src/multi-agent/route-to-be.ts "Fix the low-stock API to return shortfallAmount"
 */

import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import {
  AuthStorage,
  createAgentSession,
  DefaultResourceLoader,
  ModelRegistry,
  createCodingTools,
} from "@mariozechner/pi-coding-agent";

const PROJECT_ROOT = process.cwd();
const AGENTS_FILE = path.join(PROJECT_ROOT, "src/multi-agent/agents/be-developer/AGENTS.md");
const STATE_DIR = path.join(PROJECT_ROOT, "state");

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Route to BE Developer
=====================

Usage:
  npx ts-node src/multi-agent/route-to-be.ts "Your task description"

This will:
1. Load the BE Developer agent configuration
2. Execute the task with full context
3. Write output to state/be-developer-output.json
`);
    return;
  }

  const taskDescription = args.join(" ");

  console.log("\n⚙️  Routing to Backend Developer");
  console.log("   Task: " + taskDescription + "\n");

  try {
    // Ensure state directory exists
    await fs.mkdir(STATE_DIR, { recursive: true });

    // Initialize Pi SDK
    const authStorage = AuthStorage.create();
    const modelRegistry = ModelRegistry.create(authStorage);
    modelRegistry.refresh();
    
    const model = modelRegistry.find("openrouter", "google/gemma-4-31b-it:free")
               ?? modelRegistry.getAvailable()[0];
    if (!model) {
      throw new Error("No model available. Check ~/.pi/agent/models.json.");
    }

    // Load BE Developer agents file
    const agentsContent = await fs.readFile(AGENTS_FILE, "utf-8");

    // Create resource loader
    const loader = new DefaultResourceLoader({
      cwd: PROJECT_ROOT,
      agentsFilesOverride: () => ({
        agentsFiles: [{ path: AGENTS_FILE, content: agentsContent }],
      }),
    });
    await loader.reload();

    // Create session
    const { session } = await createAgentSession({
      cwd: PROJECT_ROOT,
      model,
      authStorage,
      modelRegistry,
      tools: createCodingTools(PROJECT_ROOT),
      resourceLoader: loader,
    });

    // Build the prompt with full context from debugger
    const prompt = 
`# Task

${taskDescription}

---

## Issue Context (from Debugger Agent)

**Issue**: "Reorder Staging -> Shortfall the value is coming as -NaN BOTTLE"

**Root Cause**: Backend API contract mismatch
- The backend endpoint /restaurants/{id}/ingredients/low-stock returns List<Ingredient> 
- The frontend expects LowStockAlertDto with shortfallAmount field
- When frontend accesses alert.shortfallAmount, it gets undefined
- Math.abs(undefined) -> NaN

**Fix Required**: Modify the backend getLowStock endpoint to return data with shortfallAmount calculated (as parLevel - currentCount).

---

## Your Task

1. **Analyze**: Find the IngredientController.java and IngredientService.java files
2. **Fix**: Modify the getLowStock endpoint to return proper data with shortfallAmount
3. **Options**:
   - Option A: Return a new DTO (e.g., LowStockAlertDto) with shortfallAmount field
   - Option B: Add a computed field to Ingredient and use a projection
4. **Verify**: Ensure the API will return the shortfallAmount field

**Important Constraints**:
- Use Jakarta Persistence (jakarta.persistence.*), NOT javax.persistence
- Use DTOs for response, don't expose entities directly
- Write summary to state/be-developer-output.json when done

Follow the BE Developer guidelines in AGENTS.md.`;

    // Run the task and collect output
    let result = "";
    session.subscribe((event) => {
      if (event.type === "message_update" && event.assistantMessageEvent?.type === "text_delta") {
        result += event.assistantMessageEvent.delta;
        // Also print incremental updates
        process.stdout.write(event.assistantMessageEvent.delta);
      }
    });

    console.log("\n");
    await session.prompt(prompt);

    // Save output to state file
    const outputPath = path.join(STATE_DIR, "be-developer-output.json");
    await fs.writeFile(outputPath, JSON.stringify({
      taskId: crypto.randomUUID(),
      task: taskDescription,
      completedAt: new Date().toISOString(),
      summary: "BE Developer fix executed - see output above for details",
    }, null, 2));

    console.log("\n\n✅ BE Developer task complete");
    console.log("   Output saved to: " + outputPath);
    
  } catch (error) {
    console.error("\n❌ Route to BE failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
