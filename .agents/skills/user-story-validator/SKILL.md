---
name: Shopro POS User Story Implementation Validator Skill
description: >
  Systematically validate user stories and acceptance criteria across the Shopro POS
  codebase (Java/Spring Boot, Flutter, React, PostgreSQL/Flyway). Detects implementation
  deviations and generates actionable directives for fixes and tests.
tags: >
  validation, audit, user-stories, acceptance-criteria, codebase-analysis,
  deviation-detection, actionable-report, java21, spring-boot, react, flutter,
  shopro-pos, quality-assurance, traceability
---

# Goal

Given:
1. A **set of epics / user stories** with acceptance criteria (the specification).
2. A **codebase** (Java/Spring Boot, Flutter Operational, React Admin, Flyway migrations).

This skill must:

1. Parse every acceptance criterion (AC) into a **verifiable assertion** with explicit evidence rules.
2. Scan the codebase layer by layer — DB → entity → service → controller → frontend (Flutter/React) → tests.
3. For each AC, emit a **verdict**: `PASS`, `PARTIAL`, `FAIL`, or `MISSING`.
4. For each non-PASS verdict, emit a **deviation record** with root cause, affected files, severity, and a machine-readable **action directive**.
5. Produce a **summary dashboard** — pass rate per story, per epic, and per layer.
6. Produce an **actionable report file** (`validation-report.json`) structured for downstream skill consumption.

---

# Input Format

## Required

```
EPIC: [Epic ID] [Epic Name]
  STORY: [Story ID] [Story Name]
    Actor:   [Role]
    Goal:    [One-sentence goal]
    Criteria:
      AC-[Story ID]-[N]: [Acceptance criterion text]
    Entities: [Comma-separated entity names]
    Tech Stack: [React | Flutter | Both]
```

## Project Paths (Defaults for Shopro POS)

```
CODEBASE_ROOT: /home/arun/IdeaProjects/shopro-pos
BACKEND_ROOT:  shopro-pos-server/src/main/java/mls/sho/dms
FRONTEND_FLUTTER_ROOT: shopro-pos-flutter/lib
FRONTEND_REACT_ROOT: shopro-pos-web/src
MIGRATION_DIR: shopro-pos-server/src/main/resources/db/migration
TEST_ROOT_JAVA: shopro-pos-server/src/test/java/mls/sho/dms
TEST_ROOT_FLUTTER: shopro-pos-flutter/test
TEST_ROOT_REACT: shopro-pos-web/src/__tests__
```

---

# Phase 1 — Parse Stories into Verifiable Assertions

## 1.1 Criterion Classification

| Evidence Type | What it requires | Where to look |
|---|---|---|
| `DB_CONSTRAINT` | Table column, check constraint, or unique index | `shopro-pos-server/src/main/resources/db/migration/*.sql` |
| `ENTITY_FIELD` | JPA entity field with annotation | `shopro-pos-server/src/main/java/mls/sho/dms/entity/*.java` |
| `VALIDATION_RULE` | Jakarta/Zod validation on a field | Records `*.java`, Zod schemas `*.ts`, Flutter FormField |
| `DEFAULT_VALUE` | Field set to a specific default | Entity constructor, service `create()` |
| `BUSINESS_RULE` | Logic in service layer (if/throw) | `shopro-pos-server/src/main/java/mls/sho/dms/service/impl/*.java` |
| `HTTP_CONTRACT` | HTTP status code, endpoint existence | Controller `*.java` |
| `ERROR_MESSAGE` | Exact error message text (exact match) | Exception classes, frontend toast/dialog copy |
| `UI_ELEMENT` | Form field, button, badge, dialog presence | React/Flutter screen files |
| `UI_BEHAVIOUR` | State change on interaction | React hook / Flutter provider |
| `ROLE_ACCESS` | Feature visible/hidden based on role | Auth guards, RBAC checks |
| `TEST_COVERAGE` | A test exists for this specific AC | `/test` directories across layers |

---

# Phase 2 — Layer-by-Layer Inspection Protocol

## 2.1 Layer 1 — Database (Flyway Migrations)

**Target:** `shopro-pos-server/src/main/resources/db/migration/`

- Check for: `CREATE TABLE`, `NOT NULL`, `VARCHAR(N)`, `CHECK`, `DEFAULT`, `UNIQUE`, `FOREIGN KEY`.
- Flag mismatches between AC requirements and SQL definition.

## 2.2 Layer 2 — JPA Entities

**Target:** `shopro-pos-server/src/main/java/mls/sho/dms/entity/`

- Check: `@Entity`, `@Table`, `@Column(nullable=false/length=N)`, `@Enumerated`, `@Version`, `@CreationTimestamp`.
- Cross-check with DB migrations for consistency.

## 2.3 Layer 3 — Service (Business Rules)

**Target:** `shopro-pos-server/src/main/java/mls/sho/dms/service/`

- Check: Guard clauses (if/throw), custom exceptions, `AuditLog` writes, `@Transactional`.

## 2.4 Layer 4 — Controller (HTTP Contract)

**Target:** `shopro-pos-server/src/main/java/mls/sho/dms/controller/`

- Check: `@RestController`, `@RequestMapping`, HTTP verbs, `@Valid` on `@RequestBody`, `GlobalExceptionHandler`.

## 2.5 Layer 5 — Frontend (React / Flutter)

**React Target:** `shopro-pos-web/src/features/`  
**Flutter Target:** `shopro-pos-flutter/lib/features/`

- **React**: Zod schemas, React Hook Form, `FormMessage`, Shimmers, Toasts.
- **Flutter**: Riverpod/BLoC, `TextFormField` validators, `CachedImageWithShimmer`, `SnackBar`.

## 2.6 Layer 6 — Tests

**Target:** `/test` folders corresponding to each layer.

- Verify: JUnit (Mockito, Testcontainers), RTL (React Testing Library), Flutter Widget/Golden tests.

---

# Phase 3 — Verdict Determination

Same as standard framework:
- `PASS`, `PARTIAL`, `FAIL`, `DEVIATION`, `MISSING_TEST`.
- Severity levels: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`.

---

# Phase 4 — Report Generation

Produce `validation-report.json` and `validation-report.md`.

---

# Phase 5 — Downstream Skill Directives

Directives are formatted for:
- `fix-skill` (to apply code changes).
- `write-tests` (to generate missing tests).
- `ticket-generator` (to create Jira/GitHub issues).

---

# Output Format

Ensure machine-readable JSON and human-readable Markdown are generated at the end of every validation run.
