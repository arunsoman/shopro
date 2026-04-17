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
export default function compactionExtension(pi: ExtensionAPI): void;
//# sourceMappingURL=compaction-extension.d.ts.map