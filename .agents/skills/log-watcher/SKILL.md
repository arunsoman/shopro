---
name: log-watcher
description: Multi-agent log monitoring system that watches Shopro POS server logs, detects exceptions, errors, and warnings, performs root-cause analysis by reading source code, proposes minimal diffs as automated fixes, generates reproducible use-cases, and validates fixes. Triggers on "watch logs", "monitor logs", "analyze exception", "fix error", "fix warning", "log error fix", "debug exception", "debug warning", or when the user pastes a stack trace or error log.
---

# Log Watcher — Multi-Agent Exception Detector & Auto-Fixer

End-to-end workflow that turns runtime exceptions into validated code fixes.

## Architecture

Five agent roles execute sequentially. Each role produces a structured JSON payload that feeds the next:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ LOG-WATCHER  │────▶│   ANALYZER   │────▶│    FIXER     │
│  (detect)    │     │   (RCA)      │     │  (code fix)  │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                     │
                            ▼                     ▼
                   ┌──────────────┐     ┌──────────────┐
                   │  USE-CASE    │     │  VALIDATOR   │
                   │ (reproducer) │────▶│   (verify)   │
                   └──────────────┘     └──────────────┘
```

## Input Modes

### Mode 1 — Live Log Watch
```
"watch logs" / "monitor logs"
```
Tail the server log file, detect exceptions in real-time, and run the full pipeline.

### Mode 2 — Analyze Provided Error
```
"analyze this exception" / "fix this error" / paste a stack trace
```
Skip the watch phase. Jump straight to Analyzer with the provided error text.

---

## Phase 1 — Log Watcher (Detect)

Monitors `/home/arun/IdeaProjects/shopro-pos/shopro-res/logs/sabz-server.log` for:
- **ERROR** — exceptions, failures
- **WARN** — deprecations, config issues, API parameter problems
- **Notable INFO** — messages containing "could not", "exception", "failed", etc.

### If "watch logs" mode:

```bash
# Extract errors and warnings from the log file
bash .agents/skills/log-watcher/scripts/extract-errors.sh
```

The script outputs structured JSON with a `summary` (critical/warning/config counts) and detailed `exceptions` array. Each entry includes `level`, `category`, `error_type`, `error_message`, `service`, `context_lines`, and `stack_trace_lines`.

Then begin Phase 2 for each issue found, prioritizing `critical` > `api_issue` > `warning` > `config` > `deprecation`.

### If "analyze" mode:

The user provides the error text/stack trace directly. Use it as the `exception_payload` for Phase 2.

---

## Phase 2 — Analyzer (Root-Cause Analysis)

Read the structured exception payload and perform root-cause analysis by **reading the actual source code**.

### Steps:

1. Parse the exception: identify `error_type`, `error_message`, `service/class`, `stack_trace`.
2. Use `read` and `bash` tools to open the relevant source files mentioned in the stack trace.
3. Trace the data flow through controllers → services → repositories → entities.
4. Identify the **exact line** that causes the failure and **why**.
5. Determine **impact**: which feature, user flow, or API endpoint is broken.
6. List **possible fixes** ranked by safety and minimality.

### Output — RCA Report JSON:

```json
{
  "event_type": "rca_report",
  "timestamp": "<ISO-8601>",
  "error_type": "<exception class>",
  "root_cause": "<1-2 sentence precise explanation>",
  "impact": "<affected feature/endpoint/user flow>",
  "possible_fixes": [
    {
      "description": "<what to change>",
      "files": ["<path1>", "<path2>"],
      "safety": "safe|moderate|risky",
      "effort": "minimal|moderate|significant"
    }
  ],
  "source_evidence": {
    "file": "<path>",
    "line": <number>,
    "snippet": "<offending code>"
  },
  "stack_trace_summary": "<key frames>"
}
```

### Source Code Investigation Checklist:

- [ ] Read the class throwing the exception
- [ ] Read caller(s) in the stack trace
- [ ] Check entity mappings / JPA annotations for schema mismatches
- [ ] Check for missing `@ControllerAdvice` / `@ExceptionHandler` coverage
- [ ] Check for null-safety gaps (missing Optional, null checks)
- [ ] Check for missing bean definitions / configuration
- [ ] Check for Spring Data repository assignment issues (JPA vs Redis)

---

## Phase 3 — Fixer (Code Fix)

Based on the RCA, generate a **minimal, focused diff** using the `edit` tool.

### Rules:

1. **Minimal changes only** — fix exactly the root cause, no refactoring.
2. **Preserve existing style** — match the project's conventions (Lombok, naming, etc.).
3. **Prefer defensive programming** — null checks, Optional usage, proper exception types.
4. **For Spring Data issues** — add proper annotations, exclusions, or repository type markers.
5. **For missing beans/config** — add `@Configuration` classes or `@Bean` methods.
6. **If not safely fixable** — mark as `manual_intervention_required` with clear instructions.
7. **Always apply the fix using the `edit` tool** — never just describe it.

### Output — Proposed Fix JSON:

```json
{
  "event_type": "proposed_fix",
  "timestamp": "<ISO-8601>",
  "files_changed": [
    {
      "path": "<relative path>",
      "method": "<method name>",
      "change_type": "addition|modification|deletion",
      "description": "<what changed and why>"
    }
  ],
  "fix_notes": "<explanation of the fix>",
  "manual_intervention_required": false,
  "manual_notes": null
}
```

---

## Phase 4 — Use-Case (Reproducer)

Write a clear, step-by-step reproduction scenario that anyone can follow.

### Steps:

1. Identify the **API endpoint** or **user flow** that triggers the error.
2. Construct the **exact request** (HTTP method, path, headers, body).
3. Define **preconditions** (database state, auth tokens, etc.).
4. Specify **expected behavior** vs. **actual behavior**.

### Output — Repro Use-Case:

```markdown
### Repro: <title>

