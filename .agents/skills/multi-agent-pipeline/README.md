# Multi-Agent Requirements-to-Code Pipeline

A complete multi-agent system that transforms raw requirements into verified, compiled code through a structured pipeline with quality gates.

---

## Quick Start

```bash
# Invoke the pipeline
/run multi-agent-pipeline

# Then paste your requirements
```

Or:

```
Build this feature using the multi-agent pipeline:

<your requirements here>
```

---

## Pipeline Overview

```
┌─────────────┐
│   RESEARCH  │ ──→ Gap analysis, competitive research, enrichment
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   CRITIC    │ ──→ Ambiguity removal, quality gate
└──────┬──────┘
       │
       │ (Loop: max 3 iterations)
       │
       ▼
┌─────────────┐
│   APPROVED  │
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       ▼                 ▼                 │
┌─────────────┐   ┌─────────────┐         │
│  DEVELOPER  │   │   TESTER    │         │
│             │   │             │         │
│ → Chunking  │   │ → Test Plan │         │
│ → Build     │   │             │         │
└──────┬──────┘   └──────┬──────┘         │
       │                 │                 │
       └────────┬────────┘                 │
                │                          │
                ▼                          │
         ┌─────────────┐                   │
         │  VALIDATOR  │                   │
         │             │                   │
         │ → Test      │                   │
         │ → Report    │───────────────────┘
         └──────┬──────┘
                │
                │ (Has defects?)
                ▼
         ┌─────────────┐
         │   DEFECT    │ ──→ Fix loop (max 3 rounds)
         │   RESOLUTION│
         └─────────────┘
```

---

## Agent Roster

| Agent | Stage | Role | Model Type |
|-------|-------|------|------------|
| **Researcher** | 1 | Gap analysis, competitive research, enrichment | High-reasoning |
| **Critic** | 2 | Ambiguity removal, quality gate | High-precision |
| **Developer** | 3A | Chunk decomposition, build coordination | Architecture-focused |
| **SW-Dev-Agent** | 3A-2 | Implementation, compilation | Code-specialized |
| **Tester** | 3B | Test plan generation | QA-focused |
| **Validator** | 3C | Test execution, defect reporting | Detail-oriented |

---

## Stage Details

### Stage 1: Research & Enrichment

**Input:** Raw requirements  
**Output:** Enriched requirements + Gap analysis

**Process:**
1. Deep research on each topic
2. Competitive analysis
3. Gap identification (🔴🟠🟡🟢 criticality)
4. Merge critical gaps into requirements

**Exit Criteria:**
- ✅ All sections marked enriched
- ✅ No 🔴 or 🟠 gaps left unmerged

---

### Stage 2: Critique & Ambiguity Removal

**Input:** Enriched requirements  
**Output:** Critique report + Verdict (APPROVED/REJECTED)

**Process:**
1. Ambiguity audit (7 patterns)
2. Issue severity rating (CRITICAL/MAJOR/MINOR)
3. Verdict based on issue counts

**Exit Criteria:**
- ✅ APPROVED: 0 CRITICAL, ≤2 MAJOR
- ❌ REJECTED: Any CRITICAL or >2 MAJOR

**Loop Guard:** Max 3 Research↔Critic iterations

---

### Stage 3A: Developer (Chunking + Build)

**Input:** Approved requirements  
**Output:** Built codebase + Chunk manifest

**Process:**
1. Decompose into standalone chunks
2. Build loop (per chunk, in dependency order)
3. Compilation gate (max 3 retries per chunk)

**Chunk Contract:**
- Atomic
- Self-contained
- Verifiable
- Ordered

---

### Stage 3B: Tester (Parallel with Developer)

**Input:** Approved requirements  
**Output:** Test Plan Document

**Process:**
1. Analyze requirements
2. Create test scenarios (5 categories)
3. Map tests to acceptance criteria

**Test Categories:**
- Happy Path
- Edge Cases
- Error Scenarios
- Integration Tests
- Non-Functional Tests

---

### Stage 3C: Validator

**Activation:** After Developer AND Tester complete  
**Output:** Validation Report

**Process:**
1. Generate executable test cases
2. Execute tests
3. Record results (PASS/FAIL/BLOCKED)
4. Analyze failures

