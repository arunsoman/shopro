---
name: user-stories-reviewer
description: Reviews, audits, and improves user stories for the Shopro Restaurant POS system. Checks for ambiguity, missing acceptance criteria, role clarity, testability, cross-module dependencies, and story-splitting opportunities — producing a structured review report and optionally rewriting deficient stories.
---

# Shopro POS — User Stories Reviewer Skill

## Purpose

This skill enables a deep, structured review of user stories (US) written for the **Shopro Restaurant POS** system. It evaluates stories against industry best practices (INVEST criteria, Gherkin-readability, Acceptance Criteria completeness) while also applying **Shopro-specific domain knowledge** about the system's modules, user roles, and cross-module dependencies.

Use this skill when:
- A new user story is drafted and needs a quality gate before development begins.
- A full requirements document (e.g., `KDS_REQUIREMENTS.md`) is ready for review.
- Ambiguity reports are needed before sprint planning.
- You want to rewrite or improve an existing set of stories.

---

## Shopro POS Domain Context

### Modules and Their Requirement Files

| Module | File |
|---|---|
| Core Menu & Order Management | `CORE_ORDER_MANAGEMENT_REQUIREMENTS.md` |
| Kitchen Display System (KDS) | `KDS_REQUIREMENTS.md` |
| Dynamic Floor Plan & Reservations | `FLOOR_PLAN_REQUIREMENTS.md` |
| Contactless Tableside Ordering | `TABLESIDE_ORDERING_REQUIREMENTS.md` |
| Ingredient-Level Inventory Tracking | `INVENTORY_REQUIREMENTS.md` |
| AI-Powered Sales Analytics | `ANALYTICS_REQUIREMENTS.md` |
| Menu Item Management | `MENU_MANAGEMENT_REQUIREMENTS.md` |
| Auth & Sessions | `AUTH_AND_SETTINGS_REQUIREMENTS.md` |
| End-of-Day Close | `EOD_REQUIREMENTS.md` |

### Canonical User Roles

Always validate that a story uses ONE of these recognized roles. Using an undefined role is a defect.

| Role | Module(s) |
|---|---|
| **Server/Cashier** | Core Order, Tableside |
| **Manager** | All modules (elevated permissions) |
| **Kitchen Staff / Line Cook** | KDS |
| **Expeditor (Expo)** | KDS |
| **Host/Hostess** | Floor Plan, Reservations |
| **Busser** | Floor Plan |
| **Chef** | Inventory |
| **Owner/General Manager** | Analytics |
| **Guest** | Tableside Mobile Ordering |
| **System (Automated / AI Engine)** | Inventory auto-depletion, Analytics AI |

### Known Cross-Module Dependencies

These are established data or workflow dependencies that reviewers MUST check when a story touches a boundary:

1. **KDS ↔ Core Order** — `US-4.1` (Core Order): "Send" triggers ticket creation on KDS. KDS stories must not assume a separate trigger.
2. **Inventory ↔ Core Order / KDS** — `US-1.3` (Inventory): Ingredient depletion fires the moment a POS ticket is sent to KDS, not at checkout. Void handling pre/post prep must be considered.
3. **Analytics ↔ Inventory** — `US-1.3` (Analytics): "Total Margin" profitability is calculated as `Selling Price − Food Cost` derived from Inventory. Analytics stories that reference profitability MUST acknowledge this dependency.
4. **Tableside ↔ KDS** — `US-2.3` (Tableside): Guest-submitted orders route to KDS stations directly; they must not bypass the station-routing rules configured in `US-1.2` (KDS).
5. **Floor Plan ↔ Core Order** — Table status (Blue/Yellow/Red/Green) is driven by order ticket events. Stories that change order state must also define the resulting floor plan color-state change.
6. **Floor Plan ↔ Tableside** — `US-2.3` (Tableside): Guest-submitted order must set the main POS table to Blue/Occupied on the Floor Plan.

---

## Review Protocol

When asked to review user stories, follow this exact protocol.

### Step 1 — Load Source Documents

