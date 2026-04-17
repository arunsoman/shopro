/**
 * Frontend Developer Agent Wrapper
 *
 * This file provides a clean interface for invoking the FE developer agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
export interface FEDeveloperConfig {
    agentId: string;
    name: string;
    allowedPaths: string[];
    forbiddenPaths: string[];
}
export declare const feDeveloperConfig: FEDeveloperConfig;
export declare function getFEDeveloperSystemPrompt(): Promise<string>;
export declare function readFEDeveloperMemory(): Promise<any>;
export default function feDeveloperExtension(pi: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map