**Preconditions:**
- <required state>

**Steps:**
1. `curl -X GET http://localhost:8080/api/users/42/profile -H "Authorization: Bearer <token>"`
2. Server attempts to load user from DB

**Expected:** 404 Not Found with clear error message
**Actual:** 500 Internal Server Error — NullPointerException

**Stack Trace (key frames):**
- `UserService.loadUserProfile(UserService.java:45)`
- `UserController.getProfile(UserController.java:23)`
```

---

## Phase 5 — Validator (Verify)

### Automated Validation (if server is running):

```bash
# Run the reproduction steps
bash .agents/skills/log-watcher/scripts/validate-fix.sh <endpoint> <method> "<body>" "<expected_status>"
```

### Manual Validation Checklist:

- [ ] Fix compiles: `./gradlew :shopro-res:compileJava`
- [ ] No new errors in log after fix
- [ ] Reproduction steps produce expected behavior (not the old error)
- [ ] No regressions: existing tests still pass `./gradlew :shopro-res:test`

### Output — Validation Result:

```json
{
  "event_type": "validation_result",
  "timestamp": "<ISO-8601>",
  "status": "fix_validated|fix_needs_improvement|manual_validation_required",
  "compilation": "pass|fail",
  "tests": "pass|fail|not_run",
  "repro_result": "expected_behavior|still_broken|new_error",
  "notes": "<detailed validation notes>"
}
```

---

## Phase 6 — Report

After all phases complete, output a consolidated report:

```markdown
# 🔍 Exception Analysis Report

## Exception
**Type:** NullPointerException  
**Source:** UserService.loadUserProfile():45  
**Timestamp:** 2026-04-18T16:02:15

## Root Cause
UserService tried to call user.getProfile() when user object was null due to invalid user_id=42.

## Impact
User profile loading fails for non-existent users across all restaurants.

## Fix Applied
- Added null check in `UserService.loadUserProfile()` 
- Throws `UserNotFoundException` instead of NPE
- Files changed: `UserService.java`

## How to Reproduce
1. `GET /api/users/999/profile` (non-existent ID)
2. **Expected:** 404 Not Found
3. **Actual (before fix):** 500 NullPointerException

## Validation
- ✅ Compilation: PASS
- ⬜ Tests: NOT RUN (user should run `./gradlew :shopro-res:test`)
- ✅ Repro: Confirmed fix returns 404 instead of 500
```

---

## Quick Reference

| What | Where |
|------|-------|
| Log file | `/home/arun/IdeaProjects/shopro-pos/shopro-res/logs/sabz-server.log` |
| Source root | `/home/arun/IdeaProjects/shopro-pos/shopro-res/src/main/java/mls/sho/dms/` |
| Build command | `./gradlew :shopro-res:compileJava` (compile only) |
| Test command | `./gradlew :shopro-res:test` |
| Server restart | Use the `restart-server` skill |
| Application config | `/home/arun/IdeaProjects/shopro-pos/shopro-res/src/main/resources/application.yml` |