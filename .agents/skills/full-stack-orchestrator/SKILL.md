---
name: full-stack-orchestrator
description: >
  A complete end-to-end orchestrator that first enriches requirements (using critic → researcher → merge loop)
  until they are agent-ready (score ≥ 95), then executes the full implementation pipeline using the
  multi-agent system (DB → BE → FE → Tester → QA). Use this whenever you want a complete requirements-to-code
  workflow with automatic quality gates. This is the main entry point for building features.
---

# Full-Stack Orchestrator Skill

This skill combines two phases:
1. **Requirements Enrichment** — critic → researcher → merge loop until approved
2. **Implementation Execution** — DB → BE → FE → TESTER → QA pipeline with retry logic

---

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: REQUIREMENTS ENRICHMENT                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ INPUT: Raw requirements (user stories, epics, PRD)                     │
│                                                                         │
│ LOOP (max 5 iterations):                                                │
│   1. CRITIC   → Find gaps in requirements                              │
│   2. CHECK    → If score ≥ 95: APPROVED → proceed to Phase 2           │
│   3. RESEARCHER → Fill gaps via web search                             │
│   4. MERGE    → Inject patches into requirements doc                   │
│                                                                         │
│ OUTPUT: enriched-requirements.md                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: IMPLEMENTATION EXECUTION                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ INPUT: Enriched requirements                                           │
│                                                                         │
│ PIPELINE:                                                               │
│   1. db-developer  → Create/upgrade DB schema, migrations              │
│   2. be-developer  → Build REST APIs, services, entities               │
│   3. fe-developer  → Build React components, pages, hooks              │
│   4. tester        → Write and run unit/integration tests              │
│   5. qa            → Run QA checks, generate report                    │
│                                                                         │
│ RETRY LOOP (max 3 attempts):                                            │
│   - If QA fails: analyze failures, retry BE/FE, re-test, re-QA        │
│                                                                         │
│ OUTPUT: Completed implementation + QA report                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Instructions

### Step 0 — Initialize

Collect the input requirements. This can be:
- A requirements document path
- Raw requirement text pasted by user
- A PRD or epic description

Initialize:
```
phase = "ENRICHMENT"
iteration = 1
current_doc = <input requirements>
enriched_doc_path = null
```

Print banner:
```
╔══════════════════════════════════════════════════════════════════════╗
║                    FULL-STACK ORCHESTRATOR v1.0                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  Phase 1: Requirements Enrichment (Critic → Researcher → Merge)      ║
║  Phase 2: Implementation (DB → BE → FE → Tester → QA)               ║
╚══════════════════════════════════════════════════════════════════════╝

📥 Input: [document title or first 60 chars]
🎯 Target: Critic score ≥ 95, then full implementation
```

---

## PHASE 1: Requirements Enrichment

### 1.1 — Run the Critic

Read the critic skill: `../critic-skill/SKILL.md`
Apply it to `current_doc`.

**Expected output**: JSON with:
- `verdict`: "APPROVED" | "NEEDS_WORK"
- `score`: number (0-100)
- `gaps[]`: array of gap objects
- `approved_sections[]`: sections that passed

Print after critic runs:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 REQUIREMENTS CRITIC (Iteration {iteration})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Score: {score}/100
🚦 Verdict: {verdict}

Gate Results:
  ✓ Story Structure: {PASS/FAIL}
  ✓ State Machine: {PASS/FAIL}
  ✓ Data Foundation: {PASS/FAIL}
  ✓ Role Registry: {PASS/FAIL}
  ✓ Actor → Story Trace: {PASS/FAIL}
  ✓ Permission Matrix: {PASS/FAIL}
  ✓ AC Quality: {PASS/FAIL}
  ✓ UI Entry Point: {PASS/FAIL}
  ✓ Tech Stack: {PASS/FAIL}
  ✓ Completeness: {PASS/FAIL}

🔍 Gaps Found: {count}
  [{severity}] {gap_id}: {title}
```

### 1.2 — Check Exit Condition

```
if verdict == "APPROVED" OR score >= 95:
    print "✅ Requirements APPROVED (score: {score}/100)"
    GOTO Step 1.5 (Save enriched doc, proceed to Phase 2)

if iteration >= 5:
    print "⚠️ Max iterations reached. Proceeding with current score: {score}/100"
    print "Remaining gaps will be noted but implementation will proceed"
    GOTO Step 1.5

if gaps.length == 0:
    print "✅ No gaps found, proceeding to implementation"
    GOTO Step 1.5
