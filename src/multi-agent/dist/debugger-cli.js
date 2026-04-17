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
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";
import { AuthStorage, createAgentSession, DefaultResourceLoader, ModelRegistry, SessionManager, createGrepTool, createReadTool, createEditTool, createFindTool, } from "@mariozechner/pi-coding-agent";
import { CodeBriefBuilder } from "./code-brief-builder.js";
import { fileURLToPath } from "url";
const execAsync = promisify(exec);
// ─────────────────────────────────────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const AGENTS_DIR = path.join(__dirname, "agents");
const MEMORY_DIR = path.join(__dirname, "memory");
const STATE_DIR = path.join(PROJECT_ROOT, "state");
const REPORTS_DIR = path.join(PROJECT_ROOT, "reports");
const CACHE_DIR = path.join(STATE_DIR, "cache");
const PATTERNS_FILE = path.join(MEMORY_DIR, "debugger-patterns.json");
// ─────────────────────────────────────────────────────────────────────────────
// THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────
/** score ≥ this → inject Estimated Context block into Phase 2 prompt  */
const ESTIMATED_CONTEXT_THRESHOLD = 0.80;
/** score ≥ this → skip investigation LLM entirely (full fast-track, Approach 5) */
const FAST_TRACK_THRESHOLD = 0.85;
/** minimum score to surface any pattern at all */
const MATCH_THRESHOLD = 0.45;
// ─────────────────────────────────────────────────────────────────────────────
// TOOL SETS PER PHASE  (Approach 4 — minimal overhead)
// ─────────────────────────────────────────────────────────────────────────────
/** Investigation: read-only — grep + read + find (~1,900 token overhead) */
function investigationTools() {
    return [
        createGrepTool(PROJECT_ROOT),
        createReadTool(PROJECT_ROOT),
        createFindTool(PROJECT_ROOT),
    ];
}
/** Remediation: read + edit only (~1,260 token overhead) */
function remediationTools() {
    return [
        createReadTool(PROJECT_ROOT),
        createEditTool(PROJECT_ROOT),
    ];
}
/** Tester: needs to read sources, create and edit test files */
function testerTools() {
    return [
        createReadTool(PROJECT_ROOT),
        createEditTool(PROJECT_ROOT),
        createFindTool(PROJECT_ROOT),
        createGrepTool(PROJECT_ROOT),
    ];
}
/** QA: read-only verification — reads changed files, existing tests */
function qaTools() {
    return [
        createReadTool(PROJECT_ROOT),
        createGrepTool(PROJECT_ROOT),
        createFindTool(PROJECT_ROOT),
    ];
}
// ─────────────────────────────────────────────────────────────────────────────
// TOKEN ACCOUNTING
// ─────────────────────────────────────────────────────────────────────────────
function snapshotTokens(session, phase, baseline) {
    const s = session.getSessionStats?.() ?? { tokens: { input: 0, output: 0, cacheRead: 0, total: 0 } };
    const tok = s.tokens;
    const base = baseline ?? { input: 0, output: 0, cacheRead: 0, total: 0 };
    return {
        phase,
        input: tok.input - base.input,
        output: tok.output - base.output,
        cacheRead: tok.cacheRead - base.cacheRead,
        total: tok.total - base.total,
    };
}
function printTokenTable(ledger) {
    if (ledger.length === 0)
        return;
    const totals = ledger.reduce((acc, p) => ({ input: acc.input + p.input, output: acc.output + p.output, cacheRead: acc.cacheRead + p.cacheRead, total: acc.total + p.total }), { input: 0, output: 0, cacheRead: 0, total: 0 });
    const fmt = (n) => n.toLocaleString().padStart(9);
    console.log("\n" + "─".repeat(62));
    console.log("🪙  TOKEN USAGE");
    console.log("─".repeat(62));
    console.log(`  ${"Phase".padEnd(22)} ${"Input".padStart(9)} ${"Output".padStart(9)} ${"Cache↩".padStart(9)} ${"Total".padStart(9)}`);
    console.log("  " + "─".repeat(58));
    for (const p of ledger) {
        if (p.total === 0)
            continue;
        console.log(`  ${p.phase.padEnd(22)} ${fmt(p.input)} ${fmt(p.output)} ${fmt(p.cacheRead)} ${fmt(p.total)}`);
    }
    console.log("  " + "─".repeat(58));
    console.log(`  ${"TOTAL".padEnd(22)} ${fmt(totals.input)} ${fmt(totals.output)} ${fmt(totals.cacheRead)} ${fmt(totals.total)}`);
}
// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT CAPTURE  (model-agnostic)
// ─────────────────────────────────────────────────────────────────────────────
function attachOutputCapture(session, verbose = false) {
    let textOutput = "";
    const streamedIndexes = new Set();
    session.subscribe((event) => {
        if (event.type === "message_update") {
            const ae = event.assistantMessageEvent;
            if (!ae)
                return;
            switch (ae.type) {
                case "text_delta":
                    textOutput += (ae.delta ?? "");
                    process.stdout.write(ae.delta ?? "");
                    if (ae.contentIndex !== undefined)
                        streamedIndexes.add(ae.contentIndex);
                    break;
                case "text_end":
                    if (ae.content && (ae.contentIndex === undefined || !streamedIndexes.has(ae.contentIndex))) {
                        textOutput += ae.content;
                        process.stdout.write(ae.content);
                    }
                    break;
                case "thinking_delta":
                    if (verbose && ae.delta)
                        process.stdout.write(`\x1b[2m${ae.delta}\x1b[0m`);
                    break;
                case "thinking_end":
                    if (verbose)
                        process.stdout.write("\n");
                    break;
            }
        }
        else if (event.type === "message_end" && event.message?.role === "assistant" && !textOutput) {
            // Only use message_end as a fallback for ASSISTANT messages.
            // User message_end fires first (before any LLM response) and must not be captured.
            const text = extractTextFromMessage(event.message);
            if (text) {
                textOutput = text;
                console.log(text);
            }
        }
    });
    return () => textOutput;
}
function extractTextFromMessage(message) {
    if (!message)
        return "";
    const c = message.content;
    if (typeof c === "string")
        return c;
    if (Array.isArray(c))
        return c.filter((x) => x?.type === "text").map((x) => x.text ?? "").join("");
    return "";
}
// ─────────────────────────────────────────────────────────────────────────────
// ROBUST JSON EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────
const JSON_PLACEHOLDERS = [
    "precise one-sentence description",
    "specific actionable fix instruction",
    "path/to/File",
    "File.java:47",
    "methodName",
    "FE | BE | DB",
    "high | medium | low",
];
function isPlaceholderReport(obj) {
    const text = JSON.stringify(obj);
    return JSON_PLACEHOLDERS.some(p => text.includes(p));
}
function matchAll(re, str) {
    const results = [];
    let m;
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    while ((m = g.exec(str)) !== null)
        results.push([...m]);
    return results;
}
function extractJson(output, anchorKey) {
    const candidates = [
        () => {
            const all = matchAll(/```json\s*\n?([\s\S]*?)\n?```/i, output);
            if (!all.length)
                return null;
            return JSON.parse(all[all.length - 1][1].trim());
        },
        () => {
            const all = matchAll(/```\s*\n?(\{[\s\S]*?\})\s*\n?```/, output);
            if (!all.length)
                return null;
            return JSON.parse(all[all.length - 1][1].trim());
        },
        () => {
            const all = matchAll(new RegExp(`\\{[^{}]*"${anchorKey}"[\\s\\S]*?\\}`), output);
            if (!all.length)
                return null;
            return JSON.parse(all[all.length - 1][0]);
        },
        () => {
            const first = output.indexOf("{"), last = output.lastIndexOf("}");
            return first !== -1 && last > first ? JSON.parse(output.slice(first, last + 1)) : null;
        },
    ];
    for (const tryParse of candidates) {
        try {
            const result = tryParse();
            if (result && !isPlaceholderReport(result))
                return result;
        }
        catch { /* fall through */ }
    }
    return null;
}
// ─────────────────────────────────────────────────────────────────────────────
// PATTERN STORE
// ─────────────────────────────────────────────────────────────────────────────
async function loadPatterns() {
    try {
        return JSON.parse(await fs.readFile(PATTERNS_FILE, "utf-8"));
    }
    catch {
        return { version: 1, patterns: [], lastUpdated: new Date().toISOString() };
    }
}
async function savePatterns(store) {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
    store.lastUpdated = new Date().toISOString();
    await fs.writeFile(PATTERNS_FILE, JSON.stringify(store, null, 2), "utf-8");
}
// ─────────────────────────────────────────────────────────────────────────────
// SEMANTIC SIMILARITY  (Approach 7 hybrid: keyword × 0.4 + cosine × 0.6)
// ─────────────────────────────────────────────────────────────────────────────
const EMBED_MODEL = "nomic-embed-text";
const EMBED_URL = "http://localhost:11434/api/embeddings";
async function embedText(text) {
    try {
        const res = await fetch(EMBED_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
        });
        if (!res.ok)
            return null;
        const data = await res.json();
        return data.embedding ?? null;
    }
    catch {
        return null;
    }
}
function cosine(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
}
function patternEmbedText(p) {
    return [p.name, ...p.issueSignature, p.rootCauseTemplate, ...p.issueExamples.slice(0, 2)].join(" ");
}
/**
 * Keyword overlap score — raw [0, 1] without confidence scaling.
 * Treated as the "BM25-equivalent" component in the hybrid formula.
 */
