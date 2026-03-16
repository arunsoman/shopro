---
name: product-doc-generator
description: >
  Automatically generates comprehensive product documentation by recursively analyzing a codebase —
  starting from the entry point and traversing all visual elements (forms, cards, modals, tables,
  dropdowns, etc.), backend logic, database schemas, and API layers. Supports resume (continue from
  where it stopped), surgical re-documentation of specific features or components when code changes,
  and targeted section edits in the final doc without regenerating everything. Use this skill whenever
  a user wants to document their product from code, generate a PRD from an existing codebase, create a
  features spec from React/Java/DB code, or says things like "document my product", "generate product
  docs from my code", "create a PRD from my codebase", "what does my app do", "document all the
  screens and features", "continue documenting", "redo the login feature", "update docs for X", or
  "the code for Y changed, update the docs". Handles React frontends, Java/Node backends,
  SQL/NoSQL schemas, and REST/GraphQL APIs.
---

# Product Documentation Generator

Generates a full product document by recursively crawling code — UI components, backend logic, and DB schemas — producing structured documentation. Supports **resume**, **continue**, and **surgical re-documentation** of specific features without starting over.

---

## Step 0: Determine Mode — Fresh Start vs Resume vs Edit

**Before doing anything else**, check for an existing progress file:

```bash
ls .prodoc/progress.json 2>/dev/null && echo "EXISTS" || echo "NONE"
```

### Mode A — Fresh Start
No `.prodoc/` directory exists. Proceed from Phase 1.

### Mode B — Resume / Continue
`.prodoc/progress.json` exists. Read it:

```bash
cat .prodoc/progress.json
```

The file contains:
```json
{
  "product_name": "MyApp",
  "started_at": "2025-01-10T10:00:00Z",
  "last_updated": "2025-01-10T14:32:00Z",
  "doc_path": ".prodoc/draft.md",
  "phases_complete": ["phase1", "phase2_ui", "phase3_api"],
  "phase_in_progress": "phase4_db",
  "components_done": ["App.tsx", "Login.tsx", "Dashboard.tsx", "UserForm.tsx"],
  "components_pending": ["Settings.tsx", "AdminPanel.tsx", "Reports.tsx"],
  "features_done": ["auth", "dashboard", "user-management"],
  "features_pending": ["settings", "admin", "reports"],
  "file_hashes": {
    "src/Login.tsx": "a3f1c2...",
    "src/Dashboard.tsx": "9b2e11..."
  }
}
```

Tell the user: "Found an existing session. You have completed [X] components. Resuming from [phase_in_progress]…"

Then **skip all completed phases** and pick up exactly where it stopped. Load the existing draft:
```bash
cat .prodoc/draft.md
```
Append new content to the draft rather than rewriting it.

### Mode C — Surgical Edit / Targeted Redo

Triggered when the user says things like:
- "redo the login feature"
- "the payment flow code changed, update docs"
- "update just the user management section"
- "re-document the UserForm component"

Steps:
1. Read `.prodoc/progress.json` to get `file_hashes` and `features_done`
2. Identify which components/features the user is referring to
3. If user didn't specify which files changed, auto-detect with:
```bash
# Compare current hashes to stored ones
python3 .prodoc/check_changes.py
```
4. Re-analyze only those components (Phases 2–4 scoped to changed files)
5. **Surgically replace** only the affected section(s) in the draft — do NOT touch unaffected sections
6. Update `file_hashes` and `last_updated` in progress.json

---

## Progress Tracking System

### Initialize on First Run
```bash
mkdir -p .prodoc
```

Create `.prodoc/progress.json` at the start of Phase 1 with status `"started"`. Update it continuously as you go.

