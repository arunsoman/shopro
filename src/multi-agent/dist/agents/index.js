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
export const AGENTS = {
    "db-developer": {
        agentId: "db-developer",
        name: "Database Developer",
        allowedPaths: ["src/db/", "src/backend/entities/"],
        forbiddenPaths: ["src/frontend/", "src/backend/controller/", "src/test/"],
    },
    "be-developer": {
        agentId: "be-developer",
        name: "Backend Developer",
        allowedPaths: ["src/backend/"],
        forbiddenPaths: ["src/frontend/", "src/db/", "src/test/"],
    },
    "fe-developer": {
        agentId: "fe-developer",
        name: "Frontend Developer",
        allowedPaths: ["src/frontend/"],
        forbiddenPaths: ["src/backend/", "src/db/", "src/test/"],
    },
    "tester": {
        agentId: "tester",
        name: "Tester",
        allowedPaths: ["src/test/"],
        forbiddenPaths: ["src/frontend/", "src/backend/", "src/db/"],
    },
    "qa": {
        agentId: "qa",
        name: "QA Agent",
        allowedPaths: ["reports/"],
        forbiddenPaths: ["src/"],
    },
};
//# sourceMappingURL=index.js.map