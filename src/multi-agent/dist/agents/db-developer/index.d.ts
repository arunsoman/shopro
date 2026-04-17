/**
 * Database Developer Agent Wrapper
 *
 * This file provides a clean interface for invoking the DB developer agent
 * through the orchestrator. It defines the agent configuration and prompts.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
export interface DBDeveloperConfig {
    agentId: string;
    name: string;
    allowedPaths: string[];
    forbiddenPaths: string[];
}
export declare const dbDeveloperConfig: DBDeveloperConfig;
export declare function getDBDeveloperSystemPrompt(): Promise<string>;
export declare function readDBDeveloperMemory(): Promise<any>;
export default function dbDeveloperExtension(pi: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map