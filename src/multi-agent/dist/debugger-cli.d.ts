#!/usr/bin/env npx ts-node
/**
 * Debugger Agent CLI — History-Aware + Token-Optimised Systematic Debugging
 *
 * Token-reduction approaches applied simultaneously:
 *
 *  #1 Grep Oracle         Pre-flight parallel greps inject a compact "code brief" into
 *                         the prompt so the LLM never calls grep/read tools itself.
 *
 *  #2 Method Extraction   Specialist agent receives only the affected method body
 *                         (10-50 lines) rather than the whole file.
 *
 *  #3 Hypothesis Confirm  Static detectors generate candidate root causes in JS.
 *                         LLM confirms one from pre-loaded snippets in a single turn.
 *
 *  #4 Minimal Tool Sets   Each phase gets only the 2-3 tools it actually needs.
 *
 *  #5 Pattern Fast-Track  confidence >= 0.85 → skip investigation entirely;
 *                         verify with Node.js grep, synthesise DebugReport from pattern.
 *
 *  #6 Session Reuse       Pattern extraction reuses the existing investigation session.
 *
 *  #7 Estimated Context   score 0.80–0.84 → rule-based adaptation block injected into
 *                         Phase 2 prompt. Guides LLM without full fast-track skip.
 *
 *  #8 Git-Blame Fallback  Cold-start (no pattern): git blame on the stack trace line
 *                         gives LLM context about the last real change to that area.
 *
 *  #9 Hash Cache          Phase 2 result cached by Hash(issue+brief+patternId).
 *                         Invalidated when any affectedFile is newer than the cache entry.
 *
 * #10 Code Minification   Snippets are comment-stripped before prompt injection (~30-40%).
 *
 * Five-phase workflow:
 *   0. PATTERN_LOOKUP      — hybrid BM25×0.4 + cosine×0.6, no LLM call
 *   1. CODE_PREANALYSIS    — parallel grep oracle + hypothesis generation, no LLM call
 *   2. INVESTIGATION       — fast-track OR hypothesis-confirm OR assisted investigation
 *   3. REMEDIATION         — specialist agent with pre-extracted method snippets
 *   3.5 VERIFICATION       — tester agent writes targeted tests for the fix
 *   3.6 QA_CHECK           — QA agent verifies fix correctness and reviews tests
 *   4. PATTERN_LEARNING    — session reuse, saves pastFixExample for future adaptation
 */
export {};
//# sourceMappingURL=debugger-cli.d.ts.map