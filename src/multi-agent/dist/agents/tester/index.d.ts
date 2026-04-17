/**
 * Tester Agent Wrapper
 *
 * This file provides a clean interface for invoking the Tester agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
export interface TesterConfig {
    agentId: string;
    name: string;
    allowedPaths: string[];
    forbiddenPaths: string[];
}
export declare const testerConfig: TesterConfig;
export declare function getTesterSystemPrompt(): Promise<string>;
export declare function readTesterMemory(): Promise<any>;
export default function testerExtension(pi: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map