```

### 1.3 — Run the Researcher

Read the researcher skill: `../researcher-skill/SKILL.md`
Pass the full gap JSON from the critic.

The researcher will return patches with:
- `gap_id`: matching the critic's gap
- `resolution`: the researched solution
- `source`: URL or standard reference
- `spec_fragment`: the exact text to insert

Print:
```
🔎 RESEARCHER — Resolving {gap_count} gaps...
  ✓ GAP-001: {resolution_summary}
  ✓ GAP-002: {resolution_summary}
  ...
```

### 1.4 — Merge Patches

For each patch, find the insertion point by category:

| Category | Insert After Section |
|---|---|
| SPATIAL | "## Layout Specifications" |
| TEMPORAL | "## Sync & Performance" |
| DATA_SCHEMA | "## Data Schema" |
| API_CONTRACT | "## API Contract" |
| SECURITY | "## Security & Permissions" |
| COMPONENT_SPEC | "## Component Mapping" |
| PERFORMANCE | "## Performance Budgets" |
| STATE_MACHINE | "## State Machine" |
| NAVIGATION | "## Navigation & Routing" |
| EDGE_CASES | "## Edge Cases" |

Insert format:
```markdown
### [{gap title}] ← resolved in iteration {N}
> **Source:** {source}
> **Rationale:** {rationale}

{spec_fragment}
```

Add to **Resolved Gaps Log** at document bottom:
```markdown
---
## Resolved Gaps Log
| Gap ID | Iteration | Category | Resolution |
|---|---|---|---|
| GAP-001 | 1 | SPATIAL | 4-col grid, 160px cards |
```

Set `current_doc` = merged document
Increment `iteration`
GOTO Step 1.1

### 1.5 — Save Enriched Requirements

Write `current_doc` to:
```
{project_root}/outputs/enriched-requirements.md
```

Print:
```
💾 Saved: outputs/enriched-requirements.md
```

---

## PHASE 2: Implementation Execution

### 2.1 — Transition to Implementation

Print banner:
```
╔══════════════════════════════════════════════════════════════════════╗
║                    PHASE 2: IMPLEMENTATION                           ║
╠══════════════════════════════════════════════════════════════════════╣
║  Pipeline: DB → BE → FE → TESTER → QA                                ║
║  Max Retries: 3 attempts                                             ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 2.2 — Initialize Implementation State

Create implementation state file at `{project_root}/state/implementation-state.json`:

```json
{
  "taskId": "<uuid>",
  "requirementsSource": "outputs/enriched-requirements.md",
  "status": "DB_PENDING",
  "attempt": 1,
  "maxRetries": 3,
  "agentOutputs": {
    "db-developer": { "status": "PENDING", "filesCreated": [], "filesModified": [] },
    "be-developer": { "status": "PENDING", "filesCreated": [], "filesModified": [] },
    "fe-developer": { "status": "PENDING", "filesCreated": [], "filesModified": [] },
    "tester": { "status": "PENDING", "filesCreated": [], "filesModified": [] },
    "qa": { "status": "PENDING", "reportPath": null }
  },
  "startedAt": "<iso timestamp>",
  "updatedAt": "<iso timestamp>"
}
```

### 2.3 — Run DB Developer

Print:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗄️  PHASE 2.3: Database Developer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Update status: `DB_PENDING` → `DB_RUNNING`

Read the enriched requirements and create:
- JPA entities in `shopro-res/src/main/java/mls/sho/dms/entity/`
- Flyway migrations in `shopro-res/src/main/resources/db/migration/`
- PostgreSQL optimization (indexes, partitions, JSONB fields)

Execute using the multi-agent tools or direct code generation.

After completion:
- Update status to `DB_DONE`
- Record files created/modified in state
- Print summary: `✓ DB phase complete: {n} files created, {m} modified`

### 2.4 — Run BE Developer

Print:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  PHASE 2.4: Backend Developer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Update status: `BE_PENDING` → `BE_RUNNING`

Create:
- REST controllers
- Service layer
- DTOs
- Exception handlers
- Integration with DB entities

Execute and update state on completion:
- Status → `BE_DONE`
- Record files
- Print summary

### 2.5 — Run FE Developer

Print:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨  PHASE 2.5: Frontend Developer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Update status: `FE_PENDING` → `FE_RUNNING`

Create:
- React components
- Pages
- API hooks
- State management
- Styling with Tailwind

Execute and update:
- Status → `FE_DONE`
- Record files

### 2.6 — Run Tester