**Verdict:**
- **VALIDATED:** All tests pass
- **HAS_DEFECTS:** Any FAIL or BLOCKED

---

### Stage 3D: Defect Resolution

**Trigger:** Validation report has FAIL/BLOCKED  
**Output:** Fixed codebase or Known Issues list

**Process:**
1. Developer triages (TRUE_DEFECT vs TEST_ISSUE)
2. Create defect context packets
3. SW-Dev-Agent fixes
4. Re-compile + Re-validate

**Loop Guard:** Max 3 resolution rounds

---

## Quality Gates

| Gate | Condition | Action on Fail |
|------|-----------|----------------|
| Research Exit | All sections enriched | Cannot proceed to Critic |
| Critique Verdict | 0 CRITICAL, ≤2 MAJOR | Return to Researcher |
| Compilation | Zero build errors | Retry (max 3) → Escalate |
| Validation | All tests pass | Defect resolution (max 3 rounds) |

---

## Loop Guards

| Loop | Max Iterations | On Exhaustion |
|------|----------------|---------------|
| Research↔Critic | 3 | Force-approve with binding assumptions |
| Compilation Retry | 3 per chunk | Escalate to user |
| Defect Resolution | 3 rounds | Document as known issues |

---

## Deliverables

When the pipeline completes, you receive:

1. **Built Codebase** — All chunks compiled and verified
2. **Enriched Requirement Document** — Final approved version
3. **Gap Analysis Appendix** — All gaps with criticality
4. **Chunk Manifest** — All chunks with build status
5. **Test Plan** — Full test strategy
6. **Validation Report** — Pass/fail summary
7. **Pipeline Audit Log** — Iteration counts, decisions

---

## Model Assignment Strategy (Cloud-First)

**All models run on Ollama Cloud** — no local GPU/CPU required!

| Agent | Cloud Model | Parameters | Why |
|-------|-------------|------------|-----|
| Researcher | `qwen3.5:27b` | 27B | Best for skill workflows, BFCL-V4 72.2 |
| Critic | `llama3.3:70b` | 70B | Most precise, zero hallucination |
| Developer | `qwen3-coder-plus:72b` | 72B | Most powerful for architecture |
| SW-Dev-Agent | `qwen2.5-coder:32b` | 32B | Matches GPT-4o on code generation |
| Tester | `qwen3.5:27b` | 27B | Best for test strategy |
| Validator | `deepseek-r1:671b` | 671B | Ultimate reasoning with thinking tokens |

### Benefits of Cloud Models

| Benefit | Description |
|---------|-------------|
| **No Hardware Required** | Works on any machine with internet |
| **No Downloads** | Instant access to 671B models |
| **Always Latest** | Automatic model updates |
| **Full Quality** | Run largest models without RAM constraints |

### Setup (5 minutes)

```bash
# 1. Install Ollama (if not installed)
curl -fsSL https://ollama.com/install.sh | sh

# 2. Login to Ollama Cloud
ollama login

# 3. Run the setup script
bash .agents/skills/multi-agent-pipeline/setup-ollama.sh

# 4. Start the pipeline
/run multi-agent-pipeline
```

### Requirements

- Ollama installed
- Ollama Cloud account (free at ollama.com)
- Internet connection
- **No GPU/CPU requirements** — all inference runs in the cloud!

---

## Example Session

