/**
 * Multi-Agent System - Agent Index
 *
 * Exports all agent configurations and utilities.
 */
export { dbDeveloperConfig, getDBDeveloperSystemPrompt, readDBDeveloperMemory } from "./db-developer/index.js";
export { beDeveloperConfig, getBEDeveloperSystemPrompt, readBEDeveloperMemory } from "./be-developer/index.js";
export { feDeveloperConfig, getFEDeveloperSystemPrompt, readFEDeveloperMemory } from "./fe-developer/index.js";
export { testerConfig, getTesterSystemPrompt, readTesterMemory } from "./tester/index.js";
export { qaConfig, getQASystemPrompt, readQAMemory } from "./qa/index.js";
export { debuggerConfig, getDebuggerSystemPrompt, readDebuggerMemory } from "./debugger/index.js";
export interface AgentConfig {
    agentId: string;
    name: string;
    allowedPaths: string[];
    forbiddenPaths: string[];
}
export declare const AGENTS: {
    readonly "db-developer": {
        readonly agentId: "db-developer";
        readonly name: "Database Developer";
        readonly allowedPaths: readonly ["src/db/", "src/backend/entities/"];
        readonly forbiddenPaths: readonly ["src/frontend/", "src/backend/controller/", "src/test/"];
    };
    readonly "be-developer": {
        readonly agentId: "be-developer";
        readonly name: "Backend Developer";
        readonly allowedPaths: readonly ["src/backend/"];
        readonly forbiddenPaths: readonly ["src/frontend/", "src/db/", "src/test/"];
    };
    readonly "fe-developer": {
        readonly agentId: "fe-developer";
        readonly name: "Frontend Developer";
        readonly allowedPaths: readonly ["src/frontend/"];
        readonly forbiddenPaths: readonly ["src/backend/", "src/db/", "src/test/"];
    };
    readonly tester: {
        readonly agentId: "tester";
        readonly name: "Tester";
        readonly allowedPaths: readonly ["src/test/"];
        readonly forbiddenPaths: readonly ["src/frontend/", "src/backend/", "src/db/"];
    };
    readonly qa: {
        readonly agentId: "qa";
        readonly name: "QA Agent";
        readonly allowedPaths: readonly ["reports/"];
        readonly forbiddenPaths: readonly ["src/"];
    };
};
//# sourceMappingURL=index.d.ts.map