Print:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪  PHASE 2.6: Tester
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Update status: `TEST_PENDING` → `TEST_RUNNING`

Write and run:
- Unit tests for BE (JUnit)
- Integration tests for FE (Vitest/Playwright)
- API contract tests

Execute tests and record results:
- Status → `TEST_DONE`
- Record test results in state

### 2.7 — Run QA Agent

Print:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍  PHASE 2.7: QA Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Update status: `QA_PENDING` → `QA_RUNNING`

Run comprehensive QA checks:
- Code quality analysis
- Security scanning
- API contract validation
- Integration test verification
- Coverage analysis

Generate QA report at `reports/qa-report-{timestamp}.json`:

```json
{
  "taskId": "<uuid>",
  "attempt": <n>,
  "executedAt": "<iso>",
  "status": "PASS|FAIL",
  "summary": {
    "totalTests": <n>,
    "passed": <n>,
    "failed": <n>,
    "skipped": <n>,
    "coveragePercent": <n>
  },
  "failures": [
    {
      "testName": "<name>",
      "layer": "frontend|backend",
      "file": "<path>",
      "errorMessage": "<msg>",
      "stackTrace": "<trace>",
      "affectedFile": "<path>"
    }
  ]
}
```

### 2.8 — Check QA Result

```
if qa_report.status == "PASS":
    print "╔═══════════════════════════════════════════════════════════╗"
    print "║              ✅ IMPLEMENTATION COMPLETE                    ║"
    print "╚═══════════════════════════════════════════════════════════╝"
    GOTO Step 3 (Final Report)

if qa_report.status == "FAIL":
    print "⚠️ QA failed, analyzing failures..."
    GOTO Step 2.9 (Retry Loop)
```

### 2.9 — Retry Loop

If QA failed, analyze which layer(s) need fixing:

```
backend_failures = qa_report.failures.filter(f => f.layer === "backend")
frontend_failures = qa_report.failures.filter(f => f.layer === "frontend")

if attempt >= maxRetries:
    print "❌ Max retries ({maxRetries}) exceeded"
    GOTO Step 3 (Final Report with failures)

print "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print "🔄 RETRY Attempt {attempt}/{maxRetries}"
print "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if backend_failures.length > 0:
    print "🔧 Fixing {n} backend failures..."
    Update status: RETRY_BE
    Run BE Developer with retry context (failure details)
    Update status: BE_DONE

if frontend_failures.length > 0:
    print "🎨 Fixing {n} frontend failures..."
    Update status: RETRY_FE
    Run FE Developer with retry context
    Update status: FE_DONE

# Re-run tests
print "🧪 Re-running tests..."
Update status: TEST_PENDING
Run Tester
Update status: TEST_DONE

# Re-run QA
print "🔍 Re-running QA..."
Update status: QA_PENDING
Run QA Agent

Increment attempt
GOTO Step 2.8 (Check QA Result)
```

---

## Step 3 — Final Report

Print comprehensive summary:

```
╔══════════════════════════════════════════════════════════════════════╗
║                    EXECUTION COMPLETE                                 ║
╠══════════════════════════════════════════════════════════════════════╣
║  Requirements Score: {score}/100                                      ║
║  Enrichment Iterations: {n}                                          ║
║  Implementation Attempts: {n}                                        ║
║  Final QA Status: {PASS/FAIL}                                        ║
╠══════════════════════════════════════════════════════════════════════╣
║  FILES CREATED:                                                       ║
║    DB:   {n} files                                                    ║
║    BE:   {n} files                                                    ║
║    FE:   {n} files                                                    ║
║    Test: {n} files                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║  OUTPUTS:                                                            ║
║    • requirements-enriched.md                                         ║
║    • implementation-state.json                                        ║
║    • qa-report-{timestamp}.json                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

If QA failed, list remaining failures:
```
REMAINING FAILURES:
  1. {test_name} - {error_message}
  2. ...
```

---

## Important Notes

1. **Do not skip Phase 1** — even if requirements look good, run the critic to ensure score ≥ 95
2. **Retry logic is critical** — QA failures should trigger targeted retries, not full re-runs
3. **Record everything** — every file change, test result, and QA finding must be in the state
4. **Keep phases separate** — complete enrichment before starting implementation
5. **User communication** — print progress at every major step so the user knows what's happening

---

## Skill File Locations

When running, read sub-skill files from:
- Critic: `../critic-skill/SKILL.md`
- Researcher: `../researcher-skill/SKILL.md`
- Multi-agent orchestrator reference: `{project_root}/src/multi-agent/orchestrator.ts`
