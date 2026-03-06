---
name: story-gap-finder
description: Identifies missing user stories by comparing a product description (high-level or detailed) against an existing set of requirement documents. Uses domain decomposition, functional surface mapping, and negative-space reasoning to surface gaps before sprint planning.
---

# Shopro POS — Story Gap Finder Skill

## Purpose

This skill surfaces **missing user stories** by performing a structured comparison between:
1. A **Product Description** (could be a one-liner, bullet list, or a document like `EXTENDED_REQUIREMENTS.md`).
2. An **Existing Story Set** (one or more `*_REQUIREMENTS.md` files).

It uses a multi-pass framework to reason about what **must exist** for a feature to be truly "done" from a user's perspective, and then checks if those stories are present.

Use this skill when:
- A product description mentions a capability but no user stories exist for it.
- A new feature has been written at a high level and needs to be expanded into stories.
- Before sprint planning, to validate that no critical flows are missing.
- After an audit by `user-stories-reviewer` to ensure coverage is complete, not just quality.

---

## Shopro POS Context

### All Known Modules & Requirement Files
| Module | File |
|---|---|
| Core Menu & Order Management | `CORE_ORDER_MANAGEMENT_REQUIREMENTS.md` |
| Kitchen Display System (KDS) | `KDS_REQUIREMENTS.md` |
| Dynamic Floor Plan & Reservations | `FLOOR_PLAN_REQUIREMENTS.md` |
| Contactless Tableside Ordering | `TABLESIDE_ORDERING_REQUIREMENTS.md` |
| Ingredient-Level Inventory Tracking | `INVENTORY_REQUIREMENTS.md` |
| AI-Powered Sales Analytics | `ANALYTICS_REQUIREMENTS.md` |

### Known Shopro User Roles
Server/Cashier, Manager, Line Cook, Expeditor (Expo), Host/Hostess, Busser, Chef, Owner/General Manager, Guest, System (AI Engine / Automation)

---

## Gap-Finding Protocol

When invoked, follow these seven passes in sequence. Each pass uses a different lens to spot missing stories.

---

### Pass 1 — Feature Inventory Extraction

**Goal:** Build a complete list of "feature atoms" from the product description.

A "feature atom" is the smallest testable capability implied by the description.

**How to extract:**
1. Read the product description.
2. For every sentence or bullet, decompose it into the smallest atomic units of user-facing behavior.
3. Assign each atom a temporary ID: `FEAT-1`, `FEAT-2`, etc.
4. Classify each atom as one of: `CRUD`, `State-Change`, `Notification`, `Integration`, `Configuration`, `Auth/Security`, `Reporting`, or `Error-Handling`.

**Example:**
> "Low-stock alerts on individual ingredients" → FEAT-12 [Notification] — System sends an alert when an ingredient drops below par.

---

### Pass 2 — Story Coverage Mapping

**Goal:** For each feature atom, determine if an existing user story covers it.

1. Read all the relevant `*_REQUIREMENTS.md` files.
2. For each `FEAT-X`, search for a user story whose **goal clause** (`I want to`) or **acceptance criteria** explicitly addresses it.
3. Mark coverage as:
   - ✅ **COVERED** — A story exists and its AC satisfies the feature atom.
   - ⚠️ **PARTIALLY COVERED** — A story exists but the AC only addresses part of the atom.
   - ❌ **MISSING** — No story exists that addresses this atom.

---

### Pass 3 — Negative-Space Reasoning (The "What About When..." Pass)

**Goal:** Identify **implicit** stories that are never mentioned but are always required.

Every feature has a "shadow" of implicit stories around it. For each major feature area, ask:

| Negative-Space Question | What to look for |
|---|---|
| What happens when it **fails**? | Error handling, retry, fallback stories |
| What happens when it's **empty**? | Zero-state / first-time-use stories |
| Who **configures** it? | Admin/setup stories for each feature |
| Who **reverses** it? | Undo, cancel, void, rollback stories |
| How do you know it **worked**? | Confirmation, audit log, notification stories |
| Who can **see** it vs **change** it? | Role-based read vs write access stories |
| What happens on a **slow/offline** network? | Degraded-mode stories |

Flag any of these that are not covered by existing stories.

---

### Pass 4 — Cross-Module Boundary Gaps

**Goal:** Check that cross-module *trigger points* have coverage on **both sides** of the boundary.

Use the known dependency table:

| Trigger | Sending Module | Receiving Module | Check For |
|---|---|---|---|
| Server presses "Send" | Core Order | KDS | Story covering what the Cook sees |
| Guest submits tableside order | Tableside | KDS + Floor Plan | Stories for both the KDS ticket AND the Floor Plan status change |
| POS ticket is fired | Core Order / Tableside | Inventory | Story for ingredient depletion |
| POS order is voided | Core Order | Inventory | Story for inventory restoration or waste logging |
| Ingredient drops below par | Inventory | Manager (alert) | Story for the alert and the reorder flow |
| Item's profitability is calculated | Inventory (food cost) | Analytics | Story linking food cost to the analytics dashboard |

For each row, verify that a user story exists describing the experience on the **receiving** side.

---

### Pass 5 — Role-Coverage Completeness

**Goal:** Ensure every canonical Shopro role has at least one story in every module they interact with.

Build a matrix:

| Role | Module 1 | Module 2 | ... |
|---|---|---|---|
| Server | ✅ | ✅ | |
| Manager | ✅ | ❌ | ← Flag the gap |
| Host | | ✅ | |
| ...| | | |

Flag any cell where a role logically *should* have a story in a module (based on the product description) but none exists.

---

### Pass 6 — CRUD Completeness Check

