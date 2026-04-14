#!/usr/bin/env npx ts-node
/**
 * Pi Multi-Agent CLI Entry Point
 * 
 * Usage:
 *   npx ts-node src/multi-agent/cli.ts "Build user authentication module"
 *   npx ts-node src/multi-agent/cli.ts --task "Build user authentication module"
 *   npx ts-node src/multi-agent/cli.ts --file task.md
 */

import * as fs from "fs/promises";
import * as path from "path";
import { Orchestrator } from "./orchestrator.js";

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Pi Multi-Agent Engineering System
===================================

Usage:
  npx ts-node src/multi-agent/cli.ts "Your task description"
  npx ts-node src/multi-agent/cli.ts --task "Your task description"
  npx ts-node src/multi-agent/cli.ts --file task.md
  npx ts-node src/multi-agent/cli.ts --status

Options:
  --task, -t     Task description (inline)
  --file, -f     Read task from file
  --status       Show current task status
  --help, -h     Show this help message
`);
    return;
  }

  // Handle --status flag
  if (args[0] === "--status" || args[0] === "-s") {
    try {
      const state = await fs.readFile(
        path.join(process.cwd(), "state/task-state.json"),
        "utf-8"
      );
      console.log(JSON.stringify(JSON.parse(state), null, 2));
    } catch {
      console.log("No task state found. Run a task first.");
    }
    return;
  }

  // Parse arguments
  let taskDescription = "";
  let maxRetries = 3;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === "--task" || arg === "-t") {
      taskDescription = args[++i] || "";
    } else if (arg === "--file" || arg === "-f") {
      const filePath = args[++i];
      if (filePath) {
        taskDescription = await fs.readFile(filePath, "utf-8");
      }
    } else if (arg === "--retries" || arg === "-r") {
      maxRetries = parseInt(args[++i]) || 3;
    } else if (!arg.startsWith("-")) {
      // Assume it's the task description
      taskDescription = arg;
    }
  }

  if (!taskDescription) {
    console.error("Error: No task description provided");
    process.exit(1);
  }

  console.log(`\n🚀 Starting Multi-Agent Pipeline`);
  console.log(`   Task: ${taskDescription}`);
  console.log(`   Max Retries: ${maxRetries}\n`);

  const orchestrator = new Orchestrator();
  
  try {
    await orchestrator.initialize();
    await orchestrator.runTask(taskDescription, maxRetries);
    
    const finalState = await orchestrator.getTaskState();
    console.log(`\n✅ Pipeline Complete`);
    console.log(`   Final Status: ${finalState?.status}`);
    
    if (finalState?.status === "COMPLETED") {
      process.exit(0);
    } else if (finalState?.status === "FAILED") {
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Pipeline Failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
