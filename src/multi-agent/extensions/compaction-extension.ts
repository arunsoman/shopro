/**
 * Compaction Extension for Pi Multi-Agent System
 * 
 * Customizes the context compaction behavior to preserve critical information
 * like file paths, failure messages, and fix decisions during context summarization.
 * 
 * Hooks used:
 * - session_before_compact: Injects custom compaction instructions
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const COMPACTION_INSTRUCTIONS = `You are compacting the conversation context. Preserve the following information:

1. **ALWAYS PRESERVE:**
   - All file paths created or modified (full paths)
   - All error messages and failure descriptions
   - All fix decisions and their rationale
   - All API contract details (endpoint paths, request/response schemas)
   - All database schema changes (table names, column names, indices)
   - All test names and their purposes
   - All configuration changes

2. **ALWAYS REMOVE:**
   - Repeated tool outputs that are no longer relevant
   - Long thinking traces that don't contain decisions
   - Duplicate explanations of already-established patterns

3. **SUMMARIZATION STYLE:**
   - Keep technical details precise
   - Use bullet points for lists of files/changes
   - Preserve code snippets only if they demonstrate a unique pattern
   - Keep failure context concise but complete

4. **CRITICAL CONTEXT TO NEVER LOSE:**
   - Current task goal and progress
   - What has been tried and what worked/didn't work
   - Remaining work items
   - Any blocker or dependency information`;

export default function compactionExtension(pi: ExtensionAPI) {
  pi.on("session_before_compact", async (ctx) => {
    // Inject custom compaction instructions
    ctx.customInstructions = COMPACTION_INSTRUCTIONS;
    console.log("[Compaction Extension] Custom compaction instructions injected");
  });
}