```
User: Build a restaurant POS login system using the multi-agent pipeline

🚀 Multi-Agent Pipeline Initialized

Model Assignments:
- Researcher: claude-sonnet-4-5-20250929
- Critic: claude-sonnet-4-5-20250929
- Developer: claude-sonnet-4-5-20250929
- SW-Dev-Agent: claude-sonnet-4-5-20250929
- Tester: claude-sonnet-4-5-20250929
- Validator: claude-sonnet-4-5-20250929

Pipeline State: INIT → RESEARCH

---

🔬 Researcher Agent Active

Processing 4 topics...
✅ Research Complete

Deliverables:
- Enriched Requirements (4 sections)
- Gap Analysis (2 🔴, 3 🟠, 5 🟡, 4 🟢)
- Research Sources (12 citations)

Passing to Critic Agent...

---

🔍 Critic Agent Active

Auditing 23 requirement statements...

=== CRITIQUE REPORT ===

Verdict: ❌ REJECTED

Summary:
- CRITICAL: 2
- MAJOR: 4
- MINOR: 3

[Issue details with resolutions]

Returning to Researcher (Iteration 1 of 3)...

---

[... Researcher addresses issues, resubmits ...]

---

🔍 Critic Agent Active (Re-submission)

Verdict: ✅ APPROVED

Summary:
- CRITICAL: 0
- MAJOR: 1
- MINOR: 2

Forwarding to Developer, Tester, Validator...

---

👨‍💻 Developer Agent Active

Chunk Manifest Created:
| ID | Title | Dependencies | Complexity |
|----|-------|--------------|------------|
| C01 | DB Schema | [] | S |
| C02 | Auth API | [C01] | M |
| C03 | Login UI | [C02] | M |
| C04 | Session Mgmt | [C02] | L |

Beginning build loop...

[... Build progress per chunk ...]

✅ Build Complete

---

🧪 Tester Agent Active (parallel)

✅ Test Plan Complete

Summary:
- Total Test Scenarios: 47
  - Happy Path: 12
  - Edge Cases: 15
  - Error Scenarios: 10
  - Integration: 7
  - Non-Functional: 3

---

✅ Validator Agent Active

Running 47 tests...

=== VALIDATION REPORT ===

Overall Verdict: HAS_DEFECTS

Summary:
- Total Tests: 47
- PASS: 44 (93.6%)
- FAIL: 3 (6.4%)
- BLOCKED: 0

[Failure details]

Sending to Developer for triage...

---

[... Defect resolution loop ...]

---

✅ Multi-Agent Pipeline Complete

=== DELIVERABLES ===

1. Built Codebase: src/auth/ (4 chunks, all compiled)
2. Enriched Requirements: 4 sections, 5 gaps merged
3. Gap Analysis: 2 🔴, 3 🟠, 5 🟡, 4 🟢
4. Chunk Manifest: 4 chunks, all BUILT
5. Test Plan: 47 test scenarios
6. Validation Report: 47 passed, 0 failed
7. Audit Log: 2 Research↔Critic iterations, 1 defect round

=== PIPELINE METRICS ===

- Research↔Critic iterations: 2/3
- Compilation retries: {C01: 0, C02: 1, C03: 0, C04: 0}
- Defect resolution rounds: 1/3
- Overall status: VALIDATED
```

---

## Files Structure

```
.agents/skills/multi-agent-pipeline/
├── SKILL.md              # Main orchestrator skill
├── README.md             # This file
└── agents/
    ├── researcher/
    │   └── SKILL.md      # Researcher agent
    ├── critic/
    │   └── SKILL.md      # Critic agent
    ├── developer/
    │   └── SKILL.md      # Developer agent
    ├── sw-dev-agent/
    │   └── SKILL.md      # Software development agent
    ├── tester/
    │   └── SKILL.md      # Tester agent
    └── validator/
        └── SKILL.md      # Validator agent
```

---

## Best Practices

### For Users

1. **Provide detailed requirements** — The better your input, the better the output
2. **Review gap analysis** — Ensure criticality ratings match your priorities
3. **Monitor critique iterations** — If hitting iteration 3, consider simplifying scope
4. **Review defect context** — Ensure defect packets are accurate before SW-Dev-Agent fixes

### For Agents

1. **Enforce gates strictly** — Never skip a quality gate
2. **Document assumptions** — Any unresolved issue becomes a binding assumption
3. **Track iterations** — Always count and report loop iterations
4. **Self-contained packets** — Defect context must need no external info

---

## Troubleshooting

| Issue | Cause | Resolution |
|-------|-------|------------|
| Stuck in Research↔Critic loop | Vague requirements | User provides more specific input |
| Compilation fails 3x | Complex chunk or missing dependency | Developer splits chunk or provides missing code |
| Defect resolution fails 3x | Fundamental design flaw | Document as known issue, proceed |
| Validator blocked tests | Test environment misconfiguration | Fix test setup, re-run validator |

---

## Extending the Pipeline

To add new agents or stages:

1. Create a new `agents/<agent-name>/SKILL.md`
2. Define the agent's role, input, process, output
3. Update the main `SKILL.md` orchestrator
4. Add the agent to the roster table

---

## License

Part of the Shopro POS multi-agent system.
