/**
 * QA Agent Wrapper
 *
 * This file provides a clean interface for invoking the QA agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
export interface QAConfig {
    agentId: string;
    name: string;
    allowedPaths: string[];
    forbiddenPaths: string[];
}
export declare const qaConfig: QAConfig;
export declare function getQASystemPrompt(): Promise<string>;
export declare function readQAMemory(): Promise<any>;
export default function qaExtension(pi: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map