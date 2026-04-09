---
name: web-app-auditor
description: >
  Merges agent-browser (CDP/headless automation) and Playwright scripting to
  audit every page or TSX component in a running web app. Produces a structured
  per-page report: what is expected, what is working, what is broken, with
  screenshots and console logs as evidence.
---

# Web App Auditor Skill

## Purpose

Given a running (or startable) web app, this skill:

1. Discovers all routes/pages (or accepts a manifest of pages/TSX files)
2. Visits each page with agent-browser OR Playwright
3. Per page, checks: rendering, console errors, network failures, accessibility
   snapshot completeness, visual regressions, and interaction responsiveness
4. Produces a **per-page Markdown audit report** with pass/fail verdicts,
   evidence screenshots, console logs, and actionable remediation notes

---

## When to Use This Skill

Trigger phrases:
- "test every page / component"
- "audit the app"
- "what's working and what's broken"
- "generate a test report for all screens"
- "check all routes"
- "TSX component audit"

---

## Decision: agent-browser vs Playwright

| Situation | Tool |
|---|---|
| App is already running, quick spot-check | `agent-browser` |
| Need scripted, repeatable assertions | Playwright (`scripts/with_server.py`) |
| Need screenshots + accessibility tree | Both (agent-browser for tree, Playwright for screenshots) |
| CI pipeline, headless, structured output | Playwright |
| Exploratory / unknown app, discovering what exists | agent-browser first |

**Default hybrid approach**: Use agent-browser to discover and snapshot, then
generate a Playwright script that encodes the assertions as a repeatable test suite.

---

## Phase 1 — Route / Component Discovery

### Option A: Infer from source files (TSX projects)

```bash
# Find all page/screen TSX files
find src -type f -name "*.tsx" | grep -iE "(page|screen|view|route)" | sort

# Or find all files in pages/ directory (Next.js, etc.)
find src/pages src/app src/views src/screens -name "*.tsx" 2>/dev/null | sort

# Extract route strings from router config
grep -rE '(path|route)\s*[:=]\s*["\x27]/[^"]*' src --include="*.tsx" --include="*.ts" \
  | grep -oP '(?<=["'"'"'])/[^"'"'"']*' | sort -u
```

### Option B: Crawl with agent-browser

```bash
# Open the app and snapshot the nav to find links
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
agent-browser snapshot -i
# Look for nav links in the snapshot output, then iterate
```

### Option C: Accept explicit page manifest

If the user provides a list of URLs or TSX paths, skip discovery and go straight
to Phase 2.

---

## Resume System — Checkpoint State

The auditor writes a checkpoint file after every page completes. If the run
is interrupted (crash, timeout, manual stop), re-running the audit will skip
all already-completed pages and continue from where it left off.

### Checkpoint File: `.audit-checkpoint.json`

Location: same directory as the output report (e.g. `/tmp/audit/` or
`/mnt/user-data/outputs/`). Create this file before starting the loop and
update it atomically after each page finishes.

**Schema:**

```json
{
  "session_id": "audit-2024-01-15T10:30:00",
  "base_url": "http://localhost:3000",
  "started_at": "2024-01-15T10:30:00Z",
  "last_updated": "2024-01-15T10:35:42Z",
  "total_pages": 12,
  "pages": {
    "/": { "status": "done", "overall": "HEALTHY", "completed_at": "2024-01-15T10:31:05Z" },
    "/dashboard": { "status": "done", "overall": "BROKEN", "completed_at": "2024-01-15T10:32:44Z" },
    "/settings": { "status": "in_progress", "started_at": "2024-01-15T10:33:01Z" },
    "/profile": { "status": "pending" },
    "/login": { "status": "pending" }
  }
}
```

**Page statuses:**
- `pending` — not yet started
- `in_progress` — started but not finished (crashed mid-audit)
- `done` — fully audited, results saved
- `skipped` — explicitly skipped (e.g. auth-required page with no credentials)

### Writing the Checkpoint

```python
import json, os, datetime

CHECKPOINT_PATH = "/tmp/audit/.audit-checkpoint.json"

def load_checkpoint() -> dict:
    """Load existing checkpoint or return empty state."""
    if os.path.exists(CHECKPOINT_PATH):
        with open(CHECKPOINT_PATH) as f:
            return json.load(f)
    return {}

def save_checkpoint(state: dict):
    """Write checkpoint atomically (write to .tmp then rename)."""
    tmp = CHECKPOINT_PATH + ".tmp"
    state["last_updated"] = datetime.datetime.utcnow().isoformat() + "Z"
    with open(tmp, "w") as f:
        json.dump(state, f, indent=2)
    os.replace(tmp, CHECKPOINT_PATH)  # atomic on POSIX

def mark_in_progress(state: dict, route: str):
    state["pages"][route] = {
        "status": "in_progress",
        "started_at": datetime.datetime.utcnow().isoformat() + "Z"
    }
    save_checkpoint(state)

def mark_done(state: dict, route: str, overall: str):
    state["pages"][route] = {
        "status": "done",
        "overall": overall,
        "completed_at": datetime.datetime.utcnow().isoformat() + "Z"
    }
    save_checkpoint(state)
```

### Resume Logic — Skip Already-Done Pages

```python
def should_skip(state: dict, route: str) -> bool:
    """Return True if this page was fully audited in a previous run."""
    page_state = state.get("pages", {}).get(route, {})
    return page_state.get("status") == "done"

def get_resume_summary(state: dict) -> str:
    """Human-readable summary of what was already done."""
    pages = state.get("pages", {})
    done = [r for r, s in pages.items() if s.get("status") == "done"]
    pending = [r for r, s in pages.items() if s.get("status") in ("pending", "in_progress")]
    return f"Resuming: {len(done)} pages already done, {len(pending)} remaining"
```

### Full Audit Loop with Resume

```python
def run_audit(routes: list[str], base_url: str):
    state = load_checkpoint()

    # First run: initialise the checkpoint
    if not state:
        session_id = f"audit-{datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%S')}"
        state = {
            "session_id": session_id,
            "base_url": base_url,
            "started_at": datetime.datetime.utcnow().isoformat() + "Z",
            "total_pages": len(routes),
            "pages": {r: {"status": "pending"} for r in routes}
        }
        save_checkpoint(state)
        print(f"Starting new audit session: {session_id}")
    else:
        print(get_resume_summary(state))

    for route in routes:
        if should_skip(state, route):
            print(f"  ⏭ Skipping {route} (already done)")
            continue

        print(f"  Auditing {route}...")
        mark_in_progress(state, route)

        try:
            result = audit_page(route, base_url)   # Phase 2 checks
            append_page_to_report(route, result)    # Phase 3
            mark_done(state, route, result["overall"])
            print(f"  ✅ {route} → {result['overall']}")
        except Exception as e:
            # Mark as pending again so it retries on next run
            state["pages"][route] = {"status": "pending", "last_error": str(e)}
            save_checkpoint(state)
            print(f"  ❌ {route} failed: {e} — will retry on next run")
            # Continue to next page rather than aborting the whole audit
            continue

    # All done — checkpoint signals completion
    state["finished_at"] = datetime.datetime.utcnow().isoformat() + "Z"
    save_checkpoint(state)
```

### Resuming a Previous Run

When the user re-triggers the audit (same app, same output directory):

```python
state = load_checkpoint()

if state and all(s.get("status") == "done" for s in state["pages"].values()):
    print("Audit already complete. Delete .audit-checkpoint.json to re-run from scratch.")
else:
    # Rebuild routes list preserving original order but skipping done ones
    routes = list(state["pages"].keys())  # order from checkpoint
    run_audit(routes, state["base_url"])
```

### Partial Report Merging

Because each page's Markdown section is appended to `audit-report.md`
as it completes, a partial report is always readable even mid-run.
On resume, **do not truncate or overwrite** the existing report — only
append the missing page sections. After all pages are done, regenerate
the summary table at the top (Phase 4) using the full checkpoint data.

```python
def regenerate_summary_table(state: dict) -> str:
    """Build the overall health table from checkpoint data, not from re-running."""
    rows = []
    for route, info in state["pages"].items():
        overall = info.get("overall", "UNKNOWN")
        icon = {"HEALTHY": "✅", "WARNING": "⚠️", "BROKEN": "❌"}.get(overall, "❓")
        rows.append(f"| {route} | {icon} {overall} |")
    return "\n".join(rows)
```