**Goal:** For every **entity** (data object) created by the system, ensure full lifecycle coverage.

Entities in the Shopro POS system:
- **Order Ticket** — Create, Read (view), Update (modify items), Delete/Void, Close (pay)
- **Menu Item** — Create, Read, Update (price/photo/modifiers), Archive (86'd)
- **Table / Floor Plan Shape** — Create, Read, Update (name/capacity/section), Delete
- **Raw Ingredient** — Create, Read, Update (stock levels, cost), Delete
- **Recipe** — Create, Read, Update (change ingredients/quantities), Delete
- **Purchase Order (PO)** — Create (generate), Read, Update (edit quantities), Finalize (receive)
- **Waitlist Entry** — Create, Read, Update (notify, seat), Remove/Archive
- **Section** — Create, Read, Update (reassign tables), Delete
- **Staff/Shift** — Create, Read, Update, Delete (if applicable)
- **KDS Routing Rule** — Create, Read, Update, Delete

For each entity, check if all relevant lifecycle operations have a corresponding user story.
Flag any lifecycle operation that is missing.

---

### Pass 7 — System & Non-Functional Story Gaps

**Goal:** Surface the stories that developers never write but QA always finds missing.

Check for the existence of stories covering:

- [ ] **Authentication & Login** — Every role must have a story for how they log in (PIN, password, card swipe, etc.)
- [ ] **Session Timeout / Auto-Logout** — What happens when the terminal is idle?
- [ ] **Hardware Configuration** — Stories for connecting/configuring receipt printers, bump bars, KDS screens, and card readers.
- [ ] **Offline / Network Failure Mode** — What does the system do when the internet drops?
- [ ] **Permission Denied UX** — What does a Server see when they attempt a Manager-only action?
- [ ] **Data Export / Reporting** — Can managers export sales reports? In what format?
- [ ] **End-of-Day / Shift Close** — Is there a reconciliation or close-out story?
- [ ] **Onboarding / First Use** — What happens on first launch with no data?
- [ ] **Payment Failure Handling** — What happens when a card is declined?
- [ ] **Printer/KDS Offline Fallback** — What happens when a KDS station goes offline mid-service?

---

## Output Format

Produce the gap report in the following structured markdown format.

```markdown
# Story Gap Analysis Report
**Input:** [Description of what was analyzed]
**Existing Stories Checked:** [List of files]
**Analysis Date:** [Date]
**Analyst:** Antigravity (AI Agent)

---

## Executive Summary

| Category | Gaps Found |
|---|---|
| Missing Feature Stories | [N] |
| Partially Covered Stories | [N] |
| Negative-Space Gaps | [N] |
| Cross-Module Boundary Gaps | [N] |
| CRUD Lifecycle Gaps | [N] |
| Non-Functional / System Gaps | [N] |
| **TOTAL GAPS** | **[N]** |

---

## Discovered Gaps

### GAP-[N]: [Short Title]
- **Type:** [CRUD / State-Change / Notification / Error-Handling / Auth / Configuration]
- **Severity:** 🔴 Critical / 🟡 Major / 🔵 Minor
- **Module:** [Which module this belongs to]
- **Trigger:** [Feature atom or question that revealed this gap]
- **What's Missing:** [Precise description of what story is needed]
- **Suggested Story Skeleton:**
  - **As a** [Role], **I want to** [action], **so that** [benefit].
  - *AC Hint:* [One-line pointer to what the acceptance criteria should address]

---

[Repeat for each gap]

---

## Gap Priority Matrix

| GAP ID | Title | Severity | Module | Suggested Sprint |
|---|---|---|---|---|
| GAP-1 | ... | 🔴 Critical | ... | Sprint 1 (MVP) |
| GAP-2 | ... | 🟡 Major | ... | Sprint 2 |

---

## Severity Definitions

- 🔴 **Critical:** The system cannot function without this story. Blocks core user flows.
- 🟡 **Major:** The system works but is incomplete. Significant UX or operational risk.
- 🔵 **Minor:** Enhancement or edge-case coverage. Low operational impact.
```

---

## Slash Command

This skill is invoked by the `/find-story-gaps` command.

### Usage

```
/find-story-gaps [description|module|file]
```

### Examples

```
/find-story-gaps EXTENDED_REQUIREMENTS.md
```
→ Uses the extended requirements as the product description. Compares against all existing `*_REQUIREMENTS.md` files.

```
/find-story-gaps "Add a loyalty points and rewards system for returning customers"
```
→ Treats the inline text as a new feature description. Identifies gaps if any story work has already started.

```
/find-story-gaps KDS
```
→ Deep-dives only the KDS feature area. Runs all 7 passes specifically against `KDS_REQUIREMENTS.md`.

```
/find-story-gaps all
```
→ Full system gap analysis. Reads `EXTENDED_REQUIREMENTS.md` and cross-checks it against all 6 `*_REQUIREMENTS.md` files using all 7 passes.

---

## Key Rules

1. **Do not hallucinate** stories. Only report a gap if you can cite the specific feature atom that is unaddressed OR a specific negative-space question that has no story.
2. **Always provide a story skeleton.** A gap without a suggested fix is not actionable.
3. **Severity must be justified.** State WHY a gap is Critical vs. Major vs. Minor in one sentence.
4. **Offer to write the stories.** After the report, always ask: *"Would you like me to write full user stories for any of these gaps?"* If yes, use the canonical story format from the `user-stories-reviewer` skill.

---

## Output File (Optional)

When running a full or module-level analysis, offer to save the report to:
```
/home/arun/IdeaProjects/shopro-pos/reviews/GAP_ANALYSIS_[MODULE]_[YYYY-MM-DD].md
```
