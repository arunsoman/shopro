/**
 * Pi Multi-Agent Orchestrator
 *
 * Coordinates 5 specialist agents (FE, BE, DB, Tester, QA) using Pi's SDK.
 * Manages state transitions, retry loops, and inter-agent communication.
 *
 * State Machine:
 * IDLE → DECOMPOSED → DB_PENDING → BE_PENDING → FE_PENDING → TEST_PENDING → QA_PENDING
 *                           ↓           ↓           ↓            ↓            ↓
 *                         DONE       DONE       DONE        DONE        COMPLETED/RETRY
 */
interface TaskState {
    taskId: string;
    taskDescription: string;
    status: TaskStatus;
    attempt: number;
    maxRetries: number;
    createdAt: string;
    updatedAt: string;
    agentOutputs: Record<string, AgentOutput>;
}
type TaskStatus = "IDLE" | "DECOMPOSED" | "DB_PENDING" | "DB_DONE" | "BE_PENDING" | "BE_DONE" | "FE_PENDING" | "FE_DONE" | "TEST_PENDING" | "TEST_DONE" | "QA_PENDING" | "COMPLETED" | "RETRY_FE" | "RETRY_BE" | "FAILED";
interface AgentOutput {
    status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
    outputPath: string | null;
    filesCreated?: string[];
    filesModified?: string[];
    notes?: string;
}
interface QAReport {
    taskId: string;
    attempt: number;
    executedAt: string;
    status: "PASS" | "FAIL";
    summary: {
        totalTests: number;
        passed: number;
        failed: number;
        skipped: number;
        coveragePercent: number;
    };
    failures: QAFailure[];
    fullLogPath: string;
}
interface QAFailure {
    testName: string;
    layer: "frontend" | "backend";
    file: string;
    errorMessage: string;
    stackTrace: string;
    affectedFile: string;
}
interface RetryContext {
    retryAttempt: number;
    maxRetries: number;
    failureSummary: string;
    failures: QAFailure[];
    agentMemorySnapshot: string;
    instruction: string;
}
declare class Orchestrator {
    private authStorage;
    private modelRegistry;
    private taskState;
    private model;
    constructor();
    initialize(): Promise<void>;
    runTask(taskDescription: string, maxRetries?: number): Promise<void>;
    private executePipeline;
    private runAgent;
    private buildRetryPrompt;
    private buildRetryContext;
    private getLatestQAReport;
    private extractFilesFromOutput;
    private getTaskContext;
    private updateStatus;
    private saveTaskState;
    private handleError;
    getTaskState(): Promise<TaskState | null>;
}
export { Orchestrator, TaskState, AgentOutput, QAReport, QAFailure, RetryContext };
export default Orchestrator;
//# sourceMappingURL=orchestrator.d.ts.map