### Update Progress After Each Component
After fully documenting each component/screen, update the progress file immediately:
```bash
python3 - <<'EOF'
import json, hashlib, os, datetime

progress_path = ".prodoc/progress.json"
with open(progress_path) as f:
    p = json.load(f)

# Mark component done
component = "ComponentName.tsx"  # replace dynamically
file_path = f"src/{component}"

p["components_done"].append(component)
p["components_pending"].remove(component)

# Store file hash for change detection later
with open(file_path, "rb") as cf:
    p["file_hashes"][file_path] = hashlib.md5(cf.read()).hexdigest()

p["last_updated"] = datetime.datetime.utcnow().isoformat() + "Z"

with open(progress_path, "w") as f:
    json.dump(p, f, indent=2)
EOF
```

### Update Phase Status
After completing each phase, set `phases_complete` and `phase_in_progress` accordingly.

### Save Draft Incrementally
Write completed sections to `.prodoc/draft.md` as they are finished — not all at once at the end. This means a resume can pick up mid-document.

```bash
# Append a completed section to the draft
cat >> .prodoc/draft.md << 'SECTION'
## 5.3 Feature: User Management
...content...
SECTION
```

### Change Detection Script
Create this once at init time:

```bash
cat > .prodoc/check_changes.py << 'EOF'
import json, hashlib, os

with open(".prodoc/progress.json") as f:
    progress = json.load(f)

changed = []
for filepath, stored_hash in progress.get("file_hashes", {}).items():
    if not os.path.exists(filepath):
        changed.append((filepath, "DELETED"))
        continue
    with open(filepath, "rb") as cf:
        current_hash = hashlib.md5(cf.read()).hexdigest()
    if current_hash != stored_hash:
        changed.append((filepath, "MODIFIED"))

if changed:
    print("CHANGED FILES:")
    for path, status in changed:
        print(f"  {status}: {path}")
else:
    print("NO CHANGES DETECTED")
EOF
```

---

## Phase 1: Orient & Discover Entry Points

Before writing anything, explore the repo structure:

```bash
# Get top-level structure
find . -maxdepth 3 -type f | grep -E "\.(jsx?|tsx?|java|py|sql|prisma|graphql|yaml|json)$" | head -80

# Find entry points
ls src/ app/ pages/ routes/ main/ index.* App.* 2>/dev/null
cat package.json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('main',''), d.get('scripts',{}))"
```

Identify:
- **Frontend entry**: `App.jsx`, `index.tsx`, `_app.tsx`, `main.tsx`
- **Router file**: `routes.jsx`, `router.tsx`, `AppRouter`, Next.js `pages/`
- **Backend entry**: `main.java`, `Application.java`, `server.js`, `app.py`
- **DB layer**: `schema.prisma`, `*.sql`, `models/`, `entities/`, `migrations/`

---

## Phase 2: Recursive UI Traversal

Start at the entry component. For each component encountered:

### Step 2a — Extract Component Purpose
Read the file and determine:
- What does this screen/component represent?
- What is the user trying to accomplish here?

### Step 2b — Catalog Visual Elements
For every visual element found, document it in the output:

| Element Type | What to Document |
|---|---|
| **Page / Screen** | Title, purpose, route path |
| **Form** | All fields (label, type, required, validation), submit action |
| **Table / List** | Columns shown, data source, sortable/filterable fields |
| **Card** | What entity it represents, data displayed |
| **Modal / Dialog** | Trigger condition, content, actions |
| **Dropdown / Select** | Label, all options (trace to source: constants, enum, API call, DB query) |
| **Button** | Label, action triggered |
| **Nav / Sidebar** | All links and their destinations |
| **Search / Filter** | What can be searched/filtered and how |
| **Chart / Graph** | What data is visualized, axes, time range |

### Step 2c — Trace Select/Dropdown Options
When a dropdown or select is found:
1. Check if options are hardcoded in the component → list them directly
2. If from a constants file → open that file and extract all values
3. If from an API call → trace to the backend endpoint
4. If from backend → trace to the DB query or enum
5. Document ALL possible values with their meaning

