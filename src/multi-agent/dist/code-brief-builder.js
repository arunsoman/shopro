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
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";
const execAsync = promisify(exec);
// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const CONTEXT_LINES = 12; // lines of context either side of a grep match
const MAX_SNIPPETS = 8; // hard cap on total snippets in a brief
const MAX_PER_KW = 3; // max snippets per keyword per source-root (grep-level cap)
const MAX_PER_KW_GLOBAL = 2; // max snippets per keyword across all roots (fair-share cap)
const MAX_KEYWORDS = 4; // only use top-N issue keywords for grepping
const GREP_TIMEOUT = 8000; // ms per grep command
/** Source directories to search, in priority order. Resolved against projectRoot. */
const SOURCE_DIRS = [
    "shopro-res/src/main/java", // backend (Spring Boot)
    "shopro-res-web/src", // frontend (React/TS)
    "shopro-pos-web/src", // alt frontend
    "src/backend",
    "src/frontend",
];
/** File types to include in searches */
const FILE_GLOBS = ["*.java", "*.ts", "*.tsx", "*.js"];
/** Stop-words that add noise but no signal */
const STOP_WORDS = new Set([
    // Generic English
    "the", "and", "but", "not", "its", "for", "are", "this", "that", "with",
    "from", "have", "was", "has", "all", "been", "being", "show", "showing",
    "shows", "get", "set", "when", "then", "also", "will", "would", "should",
    "could", "which", "where", "there", "their", "they", "them", "into", "page",
    "currently", "atleast", "below", "above", "level",
    // Generic web / DOM terms — match everything in a React codebase
    "element", "name", "data", "item", "node", "root", "text", "body",
    "form", "input", "label", "button", "link", "icon", "size", "style",
    "class", "event", "click", "render", "state", "hook", "prop", "ref",
    // Natural language filler in issue descriptions
    "calling", "hitting", "giving", "actual", "actaul", "giveing", // typo variants too
    "correct", "wrong", "issue", "problem", "working", "showing", "loading",
    "returning", "getting", "expected", "should", "does", "doesnt", "isnt",
    "localhost", "http", "https", "url", "port", "path",
    // Java boilerplate — match everything, add zero signal
    "java", "lang", "runtimeexception", "exception", "error",
    "import", "public", "private", "protected", "static", "final", "return",
    "null", "void", "string", "list", "enum", "interface", "extends",
    "implements", "override", "annotation", "parameter", "field", "method",
    "type", "value", "object", "true", "false", "lambda",
    // Stack trace noise
    "caused", "thrown", "cause", "reflect", "invoke", "base", "jdk",
    "internal", "direct", "handle", "accessor",
]);
const DETECTORS = [
    {
        id: "inverted_comparison",
        confidence: "high",
        test(line) {
            // Comparison involving domain-specific threshold/level/limit keywords
            const hasDomainWord = /\b(?:threshold|reorder|minimum|maximum|limit|quota|stock|level|count|qty|quantity|amount|balance)\b/i.test(line);
            if (!hasDomainWord)
                return null;
            const m = line.match(/([><=!]+)/);
            if (!m)
                return null;
            const op = m[1];
            const inv = { ">=": "<", "<=": ">", ">": "<=", "<": ">=" };
            if (inv[op])
                return `Comparison '${op}' may be inverted — should it be '${inv[op]}'?`;
            return null;
        },
    },
    {
        id: "optional_get_unsafe",
        confidence: "high",
        test(line, context) {
            if (!line.includes(".get()"))
                return null;
            if (/orElse|orElseThrow|ifPresent|isPresent|isEmpty|map\(/.test(context))
                return null;
            return "Optional.get() called without safety check — may throw NoSuchElementException";
        },
    },
    {
        id: "null_return_unchecked",
        confidence: "medium",
        test(line) {
            if (/return\s+null\b/.test(line))
                return "Method returns null — caller may not handle it";
            return null;
        },
    },
    {
        id: "collection_get_zero_unchecked",
        confidence: "medium",
        test(line, context) {
            if (!(/\.get\(0\)/.test(line) || /\.getFirst\(\)/.test(line) || /\.first\(\)/.test(line)))
                return null;
            if (/isEmpty|size\(\)|!empty/i.test(context))
                return null;
            return "Accessing first element without checking if collection is empty";
        },
    },
    {
        id: "missing_transactional",
        confidence: "low",
        test(line, context) {
            const isPublicModifying = /public\s+(?:void|int|long|boolean)\s+\w+\s*\(/.test(line);
            if (!isPublicModifying)
                return null;
            const modifiesData = /save\(|delete\(|update\(|persist\(|merge\(/.test(context);
            if (!modifiesData)
                return null;
            if (/@Transactional/.test(context))
                return null;
            return "Method modifies data but appears to lack @Transactional annotation";
        },
    },
    {
        id: "wrong_field_queried",
        confidence: "medium",
        test(line) {
            // Detects WHERE clauses that compare a field against itself or a constant 0/null
            if (/WHERE\s+\w+\s*[><=!]+\s*0\b/.test(line))
                return `WHERE clause compares against literal 0 — may be using wrong field`;
            if (/WHERE\s+\w+\s*=\s*null\b/i.test(line))
                return `WHERE clause compares against null — use IS NULL instead`;
            return null;
        },
    },
];
// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLASS
// ─────────────────────────────────────────────────────────────────────────────
export class CodeBriefBuilder {
    projectRoot;
    sourceRoots;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        // Resolve which source directories actually exist
        this.sourceRoots = SOURCE_DIRS
            .map(d => path.join(projectRoot, d))
            .filter(d => existsSync(d));
    }
    // ── PUBLIC API ─────────────────────────────────────────────────────────────
    /**
     * Build a compact code brief for the given issue.
     * If the issue string contains Java stack trace references (FileName.java:NN),
     * those files are read at the exact line number first — before any keyword grep.
     * Runs all greps in parallel; total wall-clock time is dominated by the slowest grep.
     */
    async build(issue) {
        const t0 = Date.now();
        const keywords = this.extractKeywords(issue);
        if (this.sourceRoots.length === 0) {
            return { keywords, snippets: [], hypotheses: [], buildTimeMs: 0, tokenEstimate: 0 };
        }
        const allSnippets = [];
        const seen = new Set();
        // ── Stack-trace fast-path ────────────────────────────────────────────────
        // Matches patterns like: PurchaseOrderService.java:53
        // or: at pkg.SomeClass.method(SomeClass.java:53)
        const stackRefs = [...issue.matchAll(/(\w+\.java):(\d+)/g)];
        for (const [, fileName, lineStr] of stackRefs) {
            const lineNum = parseInt(lineStr, 10);
            const found = await this.findFileInSourceRoots(fileName);
            if (!found)
                continue;
            const context = await this.extractContext(found.absPath, lineNum);
            if (!context)
                continue;
            const key = `${found.relPath}:${lineNum}`;
            if (!seen.has(key)) {
                seen.add(key);
                allSnippets.push({ file: found.relPath, line: lineNum, keyword: fileName, context });
            }
            if (allSnippets.length >= MAX_SNIPPETS)
                break;
        }
        // ── URL endpoint fast-path ────────────────────────────────────────────────
        // For issues describing a broken HTTP endpoint, search Spring Boot/Express
        // controller annotations directly instead of relying on keyword grep.
        // e.g. URL "/purchasing/grns/stale" → grep for @.*Mapping.*"stale"
        // This finds GoodsReceiptController.java:80 reliably regardless of other files.
        const urlMatches = [...issue.matchAll(/https?:\/\/[^\s'"]+/g)];
        for (const [rawUrl] of urlMatches) {
            if (allSnippets.length >= MAX_SNIPPETS)
                break;
            let segments = [];
            try {
                const URL_GENERIC = new Set(["api", "v1", "v2", "v3", "restaurants", "users", "auth", "admin"]);
                segments = new URL(rawUrl).pathname
                    .split("/")
                    .filter(s => s && !/^\d+$/.test(s) && !URL_GENERIC.has(s));
            }
            catch {
                continue;
            }
            // Search from the most-specific segment (last) backwards
            for (const seg of [...segments].reverse()) {
                if (allSnippets.length >= MAX_SNIPPETS)
                    break;
                // Match Spring Boot (@GetMapping, @PostMapping, @RequestMapping) and Express router
                const annotationPattern = `@.*Mapping.*".*${escapeShell(seg)}`;
                const endpointSnippets = (await Promise.allSettled(this.sourceRoots.map(dir => this.grepKeyword(annotationPattern, dir)))).flatMap(r => r.status === "fulfilled" ? r.value : []);
                for (const s of endpointSnippets) {
                    const key = `${s.file}:${s.line}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        allSnippets.push({ ...s, keyword: `endpoint:${seg}` });
                    }
                    if (allSnippets.length >= MAX_SNIPPETS)
                        break;
                }
            }
        }
        // ── Keyword grep (fills remaining slots) ────────────────────────────────
        // Each keyword is processed sequentially in priority order (URL segments first)
        // so that more-specific keywords are not crowded out by high-frequency ones.
        // Within each keyword, all source roots run in parallel for speed.
        const topKeywords = keywords.slice(0, MAX_KEYWORDS);
        for (const kw of topKeywords) {
            if (allSnippets.length >= MAX_SNIPPETS)
                break;
            const perRootResults = await Promise.allSettled(this.sourceRoots.map(dir => this.grepKeyword(kw, dir)));
            let kwCount = 0;
            for (const r of perRootResults) {
                if (kwCount >= MAX_PER_KW_GLOBAL)
                    break;
                if (r.status !== "fulfilled")
                    continue;
                for (const s of r.value) {
                    if (kwCount >= MAX_PER_KW_GLOBAL)
                        break;
                    const key = `${s.file}:${s.line}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        allSnippets.push(s);
                        kwCount++;
                    }
                    if (allSnippets.length >= MAX_SNIPPETS)
                        break;
                }
                if (allSnippets.length >= MAX_SNIPPETS)
                    break;
            }
        }
        // Generate hypotheses from matched lines (Approach 3)
        const hypotheses = this.generateHypotheses(allSnippets);
        const brief = {
            keywords: topKeywords,
            snippets: allSnippets,
            hypotheses,
            buildTimeMs: Date.now() - t0,
            tokenEstimate: Math.ceil(this.formatBriefForPrompt({ keywords: topKeywords, snippets: allSnippets, hypotheses, buildTimeMs: 0, tokenEstimate: 0 }).length / 4),
        };
        return brief;
    }
    /**
     * Extract a single method/function from a file using brace-counting.
     * Works for Java, TypeScript, and JavaScript.
     * Returns null if the method is not found.
     */
    async extractMethod(filePath, methodName) {
        const absPath = path.isAbsolute(filePath)
            ? filePath
            : path.join(this.projectRoot, filePath);
        let content;
        try {
            content = await fs.readFile(absPath, "utf-8");
        }
        catch {
            return null;
        }
        const lines = content.split("\n");
        // Find the line where the method signature starts
        // Handles: public/private/protected modifiers, annotations on preceding lines,
        // async, generics, arrow functions
        const methodRe = new RegExp(`(?:^|\\s)(?:public|private|protected|async|static|override|abstract)?\\s*(?:async\\s+)?${escapeRegex(methodName)}\\s*[\\(<]`, "m");
        const startIdx = lines.findIndex(l => methodRe.test(l));
        if (startIdx === -1)
            return null;
        // Walk back past annotations to include them
        let blockStart = startIdx;
        for (let i = startIdx - 1; i >= 0; i--) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith("@") || trimmed === "") {
                blockStart = i;
            }
            else
                break;
        }
        // Brace-count forward to find the closing brace
        let depth = 0;
        let inBody = false;
        let endIdx = startIdx;
        for (let i = startIdx; i < Math.min(startIdx + 200, lines.length); i++) {
            for (const ch of lines[i]) {
                if (ch === "{") {
                    depth++;
                    inBody = true;
                }
                if (ch === "}") {
                    depth--;
                }
            }
            if (inBody && depth === 0) {
                endIdx = i;
                break;
            }
        }
        const code = lines.slice(blockStart, endIdx + 1).join("\n");
        return {
            file: filePath,
            methodName,
            startLine: blockStart + 1,
            code,
            tokenEstimate: Math.ceil(code.length / 4),
        };
    }
    /**
     * Run a stored pattern's codeSearchStrategy grep commands and return
     * whether the pattern's characteristic code is still present.
     * Used by the fast-track skip (Approach 5).
     */
    async verifyPattern(searchStrategy) {
        const snippets = [];
        for (const strategy of searchStrategy) {
            // Parse the strategy — it may be a grep command or a plain keyword
            const kwMatch = strategy.match(/grep.*?["']([^"']+)["']/);
            const keyword = kwMatch ? kwMatch[1] : strategy.replace(/grep\s+-\S+\s*/g, "").trim();
            if (!keyword)
                continue;
            for (const root of this.sourceRoots) {
                const results = await this.grepKeyword(keyword, root);
                snippets.push(...results);
                if (snippets.length > 0)
                    break;
            }
            if (snippets.length > 0)
                break;
        }
        return { applies: snippets.length > 0, snippets };
    }
    // ── FORMATTING ─────────────────────────────────────────────────────────────
    /** Format the code brief as a compact prompt section (Approach 1 output) */
    formatBriefForPrompt(brief) {
        if (brief.snippets.length === 0)
            return "";
        const lines = [
            "## Pre-Analysis: Relevant Code (extracted before this session — no tool calls needed)",
            `Keywords searched: ${brief.keywords.join(", ")} | Found: ${brief.snippets.length} location(s) | ${brief.buildTimeMs}ms`,
            "",
        ];
        // Group snippets by file
        const byFile = new Map();
        for (const s of brief.snippets) {
            const list = byFile.get(s.file) ?? [];
            list.push(s);
            byFile.set(s.file, list);
        }
        for (const [file, snips] of byFile) {
            const ext = path.extname(file).replace(".", "") || "java";
            lines.push(`**${file}**`);
            for (const snip of snips) {
                lines.push(`(around line ${snip.line}, matched: "${snip.keyword}")`);
                lines.push("```" + ext);
                lines.push(snip.context);
                lines.push("```");
            }
            lines.push("");
        }
        if (brief.hypotheses.length > 0) {
            lines.push("## Hypotheses (auto-detected, verify then confirm or reject)");
            brief.hypotheses.forEach((h, i) => {
                lines.push(`${i + 1}. [${h.confidence.toUpperCase()}] ${h.description}`);
                lines.push(`   → ${h.snippet.file}:${h.snippet.line}`);
            });
            lines.push("");
        }
        return lines.join("\n");
    }
    /** Format a single method snippet for injection into a remediation prompt */
    formatMethodForPrompt(snippet) {
        const ext = path.extname(snippet.file).replace(".", "") || "java";
        return [
            `**${snippet.file}** — \`${snippet.methodName}\` (line ${snippet.startLine}):`,
            "```" + ext,
            snippet.code,
            "```",
        ].join("\n");
    }
    // ── PRIVATE HELPERS ────────────────────────────────────────────────────────
    /**
     * Run a single keyword grep across one directory.
     * Returns at most MAX_PER_KW snippets.
     */
    async grepKeyword(keyword, dir) {
        const includeArgs = FILE_GLOBS.map(g => `--include="${g}"`).join(" ");
        // -r recursive, -n line numbers, -l file list first (faster), -i case-insensitive
        const cmd = `grep -r -n -i ${includeArgs} "${escapeShell(keyword)}" "${dir}" 2>/dev/null`;
        let stdout = "";
        try {
            const result = await execAsync(cmd, { timeout: GREP_TIMEOUT });
            stdout = result.stdout;
        }
        catch (err) {
            // exit code 1 means no matches (not an error), anything else is a real error
            if (err.code === 1)
                return [];
            return [];
        }
        const matchLines = stdout.trim().split("\n").filter(Boolean);
        const snippets = [];
        const usedFiles = new Set();
        for (const matchLine of matchLines) {
            if (snippets.length >= MAX_PER_KW)
                break;
            // grep output: /abs/path/to/file.java:42:    code here
            const colonIdx1 = matchLine.indexOf(":");
            const colonIdx2 = matchLine.indexOf(":", colonIdx1 + 1);
            if (colonIdx1 === -1 || colonIdx2 === -1)
                continue;
            const absFile = matchLine.slice(0, colonIdx1);
            const lineNum = parseInt(matchLine.slice(colonIdx1 + 1, colonIdx2), 10);
            const matchedLine = matchLine.slice(colonIdx2 + 1).trimStart();
            if (isNaN(lineNum))
                continue;
            // Skip import/package declarations — they match every file in a package
            // and carry no debugging signal (the class that imports X is not the bug).
            if (/^(import|package)\s/.test(matchedLine))
                continue;
            // One snippet per file per keyword to keep brief compact
            const relFile = path.relative(this.projectRoot, absFile);
            if (usedFiles.has(relFile))
                continue;
            usedFiles.add(relFile);
            const context = await this.extractContext(absFile, lineNum);
            if (!context)
                continue;
            snippets.push({ file: relFile, line: lineNum, keyword, context });
        }
        return snippets;
    }
    /** Search all source roots for a file by base name, return first match */
    async findFileInSourceRoots(fileName) {
        for (const root of this.sourceRoots) {
            try {
                const { stdout } = await execAsync(`find "${root}" -name "${fileName}" -type f 2>/dev/null | head -1`, { timeout: GREP_TIMEOUT });
                const absPath = stdout.trim();
                if (absPath)
                    return { absPath, relPath: path.relative(this.projectRoot, absPath) };
            }
            catch { /* ignore, try next root */ }
        }
        return null;
    }
    /** Read lines [lineNum - CONTEXT_LINES, lineNum + CONTEXT_LINES] from a file */
    async extractContext(absFile, lineNum) {
        try {
            const content = await fs.readFile(absFile, "utf-8");
            const lines = content.split("\n");
            const from = Math.max(0, lineNum - CONTEXT_LINES - 1);
            const to = Math.min(lines.length - 1, lineNum + CONTEXT_LINES - 1);
            // Prefix each line with its line number for the LLM, then minify
            const raw = lines.slice(from, to + 1)
                .map((l, i) => `${from + i + 1}: ${l}`)
                .join("\n");
            return this.minifyCode(raw);
        }
        catch {
            return null;
        }
    }
    /**
     * Strip comments and collapse whitespace from a code snippet that has been
     * prefixed with line numbers in the format "NN: code...".
     * Preserves line-number prefixes so the LLM can still reference exact lines.
     * Removes: // line comments, /* block comments *\/, blank lines, trailing whitespace.
     * Saves ~30–40% of snippet tokens with zero semantic loss.
     */
    minifyCode(contextWithLineNumbers) {
        const lines = contextWithLineNumbers.split("\n");
        const result = [];
        let inBlockComment = false;
        for (const line of lines) {
            // Split "NN: code" prefix from code content
            const colonIdx = line.indexOf(": ");
            const prefix = colonIdx !== -1 ? line.slice(0, colonIdx + 2) : "";
            let code = colonIdx !== -1 ? line.slice(colonIdx + 2) : line;
            // Continue consuming block comment lines
            if (inBlockComment) {
                const end = code.indexOf("*/");
                if (end !== -1) {
                    code = code.slice(end + 2);
                    inBlockComment = false;
                }
                else {
                    continue; // whole line is inside block comment → skip
                }
            }
            // Remove inline /* ... */ block comments (single-line form)
            code = code.replace(/\/\*.*?\*\//g, "");
            // Detect unclosed /* that spans multiple lines
            const blockStart = code.indexOf("/*");
            if (blockStart !== -1) {
                code = code.slice(0, blockStart);
                inBlockComment = true;
            }
            // Remove // line comments (won't fire on http:// inside strings reliably,
            // but that's acceptable for a token-reduction heuristic)
            const commentIdx = code.indexOf("//");
            if (commentIdx !== -1)
                code = code.slice(0, commentIdx);
            code = code.trimEnd();
            if (!code.trim())
                continue; // skip blank / comment-only lines
            result.push(prefix + code);
        }
        return result.join("\n");
    }
    /** Apply all bug pattern detectors to a set of snippets */
    generateHypotheses(snippets) {
        const hypotheses = [];
        const seen = new Set();
        for (const snippet of snippets) {
            const contextLines = snippet.context.split("\n");
            for (const ctxLine of contextLines) {
                for (const detector of DETECTORS) {
                    const desc = detector.test(ctxLine, snippet.context);
                    if (!desc)
                        continue;
                    const key = `${detector.id}:${snippet.file}:${snippet.line}`;
                    if (seen.has(key))
                        continue;
                    seen.add(key);
                    hypotheses.push({
                        id: key,
                        pattern: detector.id,
                        description: desc,
                        snippet,
                        confidence: detector.confidence,
                    });
                    break; // one hypothesis per snippet line per detector is enough
                }
            }
        }
        // Sort: high confidence first
        return hypotheses.sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.confidence] - order[b.confidence];
        }).slice(0, 5);
    }
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
    extractKeywords(issue) {
        const seen = new Set();
        const valid = (w) => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w);
        const add = (words) => words.forEach(w => { if (valid(w))
            seen.add(w); });
        // 1. URL path segments — strip scheme, host, port, numeric IDs, API version segments
        const urlPattern = /https?:\/\/[^\s'"]+/g;
        for (const [rawUrl] of issue.matchAll(urlPattern)) {
            try {
                const URL_GENERIC = new Set(["api", "v1", "v2", "v3", "restaurants", "users", "auth", "admin"]);
                const segments = new URL(rawUrl).pathname
                    .split("/")
                    .filter(s => s && !/^\d+$/.test(s) && !URL_GENERIC.has(s));
                add(segments.map(s => s.toLowerCase()));
            }
            catch { /* malformed URL — fall through */ }
        }
        // 2. Quoted text (single or double quotes, not the URL itself)
        const quotedPattern = /['"]([^'"]{3,80})['"]/g;
        for (const [, text] of issue.matchAll(quotedPattern)) {
            if (/^https?:\/\//.test(text))
                continue;
            add(text.toLowerCase()
                .replace(/[^a-z0-9\s]/g, " ")
                .split(/\s+/));
        }
        // 3. General token split (fills remaining capacity, maintains insertion order)
        add(issue.toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/));
        return [...seen];
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function escapeShell(s) {
    // Remove chars that could break a shell command even inside double quotes
    return s.replace(/["`$\\!]/g, "");
}
//# sourceMappingURL=code-brief-builder.js.map