### Checkpoint Cleanup

After a fully successful run, inform the user:

```
Audit complete. Checkpoint saved at .audit-checkpoint.json.
To re-audit from scratch: delete .audit-checkpoint.json and re-run.
To re-audit specific pages only: edit .audit-checkpoint.json and set
those pages' status back to "pending".
```

---

## Phase 2 — Per-Page Audit Procedure

For each page/route, run ALL of the following checks. Record results in the
report template (Phase 3).

### 2.1 Navigation & Render Check

```bash
# agent-browser approach
agent-browser open http://localhost:3000/<route>
agent-browser wait --load networkidle
agent-browser screenshot /tmp/audit/<page>_render.png --full

# Check we actually landed on the right page (not a 404/error page)
agent-browser get title
agent-browser get url
agent-browser wait --text "404" --state hidden 2>/dev/null && echo "OK" || echo "POSSIBLE 404"
```

**Expected**: page title matches route intent, no error boundary text visible,
URL matches requested route (no unexpected redirect).

**Failure signals**: title contains "Error", "404", "Not Found", or
`--text "Something went wrong"` is found.

### 2.2 Console Error Check

```python
# Playwright: capture console errors
errors = []
page.on("console", lambda msg: errors.append(msg) if msg.type == "error" else None)
page.on("pageerror", lambda err: errors.append(f"UNCAUGHT: {err}"))
page.goto(f"http://localhost:3000/{route}")
page.wait_for_load_state("networkidle")
# errors now contains all console errors
```

**Expected**: zero console errors, zero uncaught exceptions.

**Failure signals**: any item in `errors` list, especially React hydration
errors, `TypeError`, `ReferenceError`, or CORS errors.

### 2.3 Network Failure Check

```bash
# agent-browser: inspect XHR/fetch calls for failures
agent-browser network requests --type xhr,fetch --status 4xx
agent-browser network requests --type xhr,fetch --status 5xx
```

```python
# Playwright equivalent
failed_requests = []
page.on("requestfailed", lambda req: failed_requests.append({
    "url": req.url,
    "failure": req.failure
}))
page.on("response", lambda resp: failed_requests.append({
    "url": resp.url, "status": resp.status
}) if resp.status >= 400 else None)
```

**Expected**: no 4xx/5xx responses, no failed requests.

**Failure signals**: API calls returning 401/403/404/500, missing static assets
(404 on images/fonts/scripts).

### 2.4 Accessibility Snapshot Check

```bash
agent-browser snapshot -i > /tmp/audit/<page>_snapshot.txt

# Check for critical interactive elements
grep -c "button\|input\|link\|select" /tmp/audit/<page>_snapshot.txt
```

**Expected**: snapshot is non-empty, key interactive elements are present
and have accessible labels (no `@e1 [button] ""` unlabeled elements).

**Failure signals**: empty snapshot, elements with empty labels, missing
`[heading]` at top level.

### 2.5 Annotated Screenshot

```bash
agent-browser screenshot --annotate
# Produces screenshot with numbered element labels — captures visual layout
# and caches refs for interaction testing
```

Save annotated screenshot as evidence in the report.

### 2.6 Depth-First Element Exploration

Every clickable element on the page is visited using a depth-first strategy.
Clicking an element may reveal new elements (modals, dropdowns, accordions,
tabs, drawers) — those are explored recursively before backtracking.

#### Core Concepts

**Interaction tree**: a tree where the root is the page at rest. Each node is
a UI state reached by an interaction. Children of a node are elements that
become clickable/visible only after the parent interaction. DFS explores each
branch to its full depth before backtracking.

**Visited set**: tracks `(route, element_fingerprint)` pairs across the entire
run. A fingerprint is `role + accessible_name + selector`. Never click the
same element twice in the same branch (prevents infinite loops on toggles).

**Backtrack = restore**: after exploring a branch, restore the page to the
state it was in before that click — either by navigating back, closing the
modal, pressing Escape, or re-navigating to the route.

#### Element Classification

Before acting on anything, classify every interactive element from the DOM snapshot:

```python
CLICKABLE_ROLES = {
    "button", "link", "menuitem", "tab", "option",
    "checkbox", "radio", "switch", "treeitem",
    "combobox", "listbox", "menuitemcheckbox", "menuitemradio"
}

FILLABLE_ROLES = {"textbox", "searchbox", "spinbutton", "slider", "textarea"}

SKIP_PATTERNS = [
    r"^https?://(?!localhost)",          # external navigation
    r"(?i)(logout|sign.?out|delete.?account)",  # destructive
    r"^mailto:|^tel:|^javascript:void",  # non-http links
]

def classify_element(el: dict) -> str:
    """Returns: 'click' | 'fill' | 'select' | 'check' | 'skip'"""
    href = el.get("href", "") or ""
    name = el.get("name", "") or ""
    tag  = el.get("tag", "")
    typ  = el.get("type", "") or ""
    role = el.get("role", "")

    if any(re.search(p, href or name) for p in SKIP_PATTERNS):
        return "skip"
    if tag == "select" or role == "listbox":
        return "select"
    if tag == "input" and typ in ("checkbox",):
        return "check"
    if tag == "input" and typ in ("radio",):
        return "check"
    if role in FILLABLE_ROLES or tag in ("input", "textarea"):
        return "fill"
    if role in CLICKABLE_ROLES or tag in ("button", "a"):
        return "click"
    return "skip"
```

---

#### Form Detection & Grouping

Before starting DFS element-by-element clicks, scan the page for `<form>`
elements and treat each form as a **single atomic unit**. A form must be
filled completely and submitted together — not field-by-field in isolation.

