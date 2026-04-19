---
name: playwright-tsx
description: >
  Generate comprehensive, production-ready Playwright test scripts (.spec.ts) by statically
  analysing any React TSX/JSX component file. Use this skill whenever the user wants to: write
  Playwright tests for a React component, generate e2e or component tests from a .tsx or .jsx file,
  create positive and negative test cases from a component, auto-detect selectors from JSX markup,
  scaffold a Playwright spec file from source code, or audit a component for testability gaps.
  Trigger even for casual phrasing: "write tests for my component", "generate playwright spec",
  "create test cases for this tsx", "make e2e tests", or when the user pastes/uploads a React
  component and asks for tests — even if they don't say "Playwright" explicitly.
---

# Playwright TSX Test Generator

Given any `.tsx` / `.jsx` React component, produce a complete, runnable Playwright test suite
covering **positive** (happy-path) and **negative** (error/edge-case) scenarios — purely by reading
the source code, without running it.

---

## Step 0 — Obtain the Component Source

- If the user **uploaded** a file → read it from `/mnt/user-data/uploads/`
- If they **pasted code** inline → use that directly
- If neither → ask for the component source before doing anything else

---

## Step 1 — Detect Selector Mode

Before analysing elements, determine which **Selector Mode** applies and announce it to the user:

| Mode | Condition | Behaviour |
|---|---|---|
| **🟢 Strict** | Component has `data-testid` / `data-cy` / `data-test` on most interactive elements | Prefer test-id selectors; use semantic fallbacks only where testids are absent |
| **🟡 Best-Guess** | Component has few or no test attributes | Use semantic selectors (role, label, placeholder, text); add `// ⚠ TODO` comments for every fragile selector |

Announce at the top of the analysis: `// Selector mode: STRICT` or `// Selector mode: BEST-GUESS`.

---

## Step 2 — Static Analysis

Work through the component top-to-bottom. Build an internal inventory across all sections below.
Write `none` for any section with no findings.

### 2A. Element Inventory

Scan for every interactive or conditional element and record the **best available Playwright locator**
using the priority ladder in Step 3.

| Element type | What to look for |
|---|---|
| **Inputs / Textareas** | `<input>`, `<textarea>`, controlled `value + onChange` |
| **Selects / Comboboxes** | `<select>`, Radix/shadcn Select, Headless UI Listbox |
| **Buttons / CTAs** | `<button>`, `role="button"`, icon-only buttons |
| **Links** | `<a href>`, React Router `<Link>`, Next.js `<Link>` |
| **Checkboxes / Radios / Switches** | `<input type="checkbox/radio">`, Radix Switch |
| **ARIA roles** | `role="dialog"`, `role="alert"`, `role="status"`, `aria-label` |
| **Headings / Labels** | `<h1–h6>`, `<label htmlFor>`, `aria-labelledby` |
| **Images** | `<img alt>`, SVG with `title` |
| **Conditional renders** | `{cond && <X>}`, `{cond ? <A> : <B>}` — note both branches |
| **Error states** | Error message elements, className toggling, `role="alert"` |
| **Loading states** | `isLoading` prop/state, spinner elements, button `disabled` during fetch |
| **Lists / Tables** | `.map(…)` rendering — derive empty-state AND populated-state tests |
| **Modals / Dialogs** | Conditional overlay, `role="dialog"`, `aria-modal` |
| **Toasts / Notifications** | `role="status"`, toast libraries |
| **File inputs** | `<input type="file">` |

### 2B. Props & State Analysis

- **Required props** — generate valid test data for each; their absence → negative test.
- **Optional props with defaults** — test with and without.
- **Callback props** (`onSubmit`, `onChange`, `onClose`, `onSuccess`, etc.) — plan `page.exposeFunction` spy to verify they fire.
- **Validation logic** — every `if (!value)`, regex test, `minLength`, `maxLength`, `required`, `pattern` attribute → one negative test each.
- **`disabled={…}` conditions** — derive disabled-state negative tests.

### 2C. Async Behaviour

