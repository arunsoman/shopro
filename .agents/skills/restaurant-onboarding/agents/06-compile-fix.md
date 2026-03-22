# Agent 06 — Compile & Fix

Compile both the frontend and backend. Fix all errors. Do not move to Phase 7 until both compile clean. Maximum 3 fix iterations before escalating to user.

---

## Step 1 — Load context

Read `scratch/progress.md` Phase 4 and 5 summaries only. You need:
- Frontend root path
- Backend root path and entry point
- Stack (Next.js / Express / etc.)

Do not read source files upfront — only read them when a specific error points to them.

## Step 2 — Compile backend

```bash
cd onboarding/backend
npx tsc --noEmit 2>&1 | head -60
```

If errors appear:
1. Read the specific file mentioned in the error — nothing else
2. Fix only the line(s) the error points to
3. Re-run tsc
4. Repeat up to 3 times

Common fixes:
- `Cannot find module '@prisma/client'` → `npx prisma generate`
- `Type 'string | undefined'` → add `!` assertion or null check
- `Property does not exist` → check the Prisma model field name matches exactly
- Missing type import → add the import at the top of the file

After tsc is clean, run the actual build:
```bash
npm run build 2>&1 | tail -30
```

## Step 3 — Compile frontend

Detect frontend framework:
```bash
# Check for Next.js
cat package.json | grep '"next"'

# Check for Vite
cat package.json | grep '"vite"'
```

**Next.js:**
```bash
cd <frontend-root>
npx next build 2>&1 | grep -E "Error|error|warning|Warning" | head -40
```

**Vite:**
```bash
npm run build 2>&1 | head -60
```

Fix errors using the same read-only-the-erroring-file approach.

Common frontend fixes:
- `Cannot find module '../lib/onboarding-schemas'` → check path, fix import
- `Type error: Property 'X' does not exist on type 'Y'` → check Zod schema matches form field name
- `'X' is not assignable to type` → align Zod infer type with component Props
- Missing `'use client'` directive → add at top of any file using hooks
- `useForm` type mismatch → ensure `z.infer<typeof schema>` is passed as generic

## Step 4 — Fix iteration log

After each fix attempt, append to `scratch/fix-log.md`:

```markdown
## Fix iteration N — [FE/BE]
- Error: exact error message
- File: path/to/file.ts line N
- Fix: what was changed
- Result: ✓ resolved / ✗ still failing
```

## Step 5 — Escalate if stuck

If after 3 iterations an error is not resolved:

```markdown
## BLOCKED — needs user input
File: path/to/file.ts
Error: exact message
Attempted fixes: list what was tried
Suspected cause: your best diagnosis
Question: specific question to ask the user
```

Show this to the user and wait. Do not proceed to Phase 7 with a failing build.

## Step 6 — Start backend server for Phase 7

Once backend compiles clean:

```bash
cd onboarding/backend
node dist/index.js &
sleep 2

# Verify it started
curl -s http://localhost:4000/health
```

Expected: `{"ok":true,"ts":...}`. If not received, read the server log and fix.

## Step 7 — Append to progress.md

```
## Phase 6 — Compile & Fix ✓
- Backend: ✓ clean (N iterations)
- Frontend: ✓ clean (N iterations)
- Server: running on :4000
- Fix log: scratch/fix-log.md
→ Ready for Phase 7 verification
```