```python
def detect_forms(page) -> list[dict]:
    """
    Returns a list of form descriptors, each containing all its fields
    and the submit button. Fields outside any <form> tag that are visually
    grouped (same container, followed by a submit button) are also collected
    as implicit forms.
    """
    return page.evaluate("""() => {
        function getLabel(el) {
            // 1. aria-label / aria-labelledby
            if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
            const lbId = el.getAttribute('aria-labelledby');
            if (lbId) return document.getElementById(lbId)?.innerText?.trim() || '';
            // 2. <label for="id">
            if (el.id) {
                const lbl = document.querySelector(`label[for="${el.id}"]`);
                if (lbl) return lbl.innerText.trim();
            }
            // 3. placeholder
            if (el.placeholder) return el.placeholder;
            // 4. name attribute
            if (el.name) return el.name;
            return '';
        }

        function describeField(el) {
            return {
                tag:         el.tagName.toLowerCase(),
                type:        el.type || null,
                name:        el.name || null,
                id:          el.id   || null,
                label:       getLabel(el),
                placeholder: el.placeholder || null,
                required:    el.required,
                selector:    el.id ? `#${el.id}` :
                             el.getAttribute('data-testid') ?
                             `[data-testid="${el.getAttribute('data-testid')}"]` :
                             el.name ? `[name="${el.name}"]` : null,
                options:     el.tagName === 'SELECT'
                             ? Array.from(el.options).map(o => ({value: o.value, text: o.text}))
                             : null,
            };
        }

        const forms = [];

        // Explicit <form> elements
        document.querySelectorAll('form').forEach(form => {
            const fields  = Array.from(form.querySelectorAll(
                'input:not([type=hidden]):not([type=submit]):not([type=button]),' +
                'textarea, select'
            )).map(describeField);
            const submits = Array.from(form.querySelectorAll(
                'button[type=submit], input[type=submit], button:not([type=button])'
            )).map(el => ({
                tag: el.tagName.toLowerCase(), text: el.innerText?.trim() || el.value,
                selector: el.id ? `#${el.id}` : null,
            }));
            if (fields.length > 0) {
                forms.push({ explicit: true, fields, submits,
                             id: form.id || null, action: form.action || null });
            }
        });

        // Implicit forms: inputs not inside a <form> tag
        const orphans = Array.from(document.querySelectorAll(
            'input:not(form input):not([type=hidden]):not([type=submit]),' +
            'textarea:not(form textarea)'
        )).map(describeField);

        if (orphans.length > 0) {
            // Find the nearest submit-like button
            const btn = document.querySelector(
                'button:not([type=button]), [role=button], input[type=submit]'
            );
            forms.push({
                explicit: false, fields: orphans,
                submits: btn ? [{ tag: btn.tagName.toLowerCase(),
                                  text: btn.innerText?.trim(),
                                  selector: btn.id ? `#${btn.id}` : null }] : [],
            });
        }

        return forms;
    }""")
```

---

#### Realistic Test Data Generation

Every field is filled with **typed, realistic data** inferred from its label,
name, type, and placeholder — not generic "test input".

```python
import random, string

def generate_value(field: dict) -> str | bool | None:
    """
    Return a realistic test value for a field based on its metadata.
    Returns None if the field should be skipped (file upload, hidden, etc.).
    """
    label = (field.get("label") or field.get("name") or
             field.get("placeholder") or "").lower()
    typ   = (field.get("type") or "text").lower()
    tag   = field.get("tag", "input")

    # ── Skip non-fillable types ─────────────────────────────────────────────
    if typ in ("file", "hidden", "image", "reset"):
        return None

    # ── Checkboxes & radios ─────────────────────────────────────────────────
    if typ in ("checkbox", "radio"):
        return True  # check it

    # ── Selects — pick first non-empty option ───────────────────────────────
    if tag == "select":
        options = field.get("options") or []
        non_empty = [o for o in options if o["value"] not in ("", None, "placeholder")]
        return non_empty[0]["value"] if non_empty else None

    # ── Typed inputs ────────────────────────────────────────────────────────
    if typ == "email" or any(w in label for w in ("email", "e-mail", "mail")):
        return "test.audit@example.com"

    if typ == "password" or "password" in label:
        return "TestP@ssw0rd!"

    if typ == "tel" or any(w in label for w in ("phone", "tel", "mobile", "contact")):
        return "+1 555-000-1234"

    if typ == "url" or "url" in label or "website" in label:
        return "https://example.com"

    if typ == "number" or any(w in label for w in ("age", "quantity", "amount", "count", "number")):
        return "25"

    if typ == "date" or "date" in label:
        return "2000-01-01"

    if typ == "time" or "time" in label:
        return "09:00"

    if typ in ("datetime-local",):
        return "2000-01-01T09:00"

    if typ == "range" or "range" in label:
        return "50"  # midpoint

    if typ == "color":
        return "#3b82f6"

    if any(w in label for w in ("name", "full name", "first", "last", "username", "user")):
        return "Test User"

    if any(w in label for w in ("address", "street", "city", "zip", "postcode", "postal")):
        return "123 Test Street"

    if any(w in label for w in ("company", "organisation", "organization", "business")):
        return "Acme Corp"

    if any(w in label for w in ("message", "comment", "description", "bio", "note", "feedback")):
        return "This is an automated audit test message. Please ignore."

    if any(w in label for w in ("search", "query", "find", "keyword")):
        return "test"

    if any(w in label for w in ("price", "cost", "salary", "budget", "revenue")):
        return "100"

    if tag == "textarea":
        return "Automated audit test content."

    # ── Fallback ─────────────────────────────────────────────────────────────
    return "test-audit-value"
```

---

#### Form Submission Engine

For each detected form, fill every field, submit, and capture everything
that happens — validation errors, network calls, navigation, success/error states.

```python
def audit_form(page, form: dict, route: str, base_url: str,
               path: list, depth: int) -> dict:
    """
    Fill all fields in a form, submit it, and record the outcome.
    Returns a result dict compatible with the DFS result format.
    """
    result = {
        "path": " > ".join(path + ["[form]"]),
        "type": "form",
        "fields_found": len(form["fields"]),
        "fields_filled": 0,
        "field_results": [],
        "submit_clicked": False,
        "outcome": None,         # "success" | "validation_error" | "network_error" | "nav" | "unknown"
        "outcome_detail": None,
        "network_calls": [],
        "console_errors": [],
        "screenshot_before": None,
        "screenshot_after": None,
        "status": None,
    }

    current_url = page.url
    console_errors = []
    network_calls  = []

    page.on("console", lambda m: console_errors.append(m.text()) if m.type == "error" else None)
    page.on("response", lambda r: network_calls.append({
        "url": r.url, "status": r.status, "method": r.request.method
    }) if r.request.resource_type in ("xhr", "fetch") else None)

    # ── Screenshot before ───────────────────────────────────────────────────
    shot_before = f"/tmp/audit/forms/{route.replace('/','_')}_form_before.png"
    page.screenshot(path=shot_before)
    result["screenshot_before"] = shot_before

    # ── Fill every field ────────────────────────────────────────────────────
    for field in form["fields"]:
        value = generate_value(field)
        if value is None:
            result["field_results"].append({
                "label": field["label"], "type": field["type"], "skipped": True
            })
            continue

        selector = (field.get("selector") or
                    f'[placeholder="{field["placeholder"]}"]' if field.get("placeholder") else
                    field["tag"])
        field_result = {"label": field["label"], "type": field["type"],
                        "value": value, "status": None, "error": None}
        try:
            loc = page.locator(selector).first
            if field["type"] in ("checkbox", "radio"):
                if value:
                    loc.check()
            elif field["tag"] == "select":
                loc.select_option(value=str(value))
            else:
                loc.clear()
                loc.fill(str(value))
                # Tab out to trigger onChange / blur validation
                loc.press("Tab")
                page.wait_for_timeout(200)

            field_result["status"] = "PASS"
            result["fields_filled"] += 1

            # Check for immediate inline validation error after fill
            # (look for sibling error elements appearing)
            inline_err = page.evaluate(f"""() => {{
                const el = document.querySelector('{selector.replace("'", "\'")}');
                if (!el) return null;
                const parent = el.closest('[class*="field"],[class*="form"],[class*="input"],[class*="group"]') || el.parentElement;
                const err = parent?.querySelector('[class*="error"],[class*="invalid"],[role="alert"]');
                return err ? err.innerText.trim() : null;
            }}""")
            if inline_err:
                field_result["inline_validation"] = inline_err
                field_result["status"] = "WARN"

        except Exception as e:
            field_result["status"] = "FAIL"
            field_result["error"] = str(e)

        result["field_results"].append(field_result)

    # ── Click submit ────────────────────────────────────────────────────────
    submit_btn = None
    if form["submits"]:
        s = form["submits"][0]
        submit_selector = (s.get("selector") or
                           f'button:has-text("{s["text"]}")' if s.get("text") else
                           "button[type=submit]")
        try:
            submit_btn = page.locator(submit_selector).first
        except Exception:
            submit_btn = None

    if not submit_btn:
        # Fallback: find any visible submit-like button
        submit_btn = page.locator(
            'button[type=submit], input[type=submit], button:has-text("Submit"),'
            'button:has-text("Save"), button:has-text("Send"), button:has-text("Create"),'
            'button:has-text("Register"), button:has-text("Sign Up"), button:has-text("Login"),'
            'button:has-text("Continue"), button:has-text("Next")'
        ).first

    if submit_btn and submit_btn.is_visible():
        # Screenshot the filled form before submitting
        shot_filled = f"/tmp/audit/forms/{route.replace('/','_')}_form_filled.png"
        page.screenshot(path=shot_filled)
        result["screenshot_before"] = shot_filled

        submit_btn.click()
        result["submit_clicked"] = True
        page.wait_for_load_state("networkidle", timeout=10000)

    # ── Capture outcome ─────────────────────────────────────────────────────
    shot_after = f"/tmp/audit/forms/{route.replace('/','_')}_form_after.png"
    page.screenshot(path=shot_after)
    result["screenshot_after"] = shot_after

    new_url = page.url
    result["console_errors"] = console_errors
    result["network_calls"] = [c for c in network_calls if c["status"] >= 200]

    # Classify what happened after submit
    body_text = page.evaluate("() => document.body.innerText").lower()

    if new_url != current_url:
        result["outcome"]        = "nav"
        result["outcome_detail"] = f"Navigated to {new_url}"
        result["status"]         = "PASS"

    elif any(w in body_text for w in (
        "success", "thank you", "submitted", "saved", "sent", "created", "registered"
    )):
        result["outcome"]        = "success"
        result["outcome_detail"] = "Success message detected in page content"
        result["status"]         = "PASS"

    elif any(w in body_text for w in (
        "error", "invalid", "required", "please fill", "cannot be blank",
        "is required", "not valid", "failed"
    )):
        result["outcome"]        = "validation_error"
        result["outcome_detail"] = "Validation error text detected"
        result["status"]         = "WARN"   # Validation working = good, but may reveal UX issues

    elif any(c["status"] >= 400 for c in network_calls):
        failed = [c for c in network_calls if c["status"] >= 400]
        result["outcome"]        = "network_error"
        result["outcome_detail"] = f"API returned {failed[0]['status']}: {failed[0]['url']}"
        result["status"]         = "FAIL"

    elif console_errors:
        result["outcome"]        = "unknown"
        result["outcome_detail"] = f"Console errors after submit: {console_errors[0]}"
        result["status"]         = "WARN"

    else:
        result["outcome"]        = "unknown"
        result["outcome_detail"] = "No success, error, or navigation detected — form may be broken"
        result["status"]         = "WARN"

    # ── Backtrack ───────────────────────────────────────────────────────────
    try:
        if new_url != current_url:
            page.go_back()
            page.wait_for_load_state("networkidle", timeout=6000)
        else:
            page.goto(f"{base_url}{route}")
            page.wait_for_load_state("networkidle")
    except Exception:
        page.goto(f"{base_url}{route}")
        page.wait_for_load_state("networkidle")

    return result
```

#### DFS Algorithm

```python
import re, json, hashlib

def fingerprint(el: dict) -> str:
    """Stable identity for an element regardless of ref number."""
    key = f"{el.get('role', '')}|{el.get('name', '')}|{el.get('selector', '')}"
    return hashlib.md5(key.encode()).hexdigest()[:12]

def dfs_explore(
    page,               # Playwright page object
    route: str,         # Current base route (for backtracking)
    base_url: str,
    visited: set,       # Global visited fingerprints for this route
    depth: int = 0,
    max_depth: int = 5, # Prevent runaway recursion on deeply nested UIs
    path: list = None,  # Breadcrumb trail of actions taken to reach here
    results: list = None
) -> list:
    """
    Depth-first exploration of all clickable elements.
    Returns list of interaction results.
    """
    if path is None: path = []
    if results is None: results = []
    if depth > max_depth:
        return results

    # ── Snapshot current state ──────────────────────────────────────────────
    page.wait_for_load_state("networkidle")
    snapshot_raw = page.evaluate("""() => {
        const walker = document.createTreeWalker(
            document.body, NodeFilter.SHOW_ELEMENT
        );
        const els = [];
        let node;
        while (node = walker.nextNode()) {
            const role = node.getAttribute('role') ||
                         node.tagName.toLowerCase();
            const name = node.getAttribute('aria-label') ||
                         node.innerText?.trim().slice(0, 60) || '';
            const tag  = node.tagName.toLowerCase();
            if (['button','a','input','select','textarea'].includes(tag) ||
                ['button','link','menuitem','tab','checkbox',
                 'radio','switch','combobox'].includes(role)) {
                els.push({
                    role, name, tag,
                    selector: node.id ? `#${node.id}` :
                              node.getAttribute('data-testid') ?
                              `[data-testid="${node.getAttribute('data-testid')}"]` : null,
                    href: node.href || null,
                    type: node.type || null,
                });
            }
        }
        return els;
    }""")

    # ── Form audit BEFORE element-by-element DFS ──────────────────────────
    # Forms are treated as atomic units: fill all fields + submit together.
    # This must run before the DFS loop so form fields appear "visited"
    # and don't get clicked individually out of context.
    if depth == 0:  # Only detect forms at top level, not inside revealed menus
        forms = detect_forms(page)
        for form_idx, form in enumerate(forms):
            form_path = path + [f"[form-{form_idx+1}]"]
            form_result = audit_form(page, form, route, base_url, form_path, depth)
            results.append(form_result)
            # Mark all form field fingerprints as visited so DFS skips them
            for field in form["fields"]:
                visited.add(fingerprint({
                    "role": field.get("tag", "input"),
                    "name": field.get("label", ""),
                    "selector": field.get("selector", ""),
                }))

    # Filter to unvisited, non-skip elements
    to_visit = []
    for el in snapshot_raw:
        fp = fingerprint(el)
        action = classify_element(el)
        if action == "skip":
            continue
        if fp in visited:
            continue
        to_visit.append((fp, el, action))

    # ── Visit each element (DFS order) ─────────────────────────────────────
    for fp, el, action in to_visit:
        if fp in visited:
            continue  # May have been added by a sibling's side-effect
        visited.add(fp)

        current_url = page.url
        current_path = path + [el.get("name") or el.get("role", "?")]
        result = {
            "path": " > ".join(current_path),
            "element": el,
            "depth": depth,
            "action": action,
            "status": None,
            "dom_changed": False,
            "url_changed": False,
            "new_elements_found": 0,
            "console_errors": [],
            "screenshot": None,
            "notes": [],
        }

        errors_during = []
        page.on("console", lambda m: errors_during.append(m.text())
                if m.type == "error" else None)
        page.on("pageerror", lambda e: errors_during.append(str(e)))

        try:
            # ── Perform the interaction ─────────────────────────────────────
            selector = (el.get("selector") or
                        f"[aria-label='{el['name']}']" if el.get("name") else
                        el["tag"])

            if action == "fill":
                # Individual fields inside the DFS are filled with typed data.
                # Full form submission is handled by audit_form() called BEFORE
                # the DFS loop (see "Form Detection & Grouping" above).
                # Here we just fill the field and tab out to trigger onChange.
                value = generate_value(el)
                if value and not isinstance(value, bool):
                    page.locator(selector).first.clear()
                    page.locator(selector).first.fill(str(value))
                    page.locator(selector).first.press("Tab")
                    page.wait_for_timeout(150)
                    result["status"] = "PASS"
                    result["notes"].append(f"filled with '{value}'")
                else:
                    result["status"] = "SKIP"
                    result["notes"].append("no suitable value generated")

            elif action == "select":
                options = el.get("options") or []
                non_empty = [o for o in options if o["value"] not in ("", None)]
                if non_empty:
                    page.locator(selector).first.select_option(value=non_empty[0]["value"])
                    result["status"] = "PASS"
                    result["notes"].append(f"selected '{non_empty[0]['text']}'")
                else:
                    result["status"] = "SKIP"
                    result["notes"].append("no selectable options")

            elif action == "check":
                page.locator(selector).first.check()
                page.wait_for_timeout(150)
                result["status"] = "PASS"
                result["notes"].append("checked")

            elif action == "click":
                page.locator(selector).first.click()
                page.wait_for_load_state("networkidle", timeout=8000)

                new_url = page.url
                result["url_changed"] = (new_url != current_url)

                # Screenshot the result state
                shot_name = f"{route.replace('/', '_')}__{'_'.join(current_path[-2:])}_d{depth}.png"
                shot_path = f"/tmp/audit/interactions/{shot_name}"
                page.screenshot(path=shot_path, full_page=False)
                result["screenshot"] = shot_path

                result["console_errors"] = errors_during
                result["status"] = "PASS" if not errors_during else "WARN"

                # ── Recurse into newly revealed elements ────────────────────
                snapshot_after = page.evaluate("() => document.body.innerText")
                if snapshot_after:  # page still has content
                    child_results = dfs_explore(
                        page, route, base_url, visited,
                        depth + 1, max_depth, current_path, []
                    )
                    result["new_elements_found"] = len(child_results)
                    results.extend(child_results)

        except Exception as e:
            result["status"] = "FAIL"
            result["notes"].append(f"Exception: {e}")

        finally:
            # ── Backtrack to pre-click state ────────────────────────────────
            try:
                if result.get("url_changed"):
                    # Navigated to a new route — go back
                    page.go_back()
                    page.wait_for_load_state("networkidle", timeout=6000)
                else:
                    # May have opened modal/drawer/dropdown — try Escape first
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(300)
                    # If URL is still wrong, hard-navigate back to route
                    if page.url != current_url:
                        page.goto(f"{base_url}{route}")
                        page.wait_for_load_state("networkidle")
            except Exception:
                # Last resort: re-navigate to the route
                page.goto(f"{base_url}{route}")
                page.wait_for_load_state("networkidle")

        results.append(result)

    return results
```

#### Checkpoint Integration for DFS

DFS state is checkpointed at the **element fingerprint** level, not just the
page level. This means a crash mid-exploration resumes from the last unvisited
element, not from the start of the page.

```python
# In .audit-checkpoint.json, each page entry gains a "visited_fps" list:
# "pages": {
#   "/dashboard": {
#     "status": "in_progress",
#     "visited_fps": ["a1b2c3d4e5f6", "9f8e7d6c5b4a", ...]
#   }
# }

def load_visited_fps(state: dict, route: str) -> set:
    """Restore the visited set from a previous interrupted run."""
    page_state = state.get("pages", {}).get(route, {})
    return set(page_state.get("visited_fps", []))

def save_visited_fps(state: dict, route: str, visited: set):
    state["pages"][route]["visited_fps"] = list(visited)
    save_checkpoint(state)

# In the audit loop, pass the restored set to dfs_explore:
visited = load_visited_fps(state, route)
results = dfs_explore(page, route, base_url, visited, depth=0)
save_visited_fps(state, route, visited)
```

#### DFS Guard Rails

These prevent the explorer from getting stuck or going rogue:

| Guard | Value | Reason |
|---|---|---|
| `max_depth` | 5 | Prevents infinite nesting in recursive UIs |
| `max_elements_per_page` | 200 | Bail out on pages with huge element counts |
| Element click timeout | 8s | Move on if a click stalls |
| Backtrack timeout | 6s | Don't block the loop on a bad back-navigation |
| Skip external URLs | regex | Don't leave the app |
| Skip destructive patterns | regex | Don't log out / delete data |
| Escape before backtrack | always | Close modals/menus before re-snapshotting |

#### What DFS Discovers That Surface Scans Miss

- Dropdown menu items (click dropdown → see options → click each option)
- Tab panel content (click tab → new panel renders → audit panel contents)
- Accordion sections (click header → content expands → check content)
- Modal contents (click trigger → modal appears → audit all modal buttons)
- Nested navigation (sidebar item → sub-menu appears → click each sub-item)
- Wizard/stepper steps (click Next → new step → audit step elements)
- Context menus (right-click or kebab menu → options appear)
- Hover-reveal elements (hover → tooltip/popover → check for links inside)

#### DFS Result Recording Per Element

Each element visit produces a row in the per-page interaction table:

```markdown
### 2.6 Element Exploration (DFS)

**Elements discovered**: 47  
**Elements visited**: 44  
**Skipped (external/destructive)**: 3  
**Max depth reached**: 3

| Path | Element | Action | Status | DOM Changed | New Elements | Notes |
|---|---|---|---|---|---|---|
| Header > Nav > Dropdown | button "Products" | click | ✅ PASS | yes | 6 | revealed submenu |
| Header > Nav > Dropdown > Products submenu | link "Pricing" | click | ✅ PASS | yes | 0 | navigated, back OK |
| Header > Nav > Dropdown > Products submenu | link "Enterprise" | click | ✅ PASS | yes | 0 | navigated, back OK |
| Main > Hero | button "Get Started" | click | ✅ PASS | yes | 0 | navigated to /signup |
| Main > FAQ | button "What is X?" | click | ✅ PASS | yes | 3 | accordion expanded |
| Main > FAQ > What is X? | link "Learn more" | click | ❌ FAIL | no | 0 | 404 response |
| Footer > Newsletter | input "Email" | fill | ✅ PASS | no | 0 | filled ok |
| Footer > Newsletter | button "Subscribe" | click | ⚠️ WARN | yes | 0 | console error on click |
```

**Expected**: all elements reachable, no crashes, no 404s on internal links,
DOM changes after click (or deliberate no-op with a note).

**Failure signals**:
- `status: FAIL` — exception thrown during interaction
- console errors triggered by a specific click
- URL navigates to 404 after a link click
- DOM does not change after clicking a button that should toggle/open something
- Backtrack fails (page stuck in wrong state)

### 2.7 Mobile Viewport Check

```bash
agent-browser set viewport 375 812
agent-browser open http://localhost:3000/<route>
agent-browser wait --load networkidle
agent-browser screenshot /tmp/audit/<page>_mobile.png --full
agent-browser set viewport 1280 720   # reset
```

Check for horizontal scroll, clipped content, overlapping elements.

---

## Phase 3 — Report Template

Generate one Markdown section per page. Assemble all sections into a single
`audit-report.md` file.

```markdown
## Page: <Route or Component Name>

**URL**: `http://localhost:3000/<route>`
**Source file**: `src/pages/<n>.tsx` (if known)
**Audit time**: <ISO timestamp>

### Summary

| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS / ❌ FAIL | |
| No console errors | ✅ PASS / ❌ FAIL | <error count> errors |
| No network failures | ✅ PASS / ❌ FAIL | <failed URLs> |
| Accessibility snapshot | ✅ PASS / ❌ FAIL | <element count> elements |
| DFS element exploration | ✅ PASS / ⚠️ WARN / ❌ FAIL | <visited>/<total>, depth <max>, <fail count> failed |
| Form interactions | ✅ PASS / ⚠️ WARN / ❌ FAIL | <N> forms found, outcomes: nav/success/validation_error/network_error |
| Mobile layout | ✅ PASS / ❌ FAIL / ⏭ SKIP | |

**Overall**: ✅ HEALTHY / ⚠️ WARNINGS / ❌ BROKEN

### Evidence

- Desktop screenshot: `screenshots/<page>_render.png`
- Mobile screenshot: `screenshots/<page>_mobile.png`
- Annotated screenshot: `screenshots/<page>_annotated.png`
- Interaction screenshots: `screenshots/interactions/<page>__<element>_d<N>.png`
- Form screenshots: `screenshots/forms/<page>_form_before.png`, `..._after.png`

---

### Action Narrative

> Plain-English log of every action taken on this page, in sequence.
> Written so a QA engineer can reproduce steps manually or paste directly
> into a defect ticket. Every step has an outcome — never left blank.

1. **Navigated** to `http://localhost:3000/<route>` and waited for network idle.
   → Page rendered with title "<page title>". No crash or error boundary detected.

2. **Scanned** page for interactive elements.
   → Found N elements: N buttons, N links, N inputs, N selects.

3. **Detected** N form(s) on the page.

4. **Form 1** — Filled 3 fields and submitted:
   - Typed `test.audit@example.com` into **Email** field (`#email`)
   - Typed `TestP@ssw0rd!` into **Password** field (`#password`)
   - Selected `Admin` from **Role** dropdown (`#role`)
   - Clicked **Submit** button
   → After submit: page navigated to `/dashboard`. Outcome: **success (nav)**.
   → Network: POST `/api/auth/login` returned 200.
   → No console errors during submission.

5. **Form 2** — Filled 1 field and submitted:
   - Typed `test` into **Search** field (`#search`)
   - Clicked **Search** button
   → After submit: validation error message appeared — "Please enter a valid search term".
   → Outcome: **validation_error** (client-side validation working).
   → Screenshot: `screenshots/forms/<page>_form2_after.png`

6. **Clicked** button **"Open Menu"** (depth 0)
   → Dropdown appeared with 4 new items: Dashboard, Settings, Theme, Billing.
   → No console errors. DOM updated as expected.

7. **Clicked** link **"Dashboard"** inside Open Menu (depth 1)
   → Navigated to `/dashboard`. Back navigation restored original page correctly.

8. **Clicked** link **"Settings"** inside Open Menu (depth 1)
   → Navigated to `/settings`. Back navigation restored original page correctly.

9. **Clicked** button **"Theme"** inside Open Menu (depth 1)
   → Page did not visibly change. Console error appeared:
   `TypeError: Cannot read properties of undefined (reading 'toggle')`
   → Outcome: **WARN** — handler is broken, theme toggle does nothing.
   → Screenshot: `screenshots/interactions/<page>__theme_d1.png`

10. **Clicked** link **"Billing"** inside Open Menu (depth 1)
    → Navigated to `/billing`. Server returned HTTP 404.
    → Outcome: **FAIL** — broken link, page does not exist.
    → Screenshot: `screenshots/interactions/<page>__billing_d1.png`

---

### Element Exploration Tree (DFS)

**Total elements found**: N | **Visited**: N | **Skipped**: N | **Failed**: N | **Max depth reached**: N

| # | Path | Element | Action | Result |
|---|---|---|---|---|
| 1 | Root > [form-1] | form (3 fields) | fill+submit | ✅ nav → /dashboard |
| 2 | Root > [form-1] > Email | input[email] | fill "test.audit@example.com" | ✅ accepted |
| 3 | Root > [form-1] > Password | input[password] | fill "TestP@ssw0rd!" | ✅ accepted |
| 4 | Root > [form-1] > Role | select | selected "Admin" | ✅ selected |
| 5 | Root > [form-2] | form (1 field) | fill+submit | ⚠️ validation_error |
| 6 | Root > [form-2] > Search | input[search] | fill "test" | ✅ accepted |
| 7 | Root | button "Open Menu" | click | ✅ revealed 4 items |
| 8 | Root > Open Menu | link "Dashboard" | click | ✅ navigated, back OK |
| 9 | Root > Open Menu | link "Settings" | click | ✅ navigated, back OK |
| 10 | Root > Open Menu | button "Theme" | click | ⚠️ console error |
| 11 | Root > Open Menu | link "Billing" | click | ❌ 404 |

---

### Issues Found

> Only populated if any check failed. Each issue is written to be directly
> paste-able into a QA defect ticket.

**[CRITICAL]** Billing link returns 404

- **Location**: `http://localhost:3000/<route>` → Open Menu → Billing link
- **Steps to reproduce**:
  1. Open `http://localhost:3000/<route>`
  2. Click "Open Menu" button in the top navigation
  3. Click the "Billing" link in the dropdown
- **Expected**: Billing page loads (HTTP 200)
- **Actual**: Server returned HTTP 404. Page not found.
- **Evidence**: `screenshots/interactions/<page>__billing_d1.png`
- **Severity**: Critical — user-facing broken link
- **Suggested fix**: Create the `/billing` route or remove the link from the menu

---

**[WARNING]** Theme toggle throws runtime error and does nothing

- **Location**: `http://localhost:3000/<route>` → Open Menu → Theme button
- **Steps to reproduce**:
  1. Open `http://localhost:3000/<route>`
  2. Click "Open Menu" button
  3. Click the "Theme" button
- **Expected**: Theme switches between light/dark mode
- **Actual**: Button click produces no visible change. Console error:
  `TypeError: Cannot read properties of undefined (reading 'toggle')`
- **Evidence**: `screenshots/interactions/<page>__theme_d1.png`
- **Severity**: Warning — feature is silently broken
- **Suggested fix**: Check that the theme context provider is correctly
  wrapping this component; verify `toggle` is defined before calling it
```

---

### Action Narrative — Code Generation

When writing the per-page report, generate the Action Narrative section
programmatically from the collected result objects:

```python
def generate_action_narrative(page_results: list[dict], route: str,
                               base_url: str) -> str:
    """
    Convert the list of audit result dicts into numbered plain-English steps.
    Each step describes what was done and what actually happened.
    """
    lines = ["### Action Narrative", ""]
    step = 1

    # Step 1: navigation
    lines.append(f"{step}. **Navigated** to `{base_url}{route}` and waited for network idle.")
    nav = next((r for r in page_results if r.get("type") == "nav_check"), {})
    if nav.get("status") == "PASS":
        lines.append(f"   → Page rendered with title "{nav.get('title', '')}". No crash detected.")
    else:
        lines.append(f"   → Page failed to render correctly: {nav.get('notes', ['unknown error'])[0]}")
    lines.append("")
    step += 1

    # Step 2: element scan summary
    scan = next((r for r in page_results if r.get("type") == "scan"), {})
    total = scan.get("total_elements", "?")
    lines.append(f"{step}. **Scanned** page for interactive elements.")
    lines.append(f"   → Found {total} elements.")
    lines.append("")
    step += 1

    # Forms
    forms = [r for r in page_results if r.get("type") == "form"]
    if forms:
        lines.append(f"{step}. **Detected** {len(forms)} form(s) on the page.")
        lines.append("")
        step += 1

        for fi, form in enumerate(forms, 1):
            lines.append(f"{step}. **Form {fi}** — Filled {form['fields_filled']}/{form['fields_found']} fields and submitted:")
            for fr in form.get("field_results", []):
                if fr.get("skipped"):
                    lines.append(f"   - Skipped **{fr['label']}** field (type: {fr['type']} — not fillable)")
                elif fr.get("status") == "PASS":
                    lines.append(f"   - Filled **{fr['label']}** with `{fr['value']}`")
                    if fr.get("inline_validation"):
                        lines.append(f"     ⚠️ Inline validation appeared: "{fr['inline_validation']}"")
                elif fr.get("status") == "FAIL":
                    lines.append(f"   - ❌ Failed to fill **{fr['label']}**: {fr['error']}")

            if form.get("submit_clicked"):
                lines.append(f"   - Clicked submit button")

            outcome = form.get("outcome", "unknown")
            detail  = form.get("outcome_detail", "")
            icon    = {"nav": "✅", "success": "✅", "validation_error": "⚠️",
                       "network_error": "❌", "unknown": "⚠️"}.get(outcome, "❓")
            lines.append(f"   → After submit: **{outcome}**. {detail}")

            # Network calls
            api_calls = form.get("network_calls", [])
            if api_calls:
                for c in api_calls[:3]:  # limit to 3
                    icon_c = "✅" if c["status"] < 400 else "❌"
                    lines.append(f"   → Network: {c['method']} `{c['url']}` returned {icon_c} {c['status']}")

            # Console errors
            if form.get("console_errors"):
                for err in form["console_errors"][:2]:
                    lines.append(f"   → Console error: `{err}`")

            if form.get("screenshot_after"):
                lines.append(f"   → Screenshot: `{form['screenshot_after']}`")
            lines.append("")
            step += 1

    # DFS interactions
    dfs_results = [r for r in page_results if r.get("type") not in
                   ("form", "nav_check", "scan", None) or r.get("action") in
                   ("click", "fill", "select", "check")]
    for r in dfs_results:
        action  = r.get("action", "interacted with")
        el      = r.get("element", {})
        el_desc = f"{el.get('role', el.get('tag', 'element'))} "{el.get('name', '')}""
        path    = r.get("path", "Root")
        depth   = r.get("depth", 0)
        status  = r.get("status", "UNKNOWN")
        notes   = "; ".join(r.get("notes", []))
        icon    = {"PASS": "✅", "WARN": "⚠️", "FAIL": "❌", "SKIP": "⏭"}.get(status, "❓")

        lines.append(f"{step}. **{action.title()}** {el_desc} at `{path}` (depth {depth})")

        if action == "fill":
            value = notes.replace("filled with ", "").strip("'")
            lines.append(f"   → Typed `{value}` into field.")

        elif action in ("select", "check"):
            lines.append(f"   → {notes}")

        elif action == "click":
            if r.get("url_changed"):
                lines.append(f"   → Page navigated to new URL. Returned via back navigation.")
            elif r.get("new_elements_found", 0) > 0:
                lines.append(f"   → {r['new_elements_found']} new element(s) became visible. Explored recursively.")
            else:
                lines.append(f"   → No navigation or DOM change detected.")

            if r.get("console_errors"):
                for err in r["console_errors"][:1]:
                    lines.append(f"   → Console error: `{err}`")

        lines.append(f"   → Outcome: {icon} {status}" + (f" — {notes}" if notes else ""))

        if r.get("screenshot"):
            lines.append(f"   → Screenshot: `{r['screenshot']}`")

        lines.append("")
        step += 1

    return "
".join(lines)
```

---

## Phase 4 — Report Assembly

After all pages are audited, generate a summary table at the top of the report:

```markdown
# Web App Audit Report

**Generated**: <timestamp>
**App**: <base URL>
**Pages audited**: <N>
**Total elements explored**: <N across all pages>

## Overall Health

| Page | Render | Console | Network | A11y | DFS Elements | Mobile | Status |
|---|---|---|---|---|---|---|---|
| /home | ✅ | ✅ | ✅ | ✅ | ✅ 23/23 | ✅ | ✅ HEALTHY |
| /dashboard | ✅ | ❌ | ✅ | ⚠️ | ⚠️ 41/44 | ❌ | ❌ BROKEN |
| /settings | ✅ | ✅ | ❌ | ✅ | ✅ 17/17 | ✅ | ⚠️ WARNING |

**Total**: X healthy, Y warnings, Z broken

---
<per-page sections below>
```

---

## Phase 4b — Defect Log Generation

After assembling the per-page report, generate a second output file:
`defect-log.md`. This file contains **only failures and warnings**, each
formatted as a standalone QA defect ticket. It is designed to be fed directly
to a QA engineer, a bug tracker import script, or another AI agent to triage
and assign defects.

### Defect Log Format

```markdown
# Defect Log

**Generated**: <timestamp>
**App**: <base URL>
**Audit session**: <session_id from checkpoint>
**Total defects**: N critical, N warnings

---

## DEF-001 — <Short title of defect>

**Severity**: CRITICAL / WARNING
**Page**: `<route>`
**Source file**: `src/pages/<n>.tsx` (if known)
**Component path**: <DFS breadcrumb e.g. "Root > Open Menu > Billing link">
**Detected at**: <ISO timestamp>

### Steps to Reproduce

1. Open `<full URL to the page>`
2. <Exact sequence of actions taken before the failure, in plain English>
3. <The specific action that triggered the failure>

### Test Data Used

| Field | Value |
|---|---|
| <field label> | `<value filled>` |
| <field label> | `<value filled>` |

> Only present for form-related defects. Omit for navigation/click defects.

### Expected Result

<What should have happened — inferred from the element's label, context,
and what a working version of this interaction would produce>

### Actual Result

<What actually happened — exact error message, HTTP status, console output,
or observable behaviour>

### Evidence

- Screenshot (before): `<path>`
- Screenshot (after): `<path>`
- Console error: `<exact log line if applicable>`
- Network call: `<METHOD URL → STATUS>`

### Suggested Fix

<One or two concrete, actionable sentences pointing at the likely root cause
and how to resolve it. Reference the file or component if known.>

---

## DEF-002 — ...
```

### Defect Log Code Generation

```python
def generate_defect_log(all_page_results: dict, state: dict,
                         base_url: str) -> str:
    """
    all_page_results: { route: [result dicts] }
    Returns the full defect-log.md content as a string.
    """
    import datetime

    defects = []
    defect_id = 1

    for route, results in all_page_results.items():
        source_file = guess_source_file(route)  # e.g. src/pages/dashboard.tsx

        for r in results:
            severity = None
            if r.get("status") == "FAIL":
                severity = "CRITICAL"
            elif r.get("status") == "WARN":
                severity = "WARNING"
            else:
                continue  # skip PASS / SKIP

            # Build steps to reproduce from the DFS path breadcrumb
            path_parts = r.get("path", "Root").split(" > ")
            steps = [f"Open `{base_url}{route}`"]
            for i, part in enumerate(path_parts[:-1]):
                steps.append(f"{'Click' if 'button' in part.lower() or 'link' in part.lower() else 'Interact with'} "{part}"")
            steps.append(_action_step(r))  # the triggering action

            # Expected vs actual
            expected = _infer_expected(r)
            actual   = _describe_actual(r)

            # Test data (for forms)
            test_data = []
            if r.get("type") == "form":
                for fr in r.get("field_results", []):
                    if not fr.get("skipped") and fr.get("value"):
                        test_data.append((fr["label"], fr["value"]))

            defects.append({
                "id":         f"DEF-{defect_id:03d}",
                "title":      _short_title(r),
                "severity":   severity,
                "route":      route,
                "source":     source_file,
                "path":       r.get("path", "Root"),
                "timestamp":  r.get("completed_at",
                              datetime.datetime.utcnow().isoformat() + "Z"),
                "steps":      steps,
                "test_data":  test_data,
                "expected":   expected,
                "actual":     actual,
                "screenshot_before": r.get("screenshot_before") or r.get("screenshot"),
                "screenshot_after":  r.get("screenshot_after"),
                "console_errors":    r.get("console_errors", []),
                "network_calls":     [c for c in r.get("network_calls", [])
                                      if c["status"] >= 400],
                "fix":        _suggest_fix(r),
            })
            defect_id += 1

    # Counts
    critical_count = sum(1 for d in defects if d["severity"] == "CRITICAL")
    warning_count  = sum(1 for d in defects if d["severity"] == "WARNING")

    lines = [
        "# Defect Log",
        "",
        f"**Generated**: {datetime.datetime.utcnow().isoformat()}Z",
        f"**App**: {base_url}",
        f"**Audit session**: {state.get('session_id', 'unknown')}",
        f"**Total defects**: {critical_count} critical, {warning_count} warnings",
        "",
        "---",
        "",
    ]

    for d in defects:
        lines += [
            f"## {d['id']} — {d['title']}",
            "",
            f"**Severity**: {d['severity']}",
            f"**Page**: `{d['route']}`",
        ]
        if d["source"]:
            lines.append(f"**Source file**: `{d['source']}`")
        lines += [
            f"**Component path**: {d['path']}",
            f"**Detected at**: {d['timestamp']}",
            "",
            "### Steps to Reproduce",
            "",
        ]
        for i, step in enumerate(d["steps"], 1):
            lines.append(f"{i}. {step}")
        lines.append("")

        if d["test_data"]:
            lines += [
                "### Test Data Used",
                "",
                "| Field | Value |",
                "|---|---|",
            ]
            for label, value in d["test_data"]:
                lines.append(f"| {label} | `{value}` |")
            lines.append("")

        lines += [
            "### Expected Result",
            "",
            d["expected"],
            "",
            "### Actual Result",
            "",
            d["actual"],
            "",
            "### Evidence",
            "",
        ]
        if d["screenshot_before"]:
            lines.append(f"- Screenshot (before): `{d['screenshot_before']}`")
        if d["screenshot_after"]:
            lines.append(f"- Screenshot (after): `{d['screenshot_after']}`")
        for err in d["console_errors"][:2]:
            lines.append(f"- Console error: `{err}`")
        for c in d["network_calls"][:2]:
            lines.append(f"- Network: {c['method']} `{c['url']}` → {c['status']}")
        lines += [
            "",
            "### Suggested Fix",
            "",
            d["fix"],
            "",
            "---",
            "",
        ]

    return "
".join(lines)


# ── Helper functions for defect log generation ──────────────────────────────

def _short_title(r: dict) -> str:
    """Generate a concise defect title from the result."""
    el   = r.get("element", {})
    name = el.get("name", "") or el.get("role", "element")
    path = r.get("path", "")
    errs = r.get("console_errors", [])
    calls = [c for c in r.get("network_calls", []) if c["status"] >= 400]

    if calls:
        return f"{name} — {calls[0]['method']} returns HTTP {calls[0]['status']}"
    if errs:
        # Shorten the error message to first 60 chars
        short_err = errs[0][:60].rstrip()
        return f"{name} — runtime error: {short_err}"
    if r.get("outcome") == "unknown":
        return f"Form submit on {path} — no visible outcome"
    return f"{name} — unexpected behaviour on interaction"


def _action_step(r: dict) -> str:
    """Describe the single triggering action in plain English."""
    action = r.get("action", "interact")
    el     = r.get("element", {})
    name   = el.get("name", "") or el.get("role", "element")
    notes  = "; ".join(r.get("notes", []))

    if action == "click":
        return f"Click "{name}""
    if action == "fill":
        value = notes.replace("filled with ", "").strip("'"")
        return f"Type `{value}` into "{name}" field"
    if action == "select":
        return f"Select an option from "{name}" dropdown"
    if action == "check":
        return f"Check the "{name}" checkbox"
    if r.get("type") == "form":
        return "Click the submit button"
    return f"Interact with "{name}""


def _infer_expected(r: dict) -> str:
    """Infer expected behaviour from element context."""
    el     = r.get("element", {})
    name   = (el.get("name", "") or "").lower()
    action = r.get("action", "")
    role   = el.get("role", "") or el.get("tag", "")
    outcome = r.get("outcome", "")

    if role == "link" or (role == "button" and "link" in name):
        return "Clicking the link should navigate to the target page with HTTP 200."
    if role == "button" and outcome == "unknown":
        return ("Clicking the button should produce a visible change — "
                "navigation, a modal, a state toggle, or a success/error message.")
    if r.get("type") == "form":
        return ("Filling all required fields with valid data and submitting the form "
                "should result in either: (a) navigation to a success page, "
                "(b) a visible success message on the same page, or "
                "(c) a clear validation error message if the data is rejected.")
    if action in ("fill", "select", "check"):
        return f"The field should accept the provided value without errors."
    return "The interaction should complete successfully without errors or broken states."


def _describe_actual(r: dict) -> str:
    """Describe what actually happened in plain English."""
    errs   = r.get("console_errors", [])
    calls  = [c for c in r.get("network_calls", []) if c["status"] >= 400]
    notes  = "; ".join(r.get("notes", []))
    outcome = r.get("outcome", "")
    detail  = r.get("outcome_detail", "")

    parts = []
    if outcome == "network_error" and calls:
        parts.append(f"The API call returned HTTP {calls[0]['status']} ({calls[0]['url']}). "
                     f"The server rejected the request.")
    elif outcome == "unknown":
        parts.append("After the interaction, no navigation, success message, or error "
                     "message appeared. The page appeared unchanged, suggesting the "
                     "handler is broken or silently failing.")
    elif outcome == "validation_error":
        parts.append(f"Client-side validation rejected the submission: {detail}")
    elif r.get("status") == "FAIL" and notes:
        parts.append(f"The interaction threw an exception: {notes}")
    else:
        parts.append(detail or notes or "Unexpected behaviour — see screenshot for details.")

    if errs:
        parts.append(f"Console error logged: `{errs[0]}`")

    return " ".join(parts)


def _suggest_fix(r: dict) -> str:
    """Generate an actionable fix suggestion."""
    errs   = r.get("console_errors", [])
    calls  = [c for c in r.get("network_calls", []) if c["status"] >= 400]
    outcome = r.get("outcome", "")
    el     = r.get("element", {})
    name   = (el.get("name", "") or "").lower()

    if calls and calls[0]["status"] == 404:
        return (f"The target route does not exist on the server. "
                f"Either create the missing page/API endpoint at `{calls[0]['url']}`, "
                f"or remove the link/button that points to it.")
    if calls and calls[0]["status"] == 401:
        return ("The request is missing authentication. Verify that the auth token "
                "is attached to the request headers, and that the user session is "
                "valid before this interaction is reachable.")
    if calls and calls[0]["status"] == 422:
        return ("The server rejected the submitted data. Check that all required fields "
                "are present and correctly formatted. Review the server validation schema "
                "and align it with what the form sends.")
    if calls and calls[0]["status"] >= 500:
        return ("The server threw an internal error. Check server logs for the stack "
                "trace. This is likely an unhandled exception in the API handler.")
    if errs and "undefined" in errs[0].lower():
        return ("A JavaScript runtime error occurred — likely a missing null check. "
                "Add optional chaining (`?.`) before the failing property access, "
                "and verify that the relevant context/store is initialised before "
                "this component renders.")
    if outcome == "unknown":
        return ("The submit handler is not producing any observable result. "
                "Verify that the onClick/onSubmit handler is correctly wired, "
                "that any async operation is awaited, and that success/error "
                "states update the UI.")
    return ("Review the component at the path listed above. Check event handler "
            "wiring, prop types, and that all required context providers wrap "
            "this component in the render tree.")


def guess_source_file(route: str) -> str | None:
    """Best-guess TSX source file from route string."""
    import os
    slug = route.strip("/").replace("/", "_") or "index"
    candidates = [
        f"src/pages/{slug}.tsx",
        f"src/app/{route.strip('/')}/page.tsx",
        f"src/views/{slug}.tsx",
        f"src/screens/{slug}.tsx",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None
```

---

## Phase 5 — Playwright Test Generation (Optional)

After the audit, optionally generate a reusable `audit.spec.ts` file that
encodes all passing checks as assertions, so they become a regression suite:

```typescript
// audit.spec.ts — AUTO-GENERATED by web-app-auditor skill
import { test, expect } from '@playwright/test';

const PAGES = [
  { route: '/', title: 'Home' },
  { route: '/dashboard', title: 'Dashboard' },
  // ...
];

for (const { route, title } of PAGES) {
  test(`${title} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`http://localhost:3000${route}`);
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
    await expect(page).not.toHaveTitle(/404|error/i);
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });
}
```

---

## Execution Workflow (Step-by-Step)

```
1. Receive task from user (app URL or directory path)

2. Check for existing checkpoint at /tmp/audit/.audit-checkpoint.json
   - FOUND & incomplete → print resume summary, skip to step 5
   - FOUND & all done   → notify user, offer to re-run from scratch
   - NOT FOUND          → fresh start, continue to step 3

3. Check if server is running:
   - YES → skip to step 4
   - NO  → run: python scripts/with_server.py --help, then start server

4. Run route discovery (Phase 1)
   Create /tmp/audit/ directory for screenshots
   Initialise .audit-checkpoint.json with all routes as "pending"

5. For each route in checkpoint order:
   a. If status == "done"       → print "⏭ skipping" and continue
   b. If status == "in_progress"→ treat as pending (crashed last time), retry
   c. If status == "pending"    → mark "in_progress", run Phase 2 checks
   d. On success                → append page section to report (Phase 3)
                                  mark "done" in checkpoint
   e. On failure/exception      → mark back to "pending", log error, continue

6. After all pages done:
   Regenerate summary table at top of report (Phase 4)
   Mark checkpoint as finished

7. Save report as audit-report.md in /mnt/user-data/outputs/
8. Generate defect-log.md from all FAIL/WARN results (Phase 4b)
   Save to /mnt/user-data/outputs/defect-log.md
9. Copy all screenshots to /mnt/user-data/outputs/screenshots/
10. Optionally generate audit.spec.ts (Phase 5)
11. Present both audit-report.md and defect-log.md to user
    Inform user: "Delete .audit-checkpoint.json to re-run from scratch"
```

---

## Common Failure Patterns & Remediation

| Pattern | Likely Cause | Suggested Fix |
|---|---|---|
| Blank page, no snapshot elements | JS bundle error, missing env var | Check browser console, verify .env |
| Console errors: "Cannot read properties of undefined" | Missing null check | Add optional chaining `?.` |
| Network 401 on API calls | Auth token not set | Check auth context/provider wrapping |
| Network 404 on API calls | Wrong base URL or env var | Check VITE_API_URL / NEXT_PUBLIC_ vars |
| Mobile layout broken | Missing responsive CSS | Add `overflow-x: hidden`, check flex-wrap |
| Hydration errors | Server/client HTML mismatch | Check conditional rendering tied to window |
| Empty accessibility snapshot | App not rendering to DOM | Confirm React mounted, check Suspense fallbacks |
| Interaction causes no DOM change | Event handler not connected | Check onClick wiring, state updates |
| Form submit → outcome "unknown" | No success/error feedback rendered | Add visible success state or error boundary |
| Form submit → network_error 422 | Server validation rejecting test data | Check required field formats, add server-side error display |
| Form submit → network_error 401 | Auth token missing on submit | Verify auth header is attached to form POST request |
| Form submit → validation_error on every field | Overly strict client validation | Review required fields; ensure all are fillable without auth |
| Inline validation fires before user finishes typing | Validation on change not blur | Debounce validation or move to onBlur |
| Select has no non-empty options | Options loaded async and not yet ready | Add loading state; wait for options before enabling select |
| fill "FAIL" — element not interactable | Field is disabled or hidden by CSS | Check disabled/readonly state and conditional rendering |

---

## Output Files

| File | Description |
|---|---|
| `audit-report.md` | Full per-page audit report with Action Narrative (appended incrementally) |
| `defect-log.md` | QA-ready defect tickets for every FAIL and WARN — paste directly into bug tracker |
| `.audit-checkpoint.json` | Resume state — tracks done/pending/in-progress per page |
| `screenshots/<page>_render.png` | Desktop full-page screenshot |
| `screenshots/<page>_mobile.png` | Mobile viewport screenshot |
| `screenshots/<page>_annotated.png` | Annotated interactive elements |
| `screenshots/forms/<page>_form_before.png` | Form filled, before submit |
| `screenshots/forms/<page>_form_after.png` | Page state immediately after submit |
| `screenshots/interactions/<page>__<element>_d<N>.png` | Per-click DFS interaction state |
| `audit.spec.ts` | (Optional) Playwright regression suite |

---

## Notes

- Always `agent-browser close` or `browser.close()` after each audit session
- Use `--session audit-<pagename>` with agent-browser to avoid session conflicts
  when auditing multiple pages concurrently
- For TSX component-level testing (not full pages), use Playwright's
  component testing mode (`@playwright/experimental-ct-react`)
- If `scripts/with_server.py` is available, always prefer it over manual
  server management — it handles port conflicts and teardown automatically
- Never hardcode localhost ports; detect from `with_server.py` output or
  from the user's running dev server