function keywordRawScore(issueTokens, p) {
    const sigTokens = p.issueSignature.map(s => s.toLowerCase());
    const matched = sigTokens.filter(sig => issueTokens.some(t => t.includes(sig) || sig.includes(t)));
    let rawScore = sigTokens.length > 0 ? (matched.length / sigTokens.length) * 0.75 : 0;
    for (const ex of p.issueExamples) {
        if (tokenise(ex).filter(t => issueTokens.includes(t)).length >= 3) {
            rawScore = Math.min(rawScore + 0.25, 1);
            break;
        }
    }
    return { rawScore, matched };
}
/**
 * Primary pattern lookup.
 *
 * Strategy:
 *   1. Embed issue with Ollama → cosine over stored embeddings
 *   2. Keyword overlap for patterns without embeddings, or when Ollama is down
 *   3. Hybrid final score = (keywordRaw × 0.4 + cosineRaw × 0.6) × confidence
 */
async function matchPattern(issue, patterns) {
    const candidates = patterns.filter(p => p.confidence >= 0.20);
    if (candidates.length === 0)
        return { pattern: null, score: 0, matchedKeywords: [] };
    const issueVec = await embedText(issue);
    const issueTokens = tokenise(issue);
    let best = null, bestScore = 0, bestMatched = [];
    for (const p of candidates) {
        const { rawScore: kwRaw, matched } = keywordRawScore(issueTokens, p);
        let score;
        if (issueVec && p.embedding && p.embedding.length === issueVec.length) {
            // Hybrid: BM25-equiv × 0.4 + cosine × 0.6, then scale by confidence
            const cosineRaw = cosine(issueVec, p.embedding);
            score = (kwRaw * 0.4 + cosineRaw * 0.6) * p.confidence;
        }
        else {
            // Keyword-only fallback (no embedding available for this pattern or Ollama down)
            score = kwRaw * p.confidence;
        }
        if (score > bestScore) {
            bestScore = score;
            best = p;
            bestMatched = matched;
        }
    }
    return { pattern: bestScore >= MATCH_THRESHOLD ? best : null, score: bestScore, matchedKeywords: bestMatched };
}
function updatePatternStats(store, id, succeeded) {
    const p = store.patterns.find(x => x.id === id);
    if (!p)
        return;
    p.timesApplied++;
    p.lastUsed = new Date().toISOString();
    p.confidence = succeeded
        ? Math.min(p.confidence + 0.10, 0.95)
        : Math.max(p.confidence - 0.20, 0.05);
    if (p.confidence <= 0.05) {
        store.patterns = store.patterns.filter(x => x.id !== id);
        console.log(`[Patterns] Removed low-confidence pattern "${p.name}"`);
    }
}
function tokenise(text) {
    return text.toLowerCase().split(/\W+/).filter(w => w.length >= 3);
}
// ─────────────────────────────────────────────────────────────────────────────
// PRE-FLIGHT
// ─────────────────────────────────────────────────────────────────────────────
const OPENROUTER_KEY = "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";
const OPENROUTER_PREFERRED = [
    "google/gemma-4-31b-it:free",
    "minimax/minimax-m2.5:free",
    "qwen/qwen3-coder:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "deepseek/deepseek-v3-0324:free",
];
/**
 * Live-probe an OpenRouter model with a minimal request.
 * Returns true if the model responds with HTTP 200.
 * Returns false on 429 (rate limit), 400, or network error.
 */
async function probeOpenRouterModel(modelId) {
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${OPENROUTER_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: modelId, messages: [{ role: "user", content: "Hi" }], max_tokens: 1 }),
            signal: AbortSignal.timeout(8000),
        });
        return res.ok;
    }
    catch {
        return false;
    }
}
async function preFlightChecks() {
    console.log("\n🔧 PRE-FLIGHT");
    console.log("─".repeat(52));
    const authStorage = AuthStorage.create();
    const modelRegistry = ModelRegistry.create(authStorage);
    modelRegistry.refresh();
    let model = null;
    // ── Primary: Ollama ──────────────────────────────────────────────────────
    const ollamaCandidate = modelRegistry.find("ollama", "minimax-m2:cloud");
    if (ollamaCandidate && modelRegistry.hasConfiguredAuth(ollamaCandidate)) {
        try {
            await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(3000) });
            console.log("   ✅ Ollama reachable → using minimax-m2:cloud");
            model = ollamaCandidate;
        }
        catch {
            console.warn("   ⚠️  Ollama not reachable — trying OpenRouter fallback...");
        }
    }
    // ── Fallback: OpenRouter (probe each model until one responds) ───────────
    if (!model) {
        for (const id of OPENROUTER_PREFERRED) {
            process.stdout.write(`   Testing openrouter/${id} ... `);
            const ok = await probeOpenRouterModel(id);
            if (ok) {
                const candidate = modelRegistry.find("openrouter", id);
                if (candidate && modelRegistry.hasConfiguredAuth(candidate)) {
                    console.log("✅");
                    model = candidate;
                    break;
                }
            }
            console.log("❌ (rate-limited or unavailable)");
        }
        if (!model) {
            throw new Error("Ollama is unreachable AND all OpenRouter free models are rate-limited.\n" +
                "   Start Ollama or add credits at https://openrouter.ai/settings");
        }
    }
    console.log(`   ✅ Using: ${model.provider}/${model.id}`);
    return { model, authStorage, modelRegistry };
}
// ─────────────────────────────────────────────────────────────────────────────
// HASH CACHE  (Approach 9 — skip investigation on identical issue+brief)
// ─────────────────────────────────────────────────────────────────────────────
function computeCacheKey(issue, brief, patternId) {
    const input = [
        issue.trim(),
        brief.keywords.join(","),
        brief.snippets.map(s => `${s.file}:${s.line}`).join("|"),
        patternId ?? "",
    ].join(":::");
    return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}
