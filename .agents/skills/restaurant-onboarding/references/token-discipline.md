# Token Discipline Reference

Rules for keeping this pipeline efficient without missing anything.

---

## The core principle

Each agent file is a focused lens. Load one, complete it fully, summarise to `scratch/`, release it. The scratch files ARE the memory — they carry structured output forward so no agent needs to re-read the original sources.

## What each phase is allowed to read

| Phase | May read | May NOT read |
|---|---|---|
| 01 Discover | docs/*, screens.md, route files (first 3), swagger spec | Nothing else |
| 02 Entity Map | scratch/discovery.md, model/schema files for named entities only | Docs, component files |
| 03 UI Plan | scratch/entity-map.json, scratch/discovery.md (component index only), up to 10 component source files | Docs, backend files |
| 04 FE Codegen | scratch/ui-plan.md, scratch/entity-map.json | Source components, docs, backend |
| 05 BE Codegen | scratch/entity-map.json, scratch/progress.md (Phase 1 section only) | Frontend files, docs |
| 06 Compile Fix | scratch/progress.md (Phase 4+5 only), only the file named in each error | Nothing else upfront |
| 07 Verify | scratch/curl-plan.md, scratch/progress.md (server info only) | Source files unless a test fails |

## scratch/ is the API between agents

Every agent reads structured scratch files, never raw source. This keeps context windows tight.

```
scratch/
  progress.md        ← append-only phase log (one paragraph per phase)
  discovery.md       ← Phase 1 output (structured bullets)
  entity-map.json    ← Phase 2 output (JSON, machine-readable)
  ui-plan.md         ← Phase 3 output (structured markdown)
  curl-plan.md       ← Phase 5 output (executable bash)
  fix-log.md         ← Phase 6 output (append-only)
  curl-results.md    ← Phase 7 output (final report)
```

## File generation rules (Phase 4 + 5)

- One complete file per tool call — never split a file across calls
- Write in dependency order: schemas → API lib → sub-components → screens → shell
- After writing a file, run a quick syntax check before continuing:
  ```bash
  npx tsc --noEmit path/to/file.ts 2>&1 | head -10
  ```
- If a file would exceed ~200 lines, split it into two logical files

## Large docs handling

If a doc file is >300 lines:
1. Read lines 1–80 (usually has overview + entity list)
2. Read lines -20 (usually has summary or entity relationships)
3. Search for specific keywords: `grep -n "onboard\|restaurant\|entity\|schema\|field" file.md | head -30`
4. Do targeted reads of the matched line ranges only

## When to stop and ask the user

Stop and surface a question if:
- Two consecutive entities reference each other with no clear owner (circular FK)
- An endpoint returns a completely different shape than what entity-map.json expects
- A compile error persists after 3 fix attempts
- The backend has no clear auth mechanism and Phase 7 tests would be meaningless without it

Never silently skip a step or make a major design assumption without noting it in progress.md.

---

## The Q&A loop — when it runs and when it stops

**Phases 1 and 2 only.** The loop does NOT run in phases 3–7.

Each question gets exactly 3 attempts (Tier 1 → 2 → 3). After 3 attempts:
- Write an ASSUMPTION entry with rationale and risk level
- Continue — never block the pipeline on a single question

**You are the domain expert for Tier 2 inference.** Draw on knowledge of:
- Indian food delivery platform patterns (FSSAI, GST, multi-outlet franchises)
- Multi-tenant SaaS entity hierarchies (Hub → Restaurant → User)
- REST API design conventions
- Prisma schema best practices

Do not defer to the user for questions you can reasonably infer. Reserve user escalation for genuine policy decisions (commission structure, approval flow choice) or circular FKs with no clear ownership direction.

## Phase lock enforcement

Before loading any phase agent, check the required UNLOCK line:
- Phase 2: `grep "UNLOCK: Phase 2" scratch/progress.md`
- Phase 3: `grep "UNLOCK: Phase 3" scratch/progress.md`

If not found, the previous phase is not sealed. Return to it.
