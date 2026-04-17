/**
 * CodeBriefBuilder — pre-flight code analysis engine (zero LLM tokens)
 *
 * Runs entirely in Node.js before any LLM session is created, producing a compact
 * "code brief" that the LLM receives directly in its prompt — eliminating the need
 * for the LLM to call grep/read tools and re-pay tool-definition overhead each turn.
 *
 * Implements:
 *   Approach 1 — Grep Oracle:            parallel grep across all source directories
 *   Approach 2 — Method Extraction:      pull specific methods, not whole files
 *   Approach 3 — Hypothesis Generation:  static pattern detection on matched lines
 *   Approach 5 — Pattern Verification:   confirm a stored pattern still applies
 */
export interface CodeSnippet {
    file: string;
    line: number;
    keyword: string;
    context: string;
}
export interface MethodSnippet {
    file: string;
    methodName: string;
    startLine: number;
    code: string;
    tokenEstimate: number;
}
export interface Hypothesis {
    id: string;
    pattern: string;
    description: string;
    snippet: CodeSnippet;
    confidence: "high" | "medium" | "low";
}
export interface CodeBrief {
    keywords: string[];
    snippets: CodeSnippet[];
    hypotheses: Hypothesis[];
    buildTimeMs: number;
    tokenEstimate: number;
}
export interface PatternVerification {
    applies: boolean;
    snippets: CodeSnippet[];
}
export declare class CodeBriefBuilder {
    private projectRoot;
    private sourceRoots;
    constructor(projectRoot: string);
    /**
     * Build a compact code brief for the given issue.
     * If the issue string contains Java stack trace references (FileName.java:NN),
     * those files are read at the exact line number first — before any keyword grep.
     * Runs all greps in parallel; total wall-clock time is dominated by the slowest grep.
     */
    build(issue: string): Promise<CodeBrief>;
    /**
     * Extract a single method/function from a file using brace-counting.
     * Works for Java, TypeScript, and JavaScript.
     * Returns null if the method is not found.
     */
    extractMethod(filePath: string, methodName: string): Promise<MethodSnippet | null>;
    /**
     * Run a stored pattern's codeSearchStrategy grep commands and return
     * whether the pattern's characteristic code is still present.
     * Used by the fast-track skip (Approach 5).
     */
    verifyPattern(searchStrategy: string[]): Promise<PatternVerification>;
    /** Format the code brief as a compact prompt section (Approach 1 output) */
    formatBriefForPrompt(brief: CodeBrief): string;
    /** Format a single method snippet for injection into a remediation prompt */
    formatMethodForPrompt(snippet: MethodSnippet): string;
    /**
     * Run a single keyword grep across one directory.
     * Returns at most MAX_PER_KW snippets.
     */
    private grepKeyword;
    /** Search all source roots for a file by base name, return first match */
    private findFileInSourceRoots;
    /** Read lines [lineNum - CONTEXT_LINES, lineNum + CONTEXT_LINES] from a file */
    private extractContext;
    /**
     * Strip comments and collapse whitespace from a code snippet that has been
     * prefixed with line numbers in the format "NN: code...".
     * Preserves line-number prefixes so the LLM can still reference exact lines.
     * Removes: // line comments, /* block comments *\/, blank lines, trailing whitespace.
     * Saves ~30–40% of snippet tokens with zero semantic loss.
     */
    private minifyCode;
    /** Apply all bug pattern detectors to a set of snippets */
    private generateHypotheses;
    /**
     * Extract meaningful keywords from an issue string.
     *
     * Priority order (highest → lowest):
     *  1. URL path segments  — most precise: `/purchasing/grns/stale` → ["purchasing","grns","stale"]
     *  2. Quoted identifiers — component/feature names in single or double quotes
     *  3. General word tokens — everything else, after stop-word filtering
     *
     * This ensures that a URL buried mid-sentence beats generic English words
     * that appear earlier in the text.
     */
    extractKeywords(issue: string): string[];
}
//# sourceMappingURL=code-brief-builder.d.ts.map