Read the relevant requirements file(s) from the project root:
```
/home/arun/IdeaProjects/shopro-pos/<MODULE>_REQUIREMENTS.md
```

If the user provides raw story text inline, use that instead.

### Step 2 — Run the 8-Point Checklist on Every Story

For each individual User Story (identified by its ID, e.g., `US-2.1`), evaluate all 8 checks below. Record PASS / FAIL / WARNING for each.

#### Check 1: Role Validity
- Is the role **As a [Role]** a recognized Shopro role from the canonical list?
- FAIL if undefined or vague (e.g., "As a user", "As an admin").

#### Check 2: Goal Clarity (INVEST — Independent & Valuable)
- Does the **I want to** statement describe a SINGLE, atomic user action?
- FAIL if the story contains "and" which combines two distinct actions that could be separate stories.
- FAIL if the goal is a technical implementation rather than a user goal (e.g., "I want to call the REST endpoint").

#### Check 3: Business Value Clarity
- Does the **so that** clause express a clear, user-centric benefit?
- FAIL if it is circular (e.g., "so that I can do the thing I just described").
- WARNING if the benefit is vague without context (e.g., "so that it is easier").

#### Check 4: Acceptance Criteria (AC) — Completeness
Acceptance Criteria must cover ALL of:
- [ ] The **Happy Path** (the primary success scenario).
- [ ] At least one **Edge Case** (boundary conditions, limits).
- [ ] At least one **Failure/Error Scenario** (what happens when it goes wrong).
- WARNING if edge cases or failure scenarios are absent.
- FAIL if no AC is defined at all.

#### Check 5: Acceptance Criteria (AC) — Testability
Each AC must be deterministic and testable by a QA engineer. It must NOT use subjective language.

| Forbidden Vague Word | Required Replacement |
|---|---|
| "quickly" | Specific time limit (e.g., "within 500ms") |
| "instantly" | Specific time limit (e.g., "within 1 second") |
| "easily" | Describe the specific interaction mechanism |
| "should" | "must" |
| "appropriate" | Define the specific value/state |
| "nice-looking" | Define specific visual property |

FAIL if any vague term is found in AC without quantification.

#### Check 6: Visual / UI State Specification
- For any story that changes the state of the UI (table colors, item states, form validations), are the **exact visual states or transitions** defined?
- Refer to the canonical color map for Floor Plan: Green=Available, Blue=Occupied, Yellow=Unpaid, Red=Dirty.
- FAIL if a UI state change is described as "displays a confirmation" without specifying WHAT the confirmation contains.

#### Check 7: Cross-Module Dependency Check
- Does this story touch a known cross-module boundary (per the dependency table above)?
- WARNING if it does but the AC does not describe the expected side-effect in the other module.
- Example: A Core Order "Send" story that doesn't specify KDS behavior is a WARNING.

#### Check 8: Security & Permission Gating
- Does the story involve a sensitive action (discounts, voids, layout editing, purchase orders)?
- Check: Is a **Manager PIN** or **role permission** requirement stated in the AC?
- FAIL if a privileged action has no permission gate defined.
- Known privileged actions in Shopro POS:
  - Applying discounts (any amount) → Manager PIN
  - Voiding items after KDS send → Manager PIN
  - Editing floor plan layout → Manager PIN
  - Generating or finalizing Purchase Orders → Manager/Chef role
  - Adjusting inventory counts manually → Manager role + Reason Code

---

### Step 3 — Produce the Review Report

Output the review in the following structured markdown format. Always output the full report, even if all stories pass.