### Step 2d — Recurse Into Child Components
```bash
# Find all imports in a component
grep -E "^import|from '" ComponentName.tsx | grep -v node_modules
```
Follow each imported local component and repeat Steps 2a–2d.

---

## Phase 3: Backend & API Layer Analysis

For each API endpoint or service method referenced from the UI:

```bash
# Find controllers / route handlers
find . -name "*Controller*" -o -name "*Router*" -o -name "*routes*" | grep -v node_modules
grep -r "@RestController\|@RequestMapping\|router\.(get\|post\|put\|delete)" --include="*.java" --include="*.js" -l
```

Document per endpoint:
- **Method + Path**: `POST /api/users/create`
- **Purpose**: What business action does this perform?
- **Request payload**: Fields accepted
- **Response**: What is returned
- **Auth required**: Yes/No, role-based?
- **Validation rules**: Server-side constraints

---

## Phase 4: Database Schema Analysis

```bash
# Prisma
cat prisma/schema.prisma 2>/dev/null

# SQL migrations
find . -name "*.sql" | xargs grep -l "CREATE TABLE" 2>/dev/null

# JPA/Hibernate entities
find . -name "*.java" | xargs grep -l "@Entity" 2>/dev/null
```

For each table/entity document:
- **Name & purpose** (what real-world concept it models)
- **Key fields**: name, type, nullable, description
- **Relationships**: one-to-many, many-to-many
- **Enum values**: list all possible values for enum fields

---

## Phase 5: Assemble the Product Document

Now write the full document. **Critical voice rule: write for a product manager or business stakeholder, not an engineer.** Translate everything you found in the code into plain language that describes what users can do and why it matters — not how the code works.

---

### Voice & Tone Rules — Read These Before Writing Anything

| ❌ Wrong (technical) | ✅ Right (product) |
|---|---|
| "The `MenuItemStatus` enum transitions items through DRAFT → PUBLISHED → ARCHIVED states" | "Managers can save items as drafts before publishing them live, and archive old items to hide them without deleting history" |
| "Partial indexing on `status = 'PUBLISHED'` optimizes POS load queries" | "The menu loads quickly on POS devices even with hundreds of items" |
| "usePublishedMenuItems hook fetches only active records" | "Staff only see currently available items during service" |
| "`ModifierGroup` defines min/max selection rules" | "Customers must choose exactly one option from required groups (e.g., pick a side), and can choose multiple from optional groups (e.g., add-ons)" |
| "CDN URLs stored instead of binary blobs" | "Item photos display quickly across all devices" |
| "Drag-and-drop for display_order" | "Managers can reorder categories and items by dragging them" |

**Never mention**: class names, hook names, variable names, database column names, index names, ORM details, or any implementation detail unless it is in the Technical Architecture section (Section 8). Code references belong ONLY in Section 8 and the Appendix.

---

### Document Structure