Scan for `useEffect`, `fetch`, `axios`, `useSWR`, `React Query`, `async/await` → plan:
- `page.route(…)` mock for happy-path success
- `page.route(…, route => route.fulfill({ status: 500 }))` for server error
- `page.route(…, route => route.abort('failed'))` for network failure
- Delay mock (`setTimeout`) to test loading/spinner states

### 2D. Routing / Navigation

If `useNavigate`, `router.push`, `<Link to>`, `<Link href>` present → note expected URLs so tests
can assert `page.waitForURL(…)` / `expect(page.url()).toContain(…)`.

### 2E. Accessibility Signals

- `role="alert"` on error messages → assert `getByRole('alert')`
- `aria-live` regions → assert they update after action
- Focus management (e.g., modal open → focus trapped) → add focus assertion test
- `toMatchAriaSnapshot()` for regression coverage on key regions

---

## Step 3 — Selector Priority Ladder

For every element found in Step 2, apply the **first rule that matches**:

```
Priority 1 — data-testid / data-cy / data-test
  → page.getByTestId('value')

Priority 2 — ARIA role + accessible name
  → page.getByRole('button', { name: /submit/i })
  → page.getByRole('textbox', { name: 'Email address' })

Priority 3 — <label htmlFor> or aria-label
  → page.getByLabel('Email address')

Priority 4 — placeholder attribute
  → page.getByPlaceholder('Enter your email')

Priority 5 — unique visible text
  → page.getByText('Forgot password?')

Priority 6 — alt text (images)
  → page.getByAltText('Profile picture')

Priority 7 — CSS class / nth / locator (LAST RESORT)
  → page.locator('.submit-btn')
  // ⚠ Fragile — add data-testid="submit-btn" to the component
```

**Rules:**
- Never invent a selector that doesn't exist in the source — if none fits, output a `// TODO` comment.
- Never use positional XPath or raw nth-child unless absolutely unavoidable.
- When using Priority 5–7, always add: `// ⚠ Selector mode: BEST-GUESS — add data-testid="…"`

---

## Step 4 — Test Case Design

### Positive tests (always generate)

| Scenario | What to assert |
|---|---|
| Component renders with default/valid props | Key elements visible and enabled |
| All interactive elements are visible | Each button, input, link present |
| Main user flow (form submit, button click, toggle) | Success state, URL change, callback fired |
| State transitions | loading → success, closed → open modal, etc. |
| Conditional branch = TRUE | The conditional element is visible |
| List/table with data | Rows/items render correctly |
| Navigation | `page.url()` contains expected path |

### Negative tests (generate for every failure mode found in Step 2)

| Failure mode | Source signal | What to assert |
|---|---|---|
| Empty required field | `required`, `if (!value)` | Field-level error visible |
| Invalid format | `type="email"`, regex | Error message or `validity.typeMismatch` |
| Boundary value (off-by-one) | `minLength`, `maxLength`, `min`, `max` | Error at N±1 |
| All fields empty on submit | Any form | First/all error messages appear |
| Server error (500) | `fetch` / API call | Error UI shown, button re-enabled |
| Network failure | `fetch` / API call | Error UI shown, no crash |
| Disabled state | `disabled={…}` | Button is `toBeDisabled()`, cannot interact |
| Conditional branch = FALSE | `{cond && <X>}` | Element is `not.toBeAttached()` |
| Double-submit prevention | `isLoading` disables button | Button stays disabled during in-flight request |
| HTML5 native validation | `type="email"`, `required` | `toHaveJSProperty('validity.typeMismatch', true)` |

---

## Step 5 — Output Format

Produce output in this exact order:

### 5A. Analysis Summary (in chat, before the code)

A compact table:

| Category | Findings |
|---|---|
| Selector mode | STRICT / BEST-GUESS |
| Interactive elements | List them (email input, password input, submit button…) |
| Validation rules | List them (email required, password min 8…) |
| Conditional branches | List them |
| Async calls | List them |
| Positive tests | N |
| Negative tests | N |

### 5B. The `.spec.ts` file (code artifact)

