---
name: requirements-orchestrator
description: >
  Runs an automated critic → researcher → merge loop on a requirements document
  (Epics and User Stories) until the critic approves it as fully deterministic
  and agent-ready. Use this skill whenever someone wants to make their product
  requirements, user stories, PRD, or epics "agent-ready", "deterministic", or
  "gap-free". Also use when someone says their requirements need spatial, temporal,
  data, or security specs added automatically. Orchestrates three sub-skills:
  requirements-critic (finds gaps), requirements-researcher (fills gaps via web
  search), and itself as merger (injects resolved specs back into the document).
  Loops until critic score is 95 or above, or max 5 iterations. Outputs the final enriched
  requirements document as a markdown file.
---

# Requirements Orchestrator Skill

## Role
You are a **meta-agent orchestrator**. You drive a loop between the critic skill
and the researcher skill until the requirements document is fully deterministic.
You also act as the **merger** — injecting researcher patches back into the
document between iterations.

## The Loop (Critical — follow exactly)

```
INPUT: requirements document (text)

LOOP (max 5 iterations):
  1. CRITIC   → read requirements-critic/SKILL.md, apply it, emit gap JSON
  2. CHECK    → if verdict == "APPROVED" or iteration >= 5: BREAK
  3. RESEARCHER → read requirements-researcher/SKILL.md, apply it to gap JSON, emit patch JSON
  4. MERGE    → inject patches into requirements document (see Merge Protocol)
  5. INCREMENT iteration, LOOP

OUTPUT: final enriched requirements document as markdown
```

## Step-by-Step Instructions

### Step 0 — Initialize
```
iteration = 1
current_doc = <input requirements text>
```

Print to user:
```
🔄 Starting requirements enrichment loop...
📄 Input: [document title or first 60 chars]
🎯 Target: critic score ≥ 95 (APPROVED verdict)
```

### Step 1 — Run the Critic
Read `/mnt/skills/.../critic-skill/SKILL.md` (or whichever path is available).
Apply the critic instructions to `current_doc`.
Pass `iteration` number so the critic knows which gaps to re-check.

**Expect output**: JSON with `verdict`, `score`, `gate_report{}`, `gaps[]`, `approved_sections[]`

Print to user after each critic run:
```
📊 Iteration [N] — Critic Score: [score]/100
🚦 Gate Report:
   GATE 1   Story Structure          [PASS/FAIL]
   GATE 2   State Machine            [PASS/FAIL]
   GATE 3   Data Foundation          [PASS/FAIL]
   GATE 4a  Role Registry            [PASS/FAIL]
   GATE 4b  Actor → Story Trace      [PASS/FAIL]
   GATE 4c  Actor → Transition Map   [PASS/FAIL]
   GATE 4d  Permission Matrix        [PASS/FAIL]
   GATE 5   AC Quality               [PASS/FAIL]
   GATE 5b  UI Entry Point & Journey [PASS/FAIL]
   GATE 6   Tech Stack               [PASS/FAIL]
   GATE 7   Completeness             [PASS/FAIL]
   GATE 8   Notifications            [PASS/FAIL/N/A]
🔍 Gaps found: [count] ([CRITICAL count] critical, [HIGH count] high, [MEDIUM count] medium)
```

### Step 2 — Check Exit Condition
```
if verdict == "APPROVED":
    print "✅ APPROVED at iteration [N] with score [score]/100"
    GOTO Step 5 (Output)

if iteration >= 5:
    print "⚠️ Max iterations reached. Current score: [score]/100. Remaining gaps:"
    print <list remaining gap titles>
    GOTO Step 5 (Output)
```

### Step 3 — Run the Researcher
Read the researcher skill instructions.
Pass the full gap JSON from the critic (all gaps from this iteration only).

The researcher will:
- Perform web searches for each `research_question`
- Return a `patches` array with `gap_id`, `resolution`, `source`, `spec_fragment`

Print to user:
```
🔎 Researching [N] gaps...
  ✓ GAP-001: [short resolution summary]
  ✓ GAP-002: [short resolution summary]
  ...
```

### Step 4 — Merge Patches into Document

#### Merge Protocol
For each patch in the researcher's output:

1. **Find the insertion point** using the gap's `category`:

| Category | Insert After Section |
|---|---|
| SPATIAL | "## Layout Specifications" (create if missing) |
| TEMPORAL | "## Sync & Performance" (create if missing) |
| DATA_SCHEMA | "## Data Schema" (create if missing) |
| API_CONTRACT | "## API Contract" (create if missing) |
| SECURITY | "## Security & Permissions" (create if missing) |
| COMPONENT_SPEC | "## Component Mapping" (create if missing) |
| PERFORMANCE | "## Performance Budgets" (create if missing) |
| ACCESSIBILITY | "## Accessibility" (create if missing) |
| ERROR_HANDLING | "## Error Handling" (create if missing) |
| STATE_MACHINE | "## State Machine" (create if missing) |
| NAVIGATION | "## Navigation & Routing" (create if missing) |
| EDGE_CASES | "## Edge Cases" (create if missing) |

2. **Format the insertion** as:
```markdown
### [gap title] ← resolved in iteration [N]
> **Source:** [source URL or standard]
> **Rationale:** [rationale]

[spec_fragment verbatim]
```

3. **Append a Resolved Gaps log** at the bottom of the document:
```markdown
---
## Resolved Gaps Log
| Gap ID | Iteration | Category | Resolution Summary |
|---|---|---|---|
| GAP-001 | 1 | SPATIAL | 4-col grid, 160px cards on desktop |
```

4. Set `current_doc` = merged document
5. Increment `iteration`
6. GOTO Step 1

### Step 5 — Output the Final Document

Write the final `current_doc` as:
- A markdown file: `/mnt/user-data/outputs/requirements-enriched.md`

Print final summary to user:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Requirements Enrichment Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total iterations : [N]
Final score      : [score]/100
Gaps resolved    : [count]
Gaps remaining   : [count] (if any)
Output file      : requirements-enriched.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Merge Quality Rules
- **Never delete** original user story text. Only ADD new sections.
- **Never invent values** — only insert what the researcher provided with a source.
- **Preserve original formatting** — add new sections between existing ones, don't rewrite.
- **Label every addition** with `← resolved in iteration [N]` so it's auditable.
- If two patches address the same section, merge them into one coherent block.

## Handling Researcher Failures
If the researcher cannot find a source for a gap:
- Insert a `⚠️ UNRESOLVED` marker in the document at the relevant section
- Keep the gap in the next iteration's critic input
- Do not increment the score for that gap

## Loop Termination Rules
| Condition | Action |
|---|---|
| `verdict == "APPROVED"` | Stop, output final doc |
| `score >= 95` | Stop, output final doc |
| `iteration == 5` | Stop, output with warning about remaining gaps |
| `gaps` array is empty | Stop, output final doc |
| Researcher returns 0 patches | Stop with error "Researcher could not resolve any gaps" |

## Skill File Locations
When running as part of the skill system, read skill files from:
- Critic: look for `requirements-critic` in available_skills
- Researcher: look for `requirements-researcher` in available_skills

If running standalone (skills not in available_skills list), the SKILL.md files
for critic and researcher are bundled alongside this one at:
- `../critic-skill/SKILL.md`
- `../researcher-skill/SKILL.md`

Read them using the `view` tool before executing each step.

## User Communication Style
- Print loop progress at each step (users find the loop opaque otherwise)
- Show gap IDs and titles as they are resolved
- If a CRITICAL gap is found, highlight it: "🚨 CRITICAL: [title]"
- Keep it scannable — use emoji markers and short lines