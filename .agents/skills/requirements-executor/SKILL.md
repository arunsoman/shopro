---
name: requirements-executor
description: >
  Analyzes a set of requirements against an existing codebase, identifies gaps, generates a structured task list of small, self-contained, testable implementation tasks, then executes each task one by one. Use this skill whenever a user provides product requirements, user stories, feature specs, or a PRD and wants to implement them in an existing codebase. Trigger when user says things like "implement these requirements", "build this feature from requirements", "turn this spec into code", "analyze codebase and implement missing features", "execute on these user stories", or any time there's a list of requirements to be implemented against real code. This skill should run automatically for any requirement-to-code workflow.
---

# Requirements Executor Skill

This skill takes a set of requirements, analyzes the existing codebase, generates a minimal task list of self-contained executable tasks, then implements each one.

---

## Phase Overview

```
1. INGEST         → Parse and understand all requirements
2. ANALYZE        → Explore the codebase to understand current state
3. GAP ANALYSIS   → Per requirement: what exists vs what's missing
4. TASK PLANNING  → Break gaps into small, atomic, testable tasks
5. EXECUTION      → Implement each task with verification
6. REPORT         → Summarize what was done
```

---

## Phase 1: Ingest Requirements

Read the requirements carefully. For each requirement:
- Assign an ID (REQ-001, REQ-002, ...)
- Identify the type: Feature / Fix / Refactor / Config / Test / Doc
- Extract acceptance criteria (explicit or implied)
- Note dependencies between requirements

If requirements are ambiguous, ask the user to clarify **before** analyzing the codebase. Don't proceed with guesses.

---

## Phase 2: Analyze the Codebase

Explore the project structure systematically:

```bash
# Get top-level structure
find . -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' \
       -not -path '*/dist/*' -not -path '*/__pycache__/*' | head -80

# Detect language/framework
ls package.json requirements.txt pyproject.toml Cargo.toml go.mod 2>/dev/null

# Read key config files
cat package.json 2>/dev/null || cat pyproject.toml 2>/dev/null || cat Cargo.toml 2>/dev/null

# Understand entry points
find . -name "main.*" -o -name "index.*" -o -name "app.*" | grep -v node_modules | head -10
```

Read the most relevant source files. Focus on:
- Entry points and routing
- Data models / schemas
- Existing feature modules related to the requirements
- Test setup and patterns

---

## Phase 3: Gap Analysis

For each requirement, produce a gap assessment:

```
REQ-001: [Requirement text]
  Status: MISSING | PARTIAL | COMPLETE
  Exists:
    - [what already works]
  Missing:
    - [specific thing 1 not yet implemented]
    - [specific thing 2]
  Affected files: [list of files to change or create]
```

Print the full gap analysis before moving on. This is the most critical artifact — get it right.

---

## Phase 4: Task Planning

Convert gaps into a task list. Each task must be:

- **Atomic**: A single logical change (one function, one endpoint, one component, one test)
- **Self-contained**: Has all context needed to implement it without reading other tasks
- **Testable**: Has a clear, verifiable success criterion
- **Ordered**: Later tasks may depend on earlier ones — order them correctly

### Task Format

```
TASK-001 [REQ-001]: <short title>
  Description: What to build/change and why
  File(s): path/to/file.ext [create | modify]
  Implementation:
    - Step 1: ...
    - Step 2: ...
    - Step 3: ...
  Test/Verify:
    - Run: <command>
    - Expected: <what success looks like>
  Done when: <completion criterion>
```

### Task Sizing Rules

- A task should be completable in one focused code edit
- If a task requires changes to more than 3 files, split it
- Database migrations = separate tasks from application logic
- Tests = separate tasks from implementation (unless trivially small)
- Config changes = their own task

Print the complete task list and **wait for user confirmation** before executing.

---

## Phase 5: Execute Each Task

For each task, follow this loop:

### 5a. Announce the task
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Executing TASK-003: Add user authentication middleware
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5b. Read current state of affected files
Always read files fresh before editing — never rely on memory of file contents.

```bash
cat path/to/file.ext
```

### 5c. Implement
Make the change using `str_replace` (for existing files) or `create_file` (for new files).

Follow the project's existing:
- Code style and formatting
- Naming conventions
- Import ordering
- Error handling patterns
- Comment style

### 5d. Verify
Run the test/verify command from the task definition:

```bash
# Examples depending on stack:
npm test -- --testPathPattern=auth
pytest tests/test_auth.py -v
cargo test auth
go test ./auth/...
```

If verification fails:
1. Read the error carefully
2. Fix the issue (up to 2 retries)
3. If still failing after 2 retries, mark as BLOCKED and continue to next task, reporting the blocker

### 5e. Mark complete
```
✓ TASK-003 complete — middleware applied, 3 tests passing
```

---

## Phase 6: Final Report

After all tasks are attempted, print a summary:

```
══════════════════════════════════════
EXECUTION SUMMARY
══════════════════════════════════════
Requirements: 5 total
  ✓ REQ-001 — User login              [TASK-001, TASK-002, TASK-003]
  ✓ REQ-002 — Password reset          [TASK-004, TASK-005]
  ⚠ REQ-003 — OAuth integration       [TASK-006 BLOCKED: missing env vars]
  ✓ REQ-004 — Session management      [TASK-007]
  ✓ REQ-005 — Audit logging           [TASK-008]

Tasks: 8 planned
  ✓ Complete: 7
  ✗ Blocked:  1

Blocked tasks:
  TASK-006: Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars.
            See references/oauth-setup.md to configure.

Files changed: 12 files modified, 3 files created
Next steps: [any remaining manual steps]
══════════════════════════════════════
```

---

## Important Principles

**Never guess at codebase structure.** Always read files before editing.

**Keep tasks small.** Prefer 10 small tasks over 3 large ones. Small tasks are easier to verify, easier to debug, and easier to roll back.

**Test as you go.** Don't batch all tests at the end. Run the verification for each task immediately after implementation.

**Respect existing patterns.** If the project uses a specific auth library, error format, or folder convention — match it exactly. Don't introduce new patterns unless a requirement explicitly asks for them.

**If blocked, move on.** A blocked task should never stop the whole execution. Log the blocker and continue.

**Ask before executing.** Print the full task list and confirm with the user before starting Phase 5. The user may want to remove, reorder, or modify tasks.

---

## Codebase Detection Quick Reference

See `references/stack-patterns.md` for:
- How to detect language/framework from project files
- Common test commands per stack
- Where to find entry points per framework
- Common config file locations