Use this scaffold — fill in every section from the analysis:

```typescript
import { test, expect, Page } from '@playwright/test';

// ── Selector mode: STRICT | BEST-GUESS ────────────────────────────────────
// ── Component: <ComponentName /> ──────────────────────────────────────────

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

/** Navigate to the page/route that mounts <ComponentName />.
 *  TODO: Adjust the path to match your app's routing. */
async function goto(page: Page) {
  await page.goto(`${BASE_URL}/<route>`);
}

test.beforeEach(async ({ page }) => {
  await goto(page);
});

// ══════════════════════════════════════════════════════════════════════════
// POSITIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('<ComponentName /> — positive', () => {

  test('renders all key elements', async ({ page }) => {
    // … assertions …
  });

  test('happy-path: <main flow>', async ({ page }) => {
    await test.step('arrange: mock API', async () => { /* … */ });
    await test.step('act: fill form and submit', async () => { /* … */ });
    await test.step('assert: success state', async () => { /* … */ });
  });

  // … more positive tests …
});

// ══════════════════════════════════════════════════════════════════════════
// NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('<ComponentName /> — negative', () => {

  test.describe('Validation', () => {
    test('empty required field shows error', async ({ page }) => {
      // WHY: <field> has required / if(!value) guard
      // …
    });
  });

  test.describe('Network errors', () => {
    test('server 500 shows error UI', async ({ page }) => {
      // WHY: fetch returns non-ok → error state rendered
      await page.route('**/api/…', route => route.fulfill({ status: 500 }));
      // …
    });
  });

});

/**
 * ═══════════════════════════════════════════════════════
 * 🔧 IMPLEMENTATION CHECKLIST
 * ═══════════════════════════════════════════════════════
 * Add these data-testid attributes to <ComponentName /> to
 * make every selector bulletproof:
 *
 * [ ] <element>  →  data-testid="…"
 */
```

**Code rules:**
- Every `test(…)` body is `async ({ page }) => { … }` — no exceptions.
- Use `test.step('label', async () => { … })` for complex multi-action flows.
- Prefer `await expect(locator).toBeVisible()` over `waitForSelector`.
- Every negative test must have a `// WHY:` comment explaining the failure mode.
- Group negatives by area: `Validation`, `Network errors`, `Disabled states`, `Edge cases`.
- If Priority 4–7 selector used: `// ⚠ BEST-GUESS selector — add data-testid="…"`.
- Never omit `await` on any Playwright call.

### 5C. Implementation Checklist (after the code, in chat)

List every `data-testid` the developer should add to make all selectors robust:

```
🔧 Implementation Checklist — add these to <ComponentName />.tsx:
[ ] <input type="email" />                    → add data-testid="email-input"
[ ] <input type="password" />                 → add data-testid="password-input"
[ ] <button type="submit">Sign in</button>    → add data-testid="signin-button"
```

Also list:
- Business logic that **cannot** be inferred from TSX alone (e.g., server-side validation messages)
- API contracts / response shapes needed to write complete mocks
- Props that require custom test harness setup (e.g., router context, auth context)

---

## Reference Patterns

For ready-made Playwright snippets for common React patterns — read `references/patterns.md`.
Covers: RHF/Formik, React Query/SWR, shadcn/ui, Radix UI, Next.js/React Router navigation,
file upload, toast, modal, controlled inputs, callback spies, accessibility snapshots.

---

## Quality Gate

Before producing any output, verify internally:

- [ ] Selector mode declared (STRICT or BEST-GUESS)
- [ ] At least one positive test per user-facing feature
- [ ] At least one negative test per validation rule / error state / disabled state
- [ ] All async API calls mocked via `page.route`
- [ ] Both branches of every conditional render tested
- [ ] Empty / null / zero states tested for lists and async data
- [ ] All `async` Playwright calls `await`ed — no fire-and-forget
- [ ] No raw XPath or nth positional selectors unless commented as last resort
- [ ] Implementation checklist populated with every missing `data-testid`
- [ ] The output TypeScript is syntactically valid
