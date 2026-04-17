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
export interface DebuggerConfig {
    agentId: string;
    name: string;
    allowedPaths: string[];
    forbiddenPaths: string[];
}
export declare const debuggerConfig: DebuggerConfig;
export declare function getDebuggerSystemPrompt(): Promise<string>;
export declare function readDebuggerMemory(): Promise<any>;
export default function debuggerExtension(pi: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map