```
# [Product Name] — Product Documentation

## 1. Product Overview
One paragraph. What is this product? Who uses it day-to-day? What problem does it solve for them?
Write it as if explaining to a new employee on their first day — not to a developer.

Example: "OrderFlow is a restaurant management platform used by restaurant staff and managers.
It allows teams to take orders at the table, manage the menu, track kitchen progress in real time,
and process payments — replacing paper tickets and disconnected systems with a single workflow."

## 2. Goals & Objectives
What outcomes is this product trying to achieve? Infer from the features you found.
- Goal: [plain-language goal]  →  Measured by: [metric implied by data tracked in the system]
Example:
- Goal: Reduce order errors  →  Measured by: Order modification rate after submission
- Goal: Speed up table service  →  Measured by: Time from order placed to kitchen acknowledged

## 3. Target Audience
Who are the real people using this? Infer from role/permission structures found in code.
For each persona:
  **[Role Name]** (e.g., Floor Staff, Manager, Kitchen Staff, Admin)
  - What they do day-to-day in the product
  - What they need the product to do for them

## 4. Scope

### In Scope
List every major capability of the product in plain English, one line each.
Derive these from the screens and features you found.

### Out of Scope
What this product does NOT do. Infer from: missing screens, TODO comments, 
features referenced but not implemented, or natural gaps in the workflow.

## 5. Features & Requirements

### 5.1 Features

For every major feature/screen found, write one block using this EXACT template:

---
### [Feature Name]  <!-- feature-id: kebab-name -->

**What it does**
One or two plain-English sentences. What can the user accomplish here?

**Who uses it**
Which roles/personas interact with this feature?

**How it works — step by step**
Write a numbered list of what the user does, as if walking them through it.
1. The user opens [screen name] from [where]
2. They see a list of [things] with [key info shown per row/card]
3. They can [action] by clicking [button/control]
4. A [form/modal/panel] appears asking for: [field list]
5. After submitting, [what happens]

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| [List/Table name] | Shows [what data], with columns: [col1], [col2], [col3] |
| [Button name] | Opens a form / triggers [action] |
| [Dropdown name] | Lets the user choose from: [Option 1], [Option 2], [Option 3] — (explain what each means in plain English) |
| [Form name] | Collects: [Field 1 (required)], [Field 2 (optional, e.g. "a short description")], [Field 3] |
| [Status badge/toggle] | Shows whether [thing] is [state A] or [state B]; clicking it [does what] |
| [Filter/Search] | Lets the user narrow the list by [criteria] |

**Business rules**
- Plain-English rule 1 (e.g., "An item must be in draft before it can be published")
- Plain-English rule 2 (e.g., "Archived items still appear in historical reports but not on the menu")
- Plain-English rule 3 (e.g., "Customers must choose exactly one option from required modifier groups")

**User stories**
- As a [role], I can [action] so that [outcome].
- As a [role], I can [action] so that [outcome].

---

(Repeat this block for every feature found)

### 5.2 Non-Functional Requirements
Write these for a stakeholder, not an engineer:
- **Access control**: Who can access what (inferred from role checks in code)
- **Performance**: What the product does to stay fast (pagination, lazy loading — described in plain terms)
- **Reliability**: Any error handling, retry logic, or offline behavior found

## 6. User Flows
Describe the main end-to-end journeys a user takes through the product.
Write each as a narrative flow, not a technical sequence.

**Flow: [Name, e.g. "Taking a Table Order"]**
> A floor staff member opens the app on a tablet, selects their section, and taps on a table.
> They browse the menu by category, add items to the order, and specify any customizations
> (e.g., cooking preference, add-ons). Once complete, they submit the order, which immediately
> appears on the kitchen display. They can add more items at any time before the table is closed.

(One paragraph per flow. Cover the 3–5 most important end-to-end journeys.)

## 7. Design & UX Notes
- **Navigation**: How users move between areas of the product (tabs, sidebar, back buttons)
- **Key UI patterns**: Which interaction patterns are used (e.g., modals for creation, inline editing for quick changes, drag-and-drop for ordering)
- **Device / context**: What device or environment is this used in (desktop, tablet, POS terminal, etc.) and how the UI reflects that

## 8. Technical Architecture
This is the ONLY section where technical terms are appropriate.
- **Frontend**: [Framework, state management library, routing approach]
- **Backend**: [Language, framework, API style (REST/GraphQL)]
- **Database**: [Type, ORM, key tables and their purpose in one line each]
- **Integrations**: [Third-party services, payment providers, auth providers, etc.]
- **Hosting / Infrastructure**: [If detectable from config files]

## 9. Dependencies
- **Key libraries**: [Most important packages only — what they are used for, not the version]
- **External services**: [Third-party APIs or services the product calls out to]
- **Environment configuration**: [Key env vars that must be set for the product to run]

## 10. Risks & Assumptions

**Known risks** (from TODOs, FIXMEs, missing error handling found in code):
- [Risk description in plain English — what could go wrong for a user]

**Assumptions made during this analysis**:
- [Assumption 1]

## 11. Open Questions
Things that were unclear from the code and need a human to answer:
- [Question about business logic that couldn't be determined from code alone]
- [Feature that appears partially built — what is the intended end state?]

## 12. Appendix
- Complete route list
- Complete API endpoint list  
- Database tables and their plain-English purpose (one line each)
- All dropdown/select option values found in the product
```