```markdown
# User Story Review Report
**Module:** [Module Name]
**File Reviewed:** [Filename]
**Review Date:** [Date]
**Reviewer:** Antigravity (AI Agent)
**Total Stories Reviewed:** [N]

---

## Executive Summary

| Status | Count |
|---|---|
| ✅ PASS (no issues) | [N] |
| ⚠️ WARNING (minor issues) | [N] |
| ❌ FAIL (blocking issues) | [N] |

**Overall Verdict:** [APPROVED / APPROVED WITH WARNINGS / BLOCKED - REQUIRES REVISION]

---

## Story-by-Story Review

### [US-X.Y]: [Story Title / First 60 chars of story]

| Check | Status | Finding |
|---|---|---|
| 1. Role Validity | ✅ / ⚠️ / ❌ | [Detail] |
| 2. Goal Clarity | ✅ / ⚠️ / ❌ | [Detail] |
| 3. Business Value | ✅ / ⚠️ / ❌ | [Detail] |
| 4. AC Completeness | ✅ / ⚠️ / ❌ | [Detail] |
| 5. AC Testability | ✅ / ⚠️ / ❌ | [Detail] |
| 6. UI State Spec | ✅ / ⚠️ / ❌ | [Detail] |
| 7. Cross-Module Dep | ✅ / ⚠️ / ❌ | [Detail] |
| 8. Security/Permission | ✅ / ⚠️ / ❌ | [Detail] |

**Required Actions:**
- [Bullet list of specific, actionable changes needed. Empty if all pass.]

---

[Repeat for each story]

---

## Critical Issues Requiring Revision Before Development

[List only the FAIL items with the story ID and the specific change required.]

## Recommended Improvements (Warnings)

[List only the WARNING items. These should be addressed but don't block development.]
```

### Step 4 — Optional Rewrite Mode

If the user asks you to **rewrite** or **fix** failing/warning stories, produce a corrected version of the story using this canonical format:

```
**[US-X.Y]: [Story Title]**
- **As a** [Canonical Role],
- **I want to** [single atomic user action],
- **so that** [clear business benefit].

*Acceptance Criteria:*
- ✅ **Happy Path:** [...]
- ✅ **Edge Case:** [...]
- ✅ **Failure/Error:** [...]
- ✅ **Permission Gate:** [Manager PIN required / N/A]
- ✅ **Cross-Module Impact:** [Specify side-effect in other module / N/A]
```

Always explain **WHY** the change was made in a brief rationale comment below the rewrite.

---

## Slash Command

This skill is invoked by the `/review-stories` command.

### Usage

```
/review-stories [module|file|inline-text]
```

### Examples

```
/review-stories CORE_ORDER_MANAGEMENT_REQUIREMENTS.md
```
→ Reviews all stories in that file.

```
/review-stories KDS
```
→ Resolves to `KDS_REQUIREMENTS.md` and reviews all stories.

```
/review-stories "As a Server, I want to close the tab so that I can go home."
```
→ Reviews the inline story directly.

```
/review-stories all
```
→ Reviews ALL six requirements documents in sequence and produces a combined report.

### Module Name Aliases (case-insensitive)

| Alias | Resolves To |
|---|---|
| `core`, `order`, `core-order` | `CORE_ORDER_MANAGEMENT_REQUIREMENTS.md` |
| `kds`, `kitchen` | `KDS_REQUIREMENTS.md` |
| `floor`, `floorplan`, `floor-plan` | `FLOOR_PLAN_REQUIREMENTS.md` |
| `tableside`, `mobile`, `qr` | `TABLESIDE_ORDERING_REQUIREMENTS.md` |
| `inventory`, `ingredients` | `INVENTORY_REQUIREMENTS.md` |
| `analytics`, `ai`, `sales` | `ANALYTICS_REQUIREMENTS.md` |
| `all`, `everything` | All 6 files |

---

## Output File (Optional)

When reviewing a full module, offer to save the review report to:
```
/home/arun/IdeaProjects/shopro-pos/reviews/[MODULE]_REVIEW_[YYYY-MM-DD].md
```

---

## Quality Gate Rules (Hard Stops)

These are non-negotiable rules. If ANY of the following are true, the overall verdict MUST be **BLOCKED**:

1. Any story has **zero Acceptance Criteria**.
2. Any privileged action (discount, void, layout edit, PO generation) has **no permission gate** defined.
3. Any story references a role that is **not in the canonical Shopro role list**.
4. Any story's goal clause describes a **technical implementation** rather than a user goal.
5. Any story crosses a known **cross-module boundary** and the AC has **no mention** of the side-effect in the dependent module.
