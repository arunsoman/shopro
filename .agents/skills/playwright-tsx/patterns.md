# Playwright Patterns for Common React Patterns

Quick-reference snippets. Copy and adapt into generated test files.

---

## Controlled Inputs (useState / value + onChange)

```typescript
// Fill a controlled text input
await page.getByLabel('Email').fill('user@example.com');

// Clear and re-fill
await page.getByLabel('Email').clear();
await page.getByLabel('Email').fill('new@example.com');

// Assert current value
await expect(page.getByLabel('Email')).toHaveValue('user@example.com');
```

---

## React Hook Form / Formik

Both libraries render standard HTML inputs — use semantic selectors normally.
Error messages are typically rendered adjacent to the field:

```typescript
// Submit empty form
await page.getByRole('button', { name: 'Submit' }).click();

// Assert RHF / Formik error message (usually a <p> or <span> near the field)
await expect(page.getByText('Email is required')).toBeVisible();
await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
```

---

## Select / Dropdown (native `<select>`)

```typescript
await page.getByLabel('Country').selectOption('India');
await expect(page.getByLabel('Country')).toHaveValue('IN');
```

## Custom Dropdown (Radix UI / Headless UI / shadcn Select)

```typescript
// Open the trigger
await page.getByRole('combobox', { name: 'Country' }).click();
// Click the option in the listbox
await page.getByRole('option', { name: 'India' }).click();
// Assert displayed value
await expect(page.getByRole('combobox', { name: 'Country' })).toHaveText('India');
```

---

## Checkbox & Radio

```typescript
// Check
await page.getByRole('checkbox', { name: 'Remember me' }).check();
await expect(page.getByRole('checkbox', { name: 'Remember me' })).toBeChecked();

// Radio
await page.getByRole('radio', { name: 'Credit card' }).click();
await expect(page.getByRole('radio', { name: 'Credit card' })).toBeChecked();
```

---

## File Upload

```typescript
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('./fixtures/sample.pdf');
// Assert preview or file name appears
await expect(page.getByText('sample.pdf')).toBeVisible();
```

---

## Modal / Dialog (Radix Dialog / MUI Dialog / custom)

```typescript
// Open
await page.getByRole('button', { name: 'Open modal' }).click();
const dialog = page.getByRole('dialog');
await expect(dialog).toBeVisible();

// Interact inside
await dialog.getByRole('button', { name: 'Confirm' }).click();

// Assert closed
await expect(dialog).not.toBeVisible();
```

---

## Toast / Snackbar Notifications

```typescript
// After action, wait for toast
await page.getByRole('button', { name: 'Save' }).click();
const toast = page.getByRole('status'); // or getByTestId('toast')
await expect(toast).toBeVisible();
await expect(toast).toHaveText(/saved successfully/i);
```

---

## Loading / Spinner States

```typescript
// Click action that triggers loading
await page.getByRole('button', { name: 'Load data' }).click();

// Assert spinner visible
await expect(page.getByRole('progressbar')).toBeVisible(); // or getByTestId('spinner')

// Wait for it to disappear
await expect(page.getByRole('progressbar')).not.toBeVisible();

// Assert final content
await expect(page.getByRole('table')).toBeVisible();
```

---

## Network Mocking (fetch / axios)

```typescript
// Mock successful response
await page.route('**/api/users', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Alice' }]),
  });
});

// Mock error
await page.route('**/api/users', route => route.fulfill({ status: 500 }));

// Mock network failure (timeout / offline)
await page.route('**/api/users', route => route.abort('failed'));
```

---

## React Query / SWR Data Fetching

Mock at the network layer (above). Then assert:

```typescript
// Wait for data to render
await expect(page.getByRole('row', { name: /Alice/ })).toBeVisible();

// Empty state
await page.route('**/api/users', route => route.fulfill({ status: 200, body: '[]' }));
await page.reload();
await expect(page.getByText('No users found')).toBeVisible();
```

---

