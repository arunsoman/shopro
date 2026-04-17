#!/usr/bin/env npx ts-node
/**
 * Route to Tester Agent
 *
 * Usage:
 *   node src/multi-agent/dist/route-to-tester.js
 *   node src/multi-agent/dist/route-to-tester.js "optional extra instructions"
 *
 * Reads context from state/be-developer-output.json and state/debugger-output.json
 * then runs the Tester agent to write tests for the fix.
 */
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import { AuthStorage, createAgentSession, DefaultResourceLoader, ModelRegistry, createCodingTools, } from "@mariozechner/pi-coding-agent";
const PROJECT_ROOT = process.cwd();
const AGENTS_FILE = path.join(PROJECT_ROOT, "src/multi-agent/agents/tester/AGENTS.md");
const STATE_DIR = path.join(PROJECT_ROOT, "state");
async function readJsonState(filename) {
    try {
        return JSON.parse(await fs.readFile(path.join(STATE_DIR, filename), "utf-8"));
    }
    catch {
        return null;
    }
}
async function main() {
    const extraInstructions = process.argv.slice(2).join(" ");
    console.log("\n🧪  Routing to Tester Agent");
    try {
        await fs.mkdir(STATE_DIR, { recursive: true });
        // Initialize Pi SDK
        const authStorage = AuthStorage.create();
        const modelRegistry = ModelRegistry.create(authStorage);
        modelRegistry.refresh();
        const model = modelRegistry.find("openrouter", "google/gemma-4-31b-it:free") ??
            modelRegistry.getAvailable()[0];
        if (!model) {
            throw new Error("No model available. Check ~/.pi/agent/models.json.");
        }
        // Load Tester agents file
        const agentsContent = await fs.readFile(AGENTS_FILE, "utf-8");
        const loader = new DefaultResourceLoader({
            cwd: PROJECT_ROOT,
            agentsFilesOverride: () => ({
                agentsFiles: [{ path: AGENTS_FILE, content: agentsContent }],
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
        // Load context from previous agents
        const beOutput = await readJsonState("be-developer-output.json");
        const debuggerOutput = await readJsonState("debugger-output.json");
        // Build context section from BE developer output
        let beContext = "";
        if (beOutput) {
            const r = beOutput.report ?? {};
            const files = beOutput.filesChanged
                ?.map((f) => `- ${f.file}${f.change ? `: ${f.change}` : ""}`)
                .join("\n") ?? "";
            beContext = `
## Fix Applied by BE Developer

**Issue**: ${beOutput.issue ?? ""}

**Root Cause**: ${r.rootCause ?? ""}
**Affected Methods**: ${r.affectedMethods?.join(", ") ?? ""}

**Files Changed**:
${files}

**Fix Summary**: ${r.fix ?? beOutput.output ?? ""}`;
        }
        // Build context section from debugger output
        let debuggerContext = "";
        if (debuggerOutput?.report) {
            const r = debuggerOutput.report;
            debuggerContext = `
## Original Debugger Diagnosis

**Root Cause**: ${r.rootCause}
**Affected Files**: ${r.affectedFiles?.join(", ")}
**Affected Methods**: ${r.affectedMethods?.join(", ")}
**Evidence**:
${r.evidence?.map((e) => `- ${e}`).join("\n")}`;
        }
        const prompt = `# Task: Write Tests for the Recent BE Fix
${beContext}
${debuggerContext}
${extraInstructions ? `\n## Additional Instructions\n${extraInstructions}` : ""}

---

## Your Task

1. Read the changed files listed above to understand what was fixed
2. Write targeted tests that verify:
   - The fix works (happy path with data present)
   - The previous bug is gone (edge case: no data → correct HTTP status / empty result)
3. Place test files in the correct location:
   - **Test root**: \`shopro-res/src/test/java/mls/sho/dms/\`
   - Match the package of the class under test
4. Use the \`write\` tool with the full absolute path — it creates parent dirs automatically
5. Write summary to \`state/tester-output.json\` when done

Follow the Tester guidelines in AGENTS.md.`;
        console.log("   Context loaded from: be-developer-output.json" + (debuggerOutput ? ", debugger-output.json" : ""));
        console.log("\n");
        let _result = "";
        session.subscribe((event) => {
            if (event.type === "message_update" && event.assistantMessageEvent?.type === "text_delta") {
                _result += event.assistantMessageEvent.delta;
                process.stdout.write(event.assistantMessageEvent.delta);
            }
        });
        await session.prompt(prompt);
        const outputPath = path.join(STATE_DIR, "tester-output.json");
        await fs.writeFile(outputPath, JSON.stringify({
            taskId: crypto.randomUUID(),
            completedAt: new Date().toISOString(),
            summary: "Tester agent executed — see output above for details",
        }, null, 2));
        console.log("\n\n✅ Tester task complete");
        console.log("   Output saved to: " + outputPath);
    }
    catch (error) {
        console.error("\n❌ Route to Tester failed:", error);
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=route-to-tester.js.map