---

## Output Format

- The **live draft** lives at `.prodoc/draft.md` throughout the process (incremental)
- On completion, generate a final `.docx` using the docx skill (read `/mnt/skills/public/docx/SKILL.md` first)
- Also copy the `.md` to the output as `[ProductName]_Product_Documentation.md`
- Name final files: `[ProductName]_Product_Documentation.docx` and `.md`
- Present both to the user
- **Do NOT delete `.prodoc/`** — it is needed for future resumes and edits

---

## Surgical Edit: Replacing a Section in the Draft

When re-documenting a specific feature (Mode C), locate and replace only that section in `.prodoc/draft.md`:

```python
# Read draft
with open(".prodoc/draft.md") as f:
    content = f.read()

# Find section boundaries using heading markers
# Each feature section has a unique heading like:
# ### Feature: User Management  <!-- feature-id: user-management -->
import re

feature_id = "user-management"  # set dynamically
pattern = rf'(### Feature:.*?<!-- feature-id: {feature_id} -->)(.*?)(?=\n### Feature:|\n## |\Z)'
new_section = """### Feature: User Management  <!-- feature-id: user-management -->
...updated content...
"""

updated = re.sub(pattern, new_section, content, flags=re.DOTALL)

with open(".prodoc/draft.md", "w") as f:
    f.write(updated)
```

**Every feature section written to the draft MUST include a comment tag** on its heading line so it can be found and replaced later:
```markdown
### Feature: Login  <!-- feature-id: login -->
### Feature: Dashboard  <!-- feature-id: dashboard -->
### Feature: User Management  <!-- feature-id: user-management -->
```

Use a kebab-case `feature-id` derived from the feature name. Store the mapping of `feature_id → files[]` inside `progress.json` under `"feature_file_map"`:
```json
"feature_file_map": {
  "login": ["src/Login.tsx", "src/auth/AuthService.java"],
  "dashboard": ["src/Dashboard.tsx", "src/api/DashboardController.java"]
}
```
This lets you quickly answer "which feature does this changed file belong to?" during a surgical edit.

---

## Quality Rules

1. **Never skip a visual element** — every form field, every dropdown option, every button must be documented
2. **Always resolve dropdown values** — trace to the actual source and list every option
3. **Document what you see, not what you assume** — only infer when explicitly called out as inference
4. **If a file can't be read**, note it in Open Questions rather than skipping
5. **Maintain recursion depth** — follow component imports at least 4 levels deep
6. **Cross-reference UI ↔ API ↔ DB** — a form field should connect to an API payload which connects to a DB column
7. **Always tag feature sections** with `<!-- feature-id: kebab-name -->` for surgical edits
8. **Update progress.json after every component** — never batch updates, always write immediately
9. **Never regenerate what's already done** — on resume, read the existing draft and append only

---

## Handling Large Codebases

If the codebase has 50+ components:
1. First map all routes → screens and write the full `components_pending` list to `progress.json`
2. Group screens into feature areas
3. Document feature areas top-down rather than file-by-file
4. Prioritize: Entry → Navigation → Core CRUD flows → Settings → Admin

Use this to efficiently scan:
```bash
# Get all route definitions at once
grep -r "path=\|route=\|<Route\|router\." src/ --include="*.tsx" --include="*.jsx" -n | head -60

# Get all component names — write this list to progress.json components_pending
find src/ -name "*.tsx" -o -name "*.jsx" | sed 's/.*\///' | sort
```

When resuming a large codebase, always announce progress to the user:
> "Resuming: 23/47 components done. Continuing with Settings.tsx…"