async function loadCachedReport(hash) {
    try {
        const raw = await fs.readFile(path.join(CACHE_DIR, `${hash}.json`), "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
/**
 * Cache is valid if every affectedFile is unchanged since the entry was written.
 * A missing file also invalidates (file may have been deleted — re-investigate).
 */
async function isCacheValid(entry) {
    const cachedAt = new Date(entry.cachedAt).getTime();
    for (const file of entry.affectedFiles) {
        try {
            const absPath = path.isAbsolute(file) ? file : path.join(PROJECT_ROOT, file);
            const stat = await fs.stat(absPath);
            if (stat.mtimeMs > cachedAt)
                return false;
        }
        catch {
            return false;
        }
    }
    return true;
}
async function saveCachedReport(hash, report) {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const entry = {
        hash,
        report,
        affectedFiles: report.affectedFiles,
        cachedAt: new Date().toISOString(),
    };
    await fs.writeFile(path.join(CACHE_DIR, `${hash}.json`), JSON.stringify(entry, null, 2));
}
// ─────────────────────────────────────────────────────────────────────────────
// ESTIMATED CONTEXT GENERATION  (Approach 7 — rule-based, 0 tokens)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Build a rule-based adaptation block for Phase 2 prompt injection.
 * Called when score is in the 0.80–0.84 range (good match, not full fast-track).
 * Uses pastFixExample when available for a concrete diff hint.
 */
function generateEstimatedContext(pattern, score, brief, issue) {
    const topSnippet = brief.snippets[0];
    const newFile = topSnippet?.file ?? "unknown file";
    const methodFromStack = issue.match(/at\s+[\w.$]+\.(\w+)\s*\(/)?.[1] ?? null;
    const inferredMethod = methodFromStack ?? (topSnippet ? `(see ${topSnippet.file}:${topSnippet.line})` : "unknown method");
    const pct = (score * 100).toFixed(0);
    let block;
    if (pattern.pastFixExample) {
        const pf = pattern.pastFixExample;
        block = [
            `=== SIMILAR PAST EXPERIENCE (confidence: ${pct}%, pattern: "${pattern.name}") ===`,
            `Old bug location : ${pf.oldFile} → ${pf.oldMethod}`,
            `Root cause       : ${pattern.rootCauseTemplate}`,
            `Fix applied      : ${pattern.fixTemplate}`,
            ``,
            `Adaptation mapping for the CURRENT issue:`,
            `  Old class  → ${newFile}`,
            `  Old method → ${inferredMethod}`,
            ``,
            `Key diff from past fix:`,
            pf.oldDiff.split("\n").slice(0, 8).map(l => `  ${l}`).join("\n"),
            ``,
            `Recommended approach: ${pattern.fixTemplate}`,
        ].join("\n");
    }
    else {
        block = [
            `=== SIMILAR PAST EXPERIENCE (confidence: ${pct}%, pattern: "${pattern.name}") ===`,
            `Root cause template : ${pattern.rootCauseTemplate}`,
            `Fix template        : ${pattern.fixTemplate}`,
            ``,
            `Adaptation mapping for the CURRENT issue:`,
            `  Likely affected file   → ${newFile}`,
            `  Likely affected method → ${inferredMethod}`,
            ``,
            `Verification steps:`,
            ...pattern.verificationSteps.map((s, i) => `  ${i + 1}. ${s}`),
        ].join("\n");
    }
    return { type: "pattern-match", confidence: score, patternName: pattern.name, block };
}
// ─────────────────────────────────────────────────────────────────────────────
// GIT-BLAME FALLBACK  (Approach 8 — cold-start, no pattern match)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * When Phase 0 finds no pattern match, parse the stack trace from the issue
 * and run git blame on the error line to get the last known change to that area.
 * Returns null if no stack trace reference is present or git fails.
 */
async function getGitBlameFallback(issue) {
    const stackRefs = [...issue.matchAll(/(\w+\.java):(\d+)/g)];
    if (stackRefs.length === 0)
        return null;
    const [, fileName, lineStr] = stackRefs[0];
    const lineNum = parseInt(lineStr, 10);
    try {
        const { stdout: findOut } = await execAsync(`find "${PROJECT_ROOT}/shopro-res/src" "${PROJECT_ROOT}/shopro-res-web/src" -name "${fileName}" -type f 2>/dev/null | head -1`, { timeout: 6000 });
        const absPath = findOut.trim();
        if (!absPath)
            return null;
        const relPath = path.relative(PROJECT_ROOT, absPath);
        const { stdout: blameOut } = await execAsync(`git -C "${PROJECT_ROOT}" blame -L ${lineNum},${lineNum} -- "${relPath}" 2>/dev/null`, { timeout: 5000 });
        const commitHash = blameOut.trim().split(" ")[0];
        if (!commitHash || /^0+$/.test(commitHash))
            return null;
        const { stdout: diffOut } = await execAsync(`git -C "${PROJECT_ROOT}" show ${commitHash} -- "${relPath}" 2>/dev/null | head -50`, { timeout: 5000 });
        if (!diffOut.trim())
            return null;
        const block = [
            `=== GIT BLAME FALLBACK (cold-start — no pattern matched) ===`,
            `Error location : ${relPath}:${lineNum}`,
            `Last commit touching this area : ${commitHash.slice(0, 8)}`,
            ``,
            `Recent diff (last change to this file area):`,
            "```diff",
            diffOut.slice(0, 500),
            "```",
            ``,
            `Hint: check whether the recent commit introduced or removed something`,
            `that directly relates to the bug described in the issue above.`,
        ].join("\n");
        return { type: "git-blame-fallback", confidence: 0.55, block };
    }
    catch {
        return null;
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// APPROACH 5 — PATTERN FAST-TRACK (skip investigation LLM call entirely)
// ─────────────────────────────────────────────────────────────────────────────
async function tryFastTrack(_issue, pattern, brief) {
    console.log(`\n⚡ FAST-TRACK: verifying pattern "${pattern.name}"...`);
    const verification = await brief.verifyPattern(pattern.codeSearchStrategy);
    if (!verification.applies) {
        console.log("   ⚠️  Pattern code not found — falling back to investigation");
        return null;
    }
    const snippet = verification.snippets[0];
    console.log(`   ✅ Pattern verified at ${snippet.file}:${snippet.line}`);
    return {
        rootCause: pattern.rootCauseTemplate,
        category: pattern.category,
        affectedFiles: [snippet.file],
        affectedMethods: [],
        evidence: [`${snippet.file}:${snippet.line}  (verified by pattern "${pattern.name}")`],
        recommendedFix: pattern.fixTemplate,
        confidence: "high",
        patternId: pattern.id,
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — INVESTIGATION  (LLM session with code brief + estimated context)
// ─────────────────────────────────────────────────────────────────────────────
async function runInvestigation(issue, match, brief, briefBuilder, estimatedContext, model, authStorage, modelRegistry, verbose) {
    const agentsFile = path.join(AGENTS_DIR, "debugger", "AGENTS.md");
    let agentsContent = "";
    try {
        agentsContent = await fs.readFile(agentsFile, "utf-8");
    }
    catch { /* no AGENTS.md */ }
    const loader = new DefaultResourceLoader({
        cwd: PROJECT_ROOT,
        agentsFilesOverride: () => ({
            agentsFiles: agentsContent ? [{ path: agentsFile, content: agentsContent }] : [],
        }),
    });
    await loader.reload();
    const hasHypotheses = brief.hypotheses.length > 0;
    const hasSnippets = brief.snippets.length > 0;
    const mode = hasHypotheses ? "hypothesis_confirm" : hasSnippets ? "assisted" : "full";
    const { session } = await createAgentSession({
        cwd: PROJECT_ROOT,
        model,
        authStorage,
        modelRegistry,
        tools: investigationTools(),
        resourceLoader: loader,
        sessionManager: SessionManager.inMemory(),
    });
    const getOutput = attachOutputCapture(session, verbose);
    console.log(`\n🔍 INVESTIGATION (mode: ${mode})\n`);
    const prompt = buildInvestigationPrompt(issue, match, brief, briefBuilder, mode, estimatedContext);
    await session.prompt(prompt);
    let rawOutput = getOutput();
    let report = extractJson(rawOutput, "rootCause");
    if (!report) {
        console.log("   ↩️  No JSON in first response — requesting JSON output...");
        await session.prompt("Your analysis above is complete. Now output ONLY the DebugReport JSON block. " +
            "No prose, no tool calls. Just the ```json block with all fields filled in.");
        rawOutput = getOutput();
        report = extractJson(rawOutput, "rootCause");
    }
    const tokens = snapshotTokens(session, "INVESTIGATION");
    return { rawOutput, report, session, tokens };
}
// ─────────────────────────────────────────────────────────────────────────────
// PROMPT BUILDERS
// ─────────────────────────────────────────────────────────────────────────────
function buildInvestigationPrompt(issue, match, brief, briefBuilder, mode, estimatedContext) {
    // Estimated Context block (Approach 7) — prepended so LLM sees adaptation hint first
    const estimatedCtxSection = estimatedContext
        ? `${estimatedContext.block}\n\n`
        : "";
    // Pattern hint for hypothesis-guided investigation (Approach 5 partial)
    const patternHint = match.pattern
        ? `\n## Working Memory Match: "${match.pattern.name}" (score ${(match.score * 100).toFixed(0)}%)\n` +
            `Pattern id: \`${match.pattern.id}\`\n` +
            `Root cause template: ${match.pattern.rootCauseTemplate}\n` +
            `Fix template: ${match.pattern.fixTemplate}\n` +
            `Include \`"patternId": "${match.pattern.id}"\` in your JSON if this pattern applies.\n`
        : "";
    // Code brief section (Approach 1)
    const codeBriefSection = brief.snippets.length > 0
        ? briefBuilder.formatBriefForPrompt(brief)
        : "";
    const taskSection = mode === "hypothesis_confirm"
        ? `## Your Task — Hypothesis Confirmation

The pre-analysis above detected ${brief.hypotheses.length} candidate root cause(s).
For each hypothesis:
1. Read the code snippet provided (already above — no read tool call needed)
2. Decide: is this the actual root cause? Why or why not?
3. Select the most likely root cause

Then output your DebugReport JSON.`
        : mode === "assisted"
            ? `## Your Task — Assisted Investigation

Relevant code has been pre-extracted above.
1. Review the provided snippets — they were found by searching for issue keywords
2. Identify which snippet contains the bug
3. If you need more context, use the read tool on that specific file only
4. Output your DebugReport JSON`
            : `## Your Task — Full Investigation

1. Search the codebase: \`grep -r "<keyword>" shopro-res/src/main/java/\`
2. Read only the relevant service/repository/component
3. Identify the root cause
4. Output your DebugReport JSON`;
    return `## Issue

"${issue}"
${estimatedCtxSection}${patternHint}
${codeBriefSection}
${taskSection}

## Required JSON Output (end your response with this block, nothing after):

\`\`\`json
{
  "rootCause": "precise one-sentence description",
  "category": "FE | BE | DB | Integration | WebSocket | Security",
  "affectedFiles": ["path/to/File.java"],
  "affectedMethods": ["methodName"],
  "evidence": ["File.java:47  WHERE qty >= threshold  →  should be <"],
  "recommendedFix": "specific actionable fix instruction",
  "confidence": "high | medium | low"${match.pattern ? `,\n  "patternId": "${match.pattern.id}"` : ""}
}
\`\`\`
`;
}
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 — REMEDIATION  (Approach 2 method extraction + Approach 4 min tools)
// ─────────────────────────────────────────────────────────────────────────────
async function runSpecialistAgent(agentId, issue, report, briefBuilder, model, authStorage, modelRegistry, verbose) {
    // Approach 2: pre-extract affected methods before the LLM session starts
    const methodSnippets = [];
    for (const file of report.affectedFiles) {
        for (const method of report.affectedMethods) {
            const snippet = await briefBuilder.extractMethod(file, method);
            if (snippet)
                methodSnippets.push(snippet);
        }
    }
    const agentsFile = path.join(AGENTS_DIR, agentId, "AGENTS.md");
    let agentsContent = "";
    try {
        agentsContent = await fs.readFile(agentsFile, "utf-8");
    }
    catch {
        console.warn(`   ⚠️  No AGENTS.md for ${agentId}`);
    }
    const loader = new DefaultResourceLoader({
        cwd: PROJECT_ROOT,
        agentsFilesOverride: () => ({
            agentsFiles: agentsContent ? [{ path: agentsFile, content: agentsContent }] : [],
        }),
    });
    await loader.reload();
    const { session } = await createAgentSession({
        cwd: PROJECT_ROOT,
        model,
        authStorage,
        modelRegistry,
        tools: remediationTools(),
        resourceLoader: loader,
        sessionManager: SessionManager.inMemory(),
    });
    const getOutput = attachOutputCapture(session, verbose);
    const prompt = buildRemediationPrompt(issue, report, methodSnippets, briefBuilder);
    console.log(`\n🔧 REMEDIATION — ${agentId}\n`);
    await session.prompt(prompt);
    const output = getOutput();
    const filesChanged = extractFileChanges(output);
    const tokens = snapshotTokens(session, agentId);
    await fs.writeFile(path.join(STATE_DIR, `${agentId}-output.json`), JSON.stringify({ agentId, issue, report, output, filesChanged, completedAt: new Date().toISOString() }, null, 2));
    return { output, filesChanged, methodSnippets, tokens };
}
function buildRemediationPrompt(issue, report, methodSnippets, briefBuilder) {
    const snippetSection = methodSnippets.length > 0
        ? `## Affected Code (pre-extracted — read tool not needed for these)\n\n` +
            methodSnippets.map(s => briefBuilder.formatMethodForPrompt(s)).join("\n\n")
        : "";
    return `## Bug Fix

**Issue:** ${issue}

---

**Root Cause:** ${report.rootCause}
**Category:** ${report.category}
**Fix:** ${report.recommendedFix}

**Evidence:**
${report.evidence.map(e => `- ${e}`).join("\n")}

${snippetSection}

---

## Task

1. ${methodSnippets.length > 0 ? "The affected code is shown above — apply the fix directly" : "Read the affected files and apply the fix"}
2. Make **only** the targeted change — do not touch unrelated code
3. Output: files changed (full paths), what was changed, how to verify
`;
}
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3.5 — VERIFICATION  (tester agent writes targeted tests)
// ─────────────────────────────────────────────────────────────────────────────
async function runTesterAgent(issue, report, remediationOutput, briefBuilder, model, authStorage, modelRegistry, verbose) {
    const methodSnippets = [];
    for (const file of report.affectedFiles) {
        for (const method of report.affectedMethods) {
            const snippet = await briefBuilder.extractMethod(file, method);
            if (snippet)
                methodSnippets.push(snippet);
        }
    }
    const agentsFile = path.join(AGENTS_DIR, "tester", "AGENTS.md");
    let agentsContent = "";
    try {
        agentsContent = await fs.readFile(agentsFile, "utf-8");
    }
    catch { /* no file */ }
    const loader = new DefaultResourceLoader({
        cwd: PROJECT_ROOT,
        agentsFilesOverride: () => ({
            agentsFiles: agentsContent ? [{ path: agentsFile, content: agentsContent }] : [],
        }),
    });
    await loader.reload();
    const { session } = await createAgentSession({
        cwd: PROJECT_ROOT,
        model,
        authStorage,
        modelRegistry,
        tools: testerTools(),
        resourceLoader: loader,
        sessionManager: SessionManager.inMemory(),
    });
    const getOutput = attachOutputCapture(session, verbose);
    const snippetSection = methodSnippets.length > 0
        ? `## Fixed Code (pre-extracted)\n\n` +
            methodSnippets.map(s => briefBuilder.formatMethodForPrompt(s)).join("\n\n") + "\n\n"
        : "";
    const prompt = `## Write Tests for Bug Fix

**Issue:** ${issue}

**Root Cause:** ${report.rootCause}
**Category:** ${report.category}
**Fix Applied:** ${report.recommendedFix}
**Affected Files:** ${report.affectedFiles.join(", ")}
**Affected Methods:** ${report.affectedMethods.join(", ")}

${snippetSection}## Remediation Summary
${remediationOutput.slice(0, 600)}

## Task

Write targeted tests that verify this specific fix:
1. Test the exact scenario from the issue (should now pass)
2. Test boundary/edge cases around the fix
3. Test that adjacent behavior is not broken

Output a JSON summary at the end:
\`\`\`json
{
  "testsCreated": ["path/to/TestFile.java"],
  "testCount": 3,
  "scenarios": ["description of each test scenario"]
}
\`\`\`
`;
    console.log(`\n🧪 VERIFICATION — tester\n`);
    await session.prompt(prompt);
    const output = getOutput();
    const tokens = snapshotTokens(session, "tester");
    const parsed = extractJson(output, "testsCreated");
    const result = {
        testsCreated: parsed?.testsCreated ?? [],
        testCount: parsed?.testCount ?? 0,
        scenarios: parsed?.scenarios ?? [],
        output,
    };
    await fs.writeFile(path.join(STATE_DIR, "tester-output.json"), JSON.stringify({ issue, report, result, completedAt: new Date().toISOString() }, null, 2));
    return { result, tokens };
}
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3.6 — QA CHECK  (QA agent verifies fix + reviews tests)
// ─────────────────────────────────────────────────────────────────────────────
async function runQAAgent(issue, report, testerResult, model, authStorage, modelRegistry, verbose) {
    const agentsFile = path.join(AGENTS_DIR, "qa", "AGENTS.md");
    let agentsContent = "";
    try {
        agentsContent = await fs.readFile(agentsFile, "utf-8");
    }
    catch { /* no file */ }
    const loader = new DefaultResourceLoader({
        cwd: PROJECT_ROOT,
        agentsFilesOverride: () => ({
            agentsFiles: agentsContent ? [{ path: agentsFile, content: agentsContent }] : [],
        }),
    });
    await loader.reload();
    const { session } = await createAgentSession({
        cwd: PROJECT_ROOT,
        model,
        authStorage,
        modelRegistry,
        tools: qaTools(),
        resourceLoader: loader,
        sessionManager: SessionManager.inMemory(),
    });
    const getOutput = attachOutputCapture(session, verbose);
    const prompt = `## QA Verification

**Issue:** ${issue}

**Root Cause:** ${report.rootCause}
**Fix Applied:** ${report.recommendedFix}
**Confidence:** ${report.confidence}

**Affected Files:** ${report.affectedFiles.join(", ")}
**Tests Written:** ${testerResult.testsCreated.join(", ") || "none"}
**Test Scenarios:** ${testerResult.scenarios.join("; ") || "n/a"}

## Task

1. Read the affected source files and confirm the fix was applied correctly
2. Verify the fix addresses the root cause (not just a symptom)
3. Check for regression risks introduced by the change
4. Review the tests — do they adequately cover the fix?

Output ONLY a JSON report:
\`\`\`json
{
  "status": "PASS | FAIL | PARTIAL",
  "fixVerified": true,
  "notes": ["specific observations about fix quality"],
  "concerns": ["regression risks or coverage gaps"]
}
\`\`\`
`;
    console.log(`\n🔎 QA CHECK\n`);
    await session.prompt(prompt);
    const output = getOutput();
    const tokens = snapshotTokens(session, "qa");
    const parsed = extractJson(output, "status");
    const result = {
        status: parsed?.status ?? "UNKNOWN",
        fixVerified: parsed?.fixVerified ?? false,
        notes: parsed?.notes ?? [],
        concerns: parsed?.concerns ?? [],
        output,
    };
    const timestamp = Date.now();
    await fs.writeFile(path.join(STATE_DIR, "qa-output.json"), JSON.stringify({ issue, report, result, completedAt: new Date().toISOString() }, null, 2));
    await fs.writeFile(path.join(REPORTS_DIR, `qa-report-${timestamp}.json`), JSON.stringify({
        taskId: crypto.randomUUID(),
        executedAt: new Date().toISOString(),
        status: result.status,
        issue,
        fixVerified: result.fixVerified,
        notes: result.notes,
        concerns: result.concerns,
        testsCreated: testerResult.testsCreated,
        affectedFiles: report.affectedFiles,
    }, null, 2));
    return { result, tokens };
}
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 4 — PATTERN LEARNING  (session reuse, saves pastFixExample)
// ─────────────────────────────────────────────────────────────────────────────
async function learnPattern(issue, report, _filesChanged, sessionId, _model, _authStorage, _modelRegistry, usedPatternId, store, existingSession, remediationOutput, estimatedContext) {
    const noTokens = () => ({ phase: "PATTERN_LEARNING", input: 0, output: 0, cacheRead: 0, total: 0 });
    // Case A: known pattern worked → reinforce it and update pastFixExample
    if (usedPatternId) {
        updatePatternStats(store, usedPatternId, true);
        const p = store.patterns.find(x => x.id === usedPatternId);
        if (p) {
            p.issueExamples = [...new Set([...p.issueExamples, issue])].slice(-5);
            // Overwrite pastFixExample with the latest concrete example
            if (report.affectedFiles.length > 0) {
                p.pastFixExample = {
                    oldFile: report.affectedFiles[0],
                    oldMethod: report.affectedMethods[0] ?? "",
                    oldDiff: extractDiffSummary(remediationOutput),
                    estimatedContextUsed: estimatedContext?.block ?? "",
                };
            }
            console.log(`[Patterns] Reinforced "${p.name}" → confidence ${(p.confidence * 100).toFixed(0)}%`);
        }
        await savePatterns(store);
        return { patternId: usedPatternId, tokens: noTokens() };
    }
    // Case B: new issue → distil a new pattern from the existing session (Approach 6)
    console.log("\n📚 PATTERN_LEARNING — distilling pattern (reusing session)...\n");
    if (!existingSession) {
        console.log("[Patterns] No investigation session to reuse — skipping extraction");
        return { patternId: null, tokens: noTokens() };
    }
    const session = existingSession;
    const baseline = session.getSessionStats?.()?.tokens ?? { input: 0, output: 0, cacheRead: 0, total: 0 };
    const getOutput = attachOutputCapture(session, false);
    await session.prompt(`Distil this debug session into a reusable pattern. Respond with ONLY a JSON block:

\`\`\`json
{
  "name": "short name for this class of bug",
  "issueSignature": ["keyword1", "keyword2", "keyword3"],
  "codeSearchStrategy": ["grep -r 'keyword' shopro-res/src/main/java/"],
  "rootCauseTemplate": "abstract root cause with {placeholders}",
  "fixTemplate": "abstract fix with {placeholders}",
  "verificationSteps": ["how to verify the fix"]
}
\`\`\`

Context: issue="${issue.slice(0, 100)}", rootCause="${report.rootCause}", fix="${report.recommendedFix}"`);
    const tokens = snapshotTokens(session, "PATTERN_LEARNING", baseline);
    const raw = getOutput();
    const extracted = extractJson(raw, "name");
    if (!extracted?.name) {
        console.log("[Patterns] Could not extract pattern");
        return { patternId: null, tokens };
    }
    const newPattern = {
        id: `pattern-${crypto.randomUUID().split("-")[0]}`,
        name: extracted.name,
        issueSignature: extracted.issueSignature ?? tokenise(issue).slice(0, 6),
        issueExamples: [issue],
        category: report.category,
        codeSearchStrategy: extracted.codeSearchStrategy ?? [],
        rootCauseTemplate: extracted.rootCauseTemplate ?? report.rootCause,
        fixTemplate: extracted.fixTemplate ?? report.recommendedFix,
        verificationSteps: extracted.verificationSteps ?? [],
        confidence: 0.60,
        timesApplied: 1,
        timesSucceeded: 1,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        sourceSessionId: sessionId,
        pastFixExample: report.affectedFiles.length > 0 ? {
            oldFile: report.affectedFiles[0],
            oldMethod: report.affectedMethods[0] ?? "",
            oldDiff: extractDiffSummary(remediationOutput),
            estimatedContextUsed: estimatedContext?.block ?? "",
        } : undefined,
    };
    // Embed now so future lookups use cosine similarity instead of keywords only
    const embedding = await embedText(patternEmbedText(newPattern));
    if (embedding) {
        newPattern.embedding = embedding;
        console.log(`[Patterns] Embedded "${newPattern.name}" (${embedding.length}d vector)`);
    }
    else {
        console.log(`[Patterns] Ollama embed unavailable — keyword fallback will be used`);
    }
    store.patterns.push(newPattern);
    await savePatterns(store);
    console.log(`[Patterns] Stored "${newPattern.name}" (${newPattern.id})`);
    return { patternId: newPattern.id, tokens };
}
// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Extract the most informative lines from remediation output to use as oldDiff.
 * Looks for diff-style lines (+/-) or explicit "changed / replaced / added" lines.
 */
function extractDiffSummary(remediationOutput) {
    const lines = remediationOutput.split("\n");
    const relevant = lines.filter(l => /^[+-]/.test(l.trimStart()) ||
        /changed|modified|replaced|added|removed|fixed|before:|after:/i.test(l));
    return (relevant.length > 0 ? relevant : lines)
        .slice(0, 10)
        .join("\n")
        || remediationOutput.slice(0, 300);
}
function extractFileChanges(output) {
    const changes = [];
    const patterns = [
        /(?:Created|Modified|Deleted):\s*`?([^\s`\n]+\.[a-zA-Z]+)`?/gi,
        /`([^`]+\.(?:java|ts|tsx|js|jsx|sql|yml|yaml|properties|json))`/g,
    ];
    for (const re of patterns) {
        let m;
        while ((m = re.exec(output)) !== null) {
            const file = m[1].trim();
            if (file.includes(".") && !file.includes(" ")) {
                const ctx = output.slice(Math.max(0, m.index - 20), m.index).toLowerCase();
                changes.push({
                    file,
                    action: /created/.test(ctx) ? "CREATED" : /deleted/.test(ctx) ? "DELETED" : "MODIFIED",
                    timestamp: new Date().toISOString(),
                });
            }
        }
    }
    return [...new Map(changes.map(c => [c.file, c])).values()];
}
function categoryToAgent(category) {
    return category === "FE" ? "fe-developer"
        : category === "DB" ? "db-developer"
            : "be-developer";
}
async function ensureDirectories() {
    for (const d of [STATE_DIR, REPORTS_DIR, MEMORY_DIR, CACHE_DIR]) {
        await fs.mkdir(d, { recursive: true });
    }
}
function startPhase(session, name, agentId) {
    const phase = { name, status: "RUNNING", startedAt: new Date().toISOString(), ...(agentId ? { agentId } : {}) };
    session.phases.push(phase);
    return phase;
}
function endPhase(phase, status, note) {
    phase.status = status;
    phase.completedAt = new Date().toISOString();
    if (note)
        phase.note = note;
}
// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
        console.log(`
╔══════════════════════════════════════════════════════════════════╗
║   DEBUGGER AGENT CLI — History-Aware + Token-Optimised           ║
╚══════════════════════════════════════════════════════════════════╝

Usage:
  npx ts-node src/multi-agent/debugger-cli.ts "Your issue"
  npx ts-node src/multi-agent/debugger-cli.ts --file issue.md --verbose
  npx ts-node src/multi-agent/debugger-cli.ts --patterns
  npx ts-node src/multi-agent/debugger-cli.ts --cache-clear

Options:
  --issue,       -i   Inline issue description
  --file,        -f   Read issue from file
  --verbose,     -v   Show model thinking output
  --patterns          List stored patterns and confidence scores
  --cache-clear       Delete all cached investigation results
  --help,        -h   Show this help

Approaches active:
  #1  Grep Oracle (code brief)
  #2  Method Extraction (remediation)
  #3  Hypothesis Confirmation
  #4  Minimal Tool Sets
  #5  Pattern Fast-Track (≥0.85)
  #6  Session Reuse (pattern learning)
  #7  Estimated Context injection (≥0.80)
  #8  Git-Blame Fallback (cold-start)
  #9  Hash Cache (skip Phase 2 on repeats)
  #10 Code Minification (comment stripping)
`);
        return;
    }
    if (args.includes("--patterns")) {
        const store = await loadPatterns();
        if (!store.patterns.length) {
            console.log("\nNo patterns stored yet.\n");
            return;
        }
        console.log(`\n📚 Patterns (${store.patterns.length}):\n`);
        for (const p of store.patterns) {
            const rate = p.timesApplied > 0 ? `${Math.round((p.timesSucceeded / p.timesApplied) * 100)}%` : "n/a";
            const status = p.confidence >= FAST_TRACK_THRESHOLD ? "⚡ fast-track"
                : p.confidence >= ESTIMATED_CONTEXT_THRESHOLD ? "🔵 estimated-ctx"
                    : p.confidence >= 0.70 ? "✅ trusted"
                        : p.confidence >= 0.40 ? "🟡 developing"
                            : "🔴 quarantined";
            const hasFix = p.pastFixExample ? " [has pastFixExample]" : "";
            console.log(`  [${p.id}] ${p.name}`);
            console.log(`     ${status}${hasFix} | confidence ${(p.confidence * 100).toFixed(0)}% | success ${rate} | used ${p.timesApplied}×\n`);
        }
        return;
    }
    if (args.includes("--cache-clear")) {
        try {
            const files = await fs.readdir(CACHE_DIR);
            for (const f of files.filter(f => f.endsWith(".json"))) {
                await fs.unlink(path.join(CACHE_DIR, f));
            }
            console.log(`\n✅ Cleared ${files.length} cache entries.\n`);
        }
        catch {
            console.log("\nNo cache to clear.\n");
        }
        return;
    }
    let issue = "", verbose = false;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--issue" || args[i] === "-i") {
            issue = args[++i] ?? "";
        }
        else if (args[i] === "--file" || args[i] === "-f") {
            issue = await fs.readFile(path.resolve(PROJECT_ROOT, args[++i] ?? ""), "utf-8");
        }
        else if (args[i] === "--verbose" || args[i] === "-v") {
            verbose = true;
        }
        else if (!args[i].startsWith("-")) {
            issue = args[i];
        }
    }
    if (!issue.trim()) {
        console.error("Error: no issue provided. Use --help.");
        process.exit(1);
    }
    await ensureDirectories();
    const debugSession = {
        sessionId: crypto.randomUUID(), issue,
        startedAt: new Date().toISOString(), phases: [], filesChanged: [], tokenLedger: [],
    };
    console.log("\n" + "═".repeat(66));
    console.log("🔍  HISTORY-AWARE DEBUGGER  (token-optimised, 10 approaches)");
    console.log("═".repeat(66));
    console.log(`📋 Issue   : ${issue.slice(0, 110)}`);
    console.log(`🆔 Session : ${debugSession.sessionId}\n`);
    try {
        // ── PRE-FLIGHT ─────────────────────────────────────────────────────────────
        const pfPhase = startPhase(debugSession, "PRE_FLIGHT");
        const { model, authStorage, modelRegistry } = await preFlightChecks();
        endPhase(pfPhase, "SUCCESS");
        const briefBuilder = new CodeBriefBuilder(PROJECT_ROOT);
        // ── PHASE 0: PATTERN LOOKUP ─────────────────────────────────────────────
        console.log("\n" + "─".repeat(66));
        console.log("🧠 PHASE 0: PATTERN LOOKUP  (hybrid BM25×0.4 + cosine×0.6)");
        console.log("─".repeat(66));
        const p0 = startPhase(debugSession, "PATTERN_LOOKUP");
        const store = await loadPatterns();
        const match = await matchPattern(issue, store.patterns);
        let estimatedContext = null;
        if (match.pattern) {
            const score = match.score;
            const ftFlag = score >= FAST_TRACK_THRESHOLD ? " ⚡ fast-track"
                : score >= ESTIMATED_CONTEXT_THRESHOLD ? " 🔵 estimated-ctx"
                    : "";
            console.log(`   ✅ Match: "${match.pattern.name}" (${(score * 100).toFixed(0)}%)${ftFlag}`);
            debugSession.patternUsed = match.pattern.id;
            endPhase(p0, "SUCCESS", `${match.pattern.name} (${(score * 100).toFixed(0)}%)`);
        }
        else {
            console.log("   ℹ️  No pattern match — will attempt git-blame fallback");
            endPhase(p0, "SUCCESS", "No match");
        }
        // ── PHASE 1: CODE PRE-ANALYSIS (0 LLM tokens) ──────────────────────────
        console.log("\n" + "─".repeat(66));
        console.log("🔬 PHASE 1: CODE PRE-ANALYSIS  (#1 grep oracle + #3 hypotheses + #10 minify)");
        console.log("─".repeat(66));
        const p1 = startPhase(debugSession, "CODE_PREANALYSIS");
        const brief = await briefBuilder.build(issue);
        console.log(`   ✅ ${brief.snippets.length} snippet(s), ${brief.hypotheses.length} hypothesis(es) in ${brief.buildTimeMs}ms (~${brief.tokenEstimate} tokens after minification)`);
        if (brief.hypotheses.length > 0) {
            brief.hypotheses.forEach((h, i) => console.log(`   H${i + 1} [${h.confidence}] ${h.description}`));
        }
        endPhase(p1, "SUCCESS", `${brief.snippets.length} snippets, ${brief.hypotheses.length} hypotheses`);
        // ── GENERATE ESTIMATED CONTEXT or GIT-BLAME FALLBACK ──────────────────
        if (match.pattern && match.score >= ESTIMATED_CONTEXT_THRESHOLD) {
            estimatedContext = generateEstimatedContext(match.pattern, match.score, brief, issue);
            const ctxType = match.score >= FAST_TRACK_THRESHOLD ? "pre-computed (fast-track)" : "generated";
            console.log(`   🔵 Estimated Context ${ctxType} for "${match.pattern.name}"`);
        }
        else if (!match.pattern) {
            console.log("   🔍 No pattern — attempting git-blame fallback...");
            estimatedContext = await getGitBlameFallback(issue);
            if (estimatedContext) {
                console.log("   ✅ Git-blame fallback context attached");
            }
            else {
                console.log("   ℹ️  No stack trace refs found — cold-start without context hint");
            }
        }
        // ── CACHE CHECK ────────────────────────────────────────────────────────
        const cacheKey = computeCacheKey(issue, brief, match.pattern?.id);
        const cachedEntry = await loadCachedReport(cacheKey);
        let cachedHit = false;
        // ── PHASE 2: INVESTIGATION ──────────────────────────────────────────────
        console.log("\n" + "─".repeat(66));
        console.log("🔍 PHASE 2: INVESTIGATION");
        console.log("─".repeat(66));
        const p2 = startPhase(debugSession, "INVESTIGATION");
        let report = null;
        let investigationSession = null;
        // Approach 5: full fast-track when confidence is high enough
        if (match.pattern && match.score >= FAST_TRACK_THRESHOLD) {
            report = await tryFastTrack(issue, match.pattern, briefBuilder);
            if (report) {
                console.log("   ✅ Fast-track succeeded — investigation LLM call skipped");
                endPhase(p2, "SUCCESS", "Fast-track: 0 LLM tokens used");
            }
            else {
                console.log("   ↩️  Fast-track failed — falling back to full investigation");
                updatePatternStats(store, match.pattern.id, false);
                await savePatterns(store);
            }
        }
        // Approach 9: cache hit (score < 0.85 OR fast-track failed)
        if (!report && cachedEntry && await isCacheValid(cachedEntry)) {
            report = cachedEntry.report;
            cachedHit = true;
            console.log(`   ✅ Cache hit [${cacheKey}] — investigation LLM call skipped`);
            endPhase(p2, "SUCCESS", `Cache hit: ${cacheKey}`);
        }
        // Full LLM investigation — Approaches 1+3+4+7+8
        if (!report) {
            const result = await runInvestigation(issue, match, brief, briefBuilder, estimatedContext, model, authStorage, modelRegistry, verbose);
            report = result.report;
            investigationSession = result.session;
            debugSession.tokenLedger.push(result.tokens);
            await fs.writeFile(path.join(STATE_DIR, "debugger-output.json"), JSON.stringify({ sessionId: debugSession.sessionId, issue, report, rawOutput: result.rawOutput, completedAt: new Date().toISOString() }, null, 2));
            if (report) {
                // Save to cache for future runs
                await saveCachedReport(cacheKey, report);
                endPhase(p2, "SUCCESS", `${report.category} | ${report.confidence}`);
                if (match.pattern && !report.patternId) {
                    updatePatternStats(store, match.pattern.id, false);
                    await savePatterns(store);
                    debugSession.patternUsed = undefined;
                }
            }
            else {
                endPhase(p2, "FAILED", "Could not parse DebugReport");
                if (match.pattern) {
                    updatePatternStats(store, match.pattern.id, false);
                    await savePatterns(store);
                }
                console.warn("\n⚠️  No parseable JSON report — see state/debugger-output.json");
            }
        }
        if (report) {
            console.log("\n" + "─".repeat(66));
            console.log("📊 DIAGNOSIS");
            console.log("─".repeat(66));
            console.log(`   Root Cause : ${report.rootCause}`);
            console.log(`   Category   : ${report.category} | Confidence: ${report.confidence}`);
            if (cachedHit)
                console.log(`   Source     : cache [${cacheKey}]`);
            report.evidence.forEach(e => console.log(`   Evidence   : ${e}`));
            console.log(`   Fix        : ${report.recommendedFix}`);
        }
        // ── PHASE 3: REMEDIATION ────────────────────────────────────────────────
        if (report) {
            const agentId = categoryToAgent(report.category);
            console.log("\n" + "─".repeat(66));
            console.log(`🔧 PHASE 3: REMEDIATION — ${agentId}  (#2 method extraction + #4 min tools)`);
            console.log("─".repeat(66));
            const p3 = startPhase(debugSession, "REMEDIATION", agentId);
            const { output: remOutput, filesChanged, tokens: remTokens, } = await runSpecialistAgent(agentId, issue, report, briefBuilder, model, authStorage, modelRegistry, verbose);
            debugSession.filesChanged = filesChanged;
            debugSession.tokenLedger.push(remTokens);
            endPhase(p3, "SUCCESS", `${filesChanged.length} file(s) changed`);
            // ── PHASE 3.5: VERIFICATION ───────────────────────────────────────────
            console.log("\n" + "─".repeat(66));
            console.log("🧪 PHASE 3.5: VERIFICATION — tester");
            console.log("─".repeat(66));
            const p35 = startPhase(debugSession, "VERIFICATION", "tester");
            const { result: verResult, tokens: verTokens } = await runTesterAgent(issue, report, remOutput, briefBuilder, model, authStorage, modelRegistry, verbose);
            debugSession.verificationResult = verResult;
            debugSession.tokenLedger.push(verTokens);
            endPhase(p35, "SUCCESS", `${verResult.testCount} test(s) created`);
            // ── PHASE 3.6: QA CHECK ───────────────────────────────────────────────
            console.log("\n" + "─".repeat(66));
            console.log("🔎 PHASE 3.6: QA CHECK");
            console.log("─".repeat(66));
            const p36 = startPhase(debugSession, "QA_CHECK", "qa");
            const { result: qaResult, tokens: qaTokens } = await runQAAgent(issue, report, verResult, model, authStorage, modelRegistry, verbose);
            debugSession.qaResult = qaResult;
            debugSession.tokenLedger.push(qaTokens);
            endPhase(p36, qaResult.status === "FAIL" ? "FAILED" : "SUCCESS", `${qaResult.status} | fixVerified: ${qaResult.fixVerified}`);
            // ── PHASE 4: PATTERN LEARNING ─────────────────────────────────────────
            console.log("\n" + "─".repeat(66));
            console.log("📚 PHASE 4: PATTERN LEARNING  (#6 session reuse + pastFixExample)");
            console.log("─".repeat(66));
            const p4 = startPhase(debugSession, "PATTERN_LEARNING");
            const { patternId: learnedId, tokens: learnTokens } = await learnPattern(issue, report, filesChanged, debugSession.sessionId, model, authStorage, modelRegistry, report.patternId ?? null, store, investigationSession, remOutput, estimatedContext);
            debugSession.tokenLedger.push(learnTokens);
            if (learnedId) {
                debugSession.patternLearned = learnedId;
                endPhase(p4, "SUCCESS", learnedId === (report.patternId ?? null) ? "Reinforced" : `New: ${learnedId}`);
            }
            else {
                endPhase(p4, "SKIPPED", "Extraction failed");
            }
        }
        // ── FINAL SUMMARY ──────────────────────────────────────────────────────
        debugSession.completedAt = new Date().toISOString();
        printTokenTable(debugSession.tokenLedger);
        const totalTokens = debugSession.tokenLedger.reduce((s, p) => s + p.total, 0);
        const qaStatusLine = debugSession.qaResult
            ? `QA Status       : ${debugSession.qaResult.status} | fixVerified: ${debugSession.qaResult.fixVerified}`
            : "QA Status       : skipped";
        const testsLine = debugSession.verificationResult?.testCount
            ? `Tests written   : ${debugSession.verificationResult.testCount} (${debugSession.verificationResult.testsCreated.join(", ")})`
            : "Tests written   : none";
        const conclusion = [
            "═".repeat(66),
            "  FINAL CONCLUSION",
            "═".repeat(66),
            `Issue    : ${issue.slice(0, 110)}`,
            `Session  : ${debugSession.sessionId}`,
            "",
            "Phases:",
            ...debugSession.phases.map(p => {
                const icon = p.status === "SUCCESS" ? "✅" : p.status === "FAILED" ? "❌" : p.status === "SKIPPED" ? "⏭ " : "🔄";
                return `  ${icon} ${p.name.padEnd(22)} ${p.note ?? ""}`;
            }),
            "",
            `Files changed   : ${debugSession.filesChanged.length}`,
            ...debugSession.filesChanged.map(f => `  • ${f.action}: ${f.file}`),
            "",
            testsLine,
            qaStatusLine,
            ...(debugSession.qaResult?.concerns.length
                ? ["QA Concerns     :", ...debugSession.qaResult.concerns.map(c => `  ⚠️  ${c}`)]
                : []),
            "",
            debugSession.debugReport ? `Root Cause      : ${debugSession.debugReport.rootCause}` : "Root Cause      : see state/debugger-output.json",
            debugSession.patternUsed ? `Pattern used    : ${debugSession.patternUsed}` : "Pattern used    : none",
            debugSession.patternLearned ? `Pattern learned : ${debugSession.patternLearned}` : "Pattern learned : none",
            `Tokens (total)  : ${totalTokens.toLocaleString()}`,
            "═".repeat(66),
        ].join("\n");
        debugSession.finalConclusion = conclusion;
        console.log("\n" + conclusion);
        const reportPath = path.join(REPORTS_DIR, `debug-session-${debugSession.sessionId}.json`);
        await fs.writeFile(reportPath, JSON.stringify(debugSession, null, 2));
        console.log(`\n📁 ${reportPath}\n✅ Done.\n`);
    }
    catch (err) {
        console.error("\n❌ Failed:", err);
        await fs.writeFile(path.join(STATE_DIR, `debug-error-${debugSession.sessionId}.json`), JSON.stringify({ sessionId: debugSession.sessionId, issue, error: String(err), phases: debugSession.phases }, null, 2));
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=debugger-cli.js.map