/**
 * Backend Developer Agent Wrapper
 *
 * This file provides a clean interface for invoking the BE developer agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
export interface BEDeveloperConfig {
    agentId: string;
    name: string;
    allowedPaths: string[];
    forbiddenPaths: string[];
}
export declare const beDeveloperConfig: BEDeveloperConfig;
export declare function getBEDeveloperSystemPrompt(): Promise<string>;
export declare function readBEDeveloperMemory(): Promise<any>;
export default function beDeveloperExtension(pi: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map