## Next.js Navigation (useRouter / Link)

```typescript
// Click a Next.js <Link> and assert URL
await page.getByRole('link', { name: 'Go to profile' }).click();
await page.waitForURL('**/profile');
expect(page.url()).toContain('/profile');

// Programmatic navigation via button
await page.getByRole('button', { name: 'Back to home' }).click();
await page.waitForURL('**/');
```

---

## React Router v6 (useNavigate / <Link>)

Same approach — assert `page.url()` after interaction.

---

## Conditional Rendering Patterns

### `{condition && <Component />}`

```typescript
// When condition is FALSE — element must not exist in DOM
await expect(page.getByTestId('error-banner')).not.toBeAttached();

// When condition is TRUE — element must be visible
await expect(page.getByTestId('error-banner')).toBeVisible();
```

### Ternary `{isLoading ? <Spinner /> : <Content />}`

```typescript
// Intercept to delay response and assert loading state first
await page.route('**/api/data', async route => {
  await new Promise(r => setTimeout(r, 500));
  await route.continue();
});
await page.goto(BASE_URL);
await expect(page.getByTestId('spinner')).toBeVisible();
await expect(page.getByTestId('spinner')).not.toBeVisible({ timeout: 5000 });
```

---

## shadcn/ui Components

| Component | How to target |
|---|---|
| Button | `getByRole('button', { name: '…' })` |
| Input | `getByLabel('…')` or `getByPlaceholder('…')` |
| Select | `getByRole('combobox')` to open, `getByRole('option')` to pick |
| Checkbox | `getByRole('checkbox', { name: '…' })` |
| Switch | `getByRole('switch', { name: '…' })` |
| Tabs | `getByRole('tab', { name: '…' })`, then assert `tabpanel` |
| Alert Dialog | `getByRole('alertdialog')` |
| Tooltip | Hover trigger, assert `getByRole('tooltip')` |
| Accordion | `getByRole('button', { name: 'Section title' })` to expand |

---

## Disabled State Verification

```typescript
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
// Ensure clicking has no effect
await page.getByRole('button', { name: 'Submit' }).click({ force: true });
// Assert no navigation / state change occurred
```

---

## HTML5 Native Validation (type="email", required, etc.)

When a component relies on browser-native validation rather than custom error messages:

```typescript
// Check that the email input flagged a type mismatch
const emailInput = page.getByPlaceholder('Email'); // or getByLabel
await emailInput.fill('not-an-email');
await page.getByRole('button', { name: 'Sign In' }).click();
await expect(emailInput).toHaveJSProperty('validity.typeMismatch', true);

// Check that a required field is flagged as missing
await page.getByRole('button', { name: 'Sign In' }).click();
await expect(emailInput).toHaveJSProperty('validity.valueMissing', true);
```

---

## test.step — Structured Multi-Action Flows

Use `test.step` to make complex flows readable in Playwright reports:

```typescript
test('submits form and redirects to dashboard', async ({ page }) => {
  await test.step('arrange: mock login API', async () => {
    await page.route('**/api/login', route =>
      route.fulfill({ status: 200, body: JSON.stringify({ token: 'abc' }) })
    );
  });

  await test.step('act: fill and submit form', async () => {
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Sign In' }).click();
  });

  await test.step('assert: redirected to dashboard', async () => {
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
  });
});
```

---

## Accessibility Snapshot (bonus)

```typescript
// Assert ARIA snapshot for a region (useful for regression)
await expect(page.getByRole('form')).toMatchAriaSnapshot();
```

---

## Callback Prop Verification

When a component accepts an `onSubmit` or `onChange` prop, verify it was called:

```typescript
// Expose a function from the page so the component can call it
let callbackFired = false;
await page.exposeFunction('onSubmitCallback', () => { callbackFired = true; });

// In your test app / Storybook story, wire onSubmit={window.onSubmitCallback}
await page.getByRole('button', { name: 'Submit' }).click();
expect(callbackFired).toBe(true);
```
