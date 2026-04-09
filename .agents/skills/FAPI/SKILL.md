# FAPI Integration Skill
**Skill ID:** `fapi-integration`
**Version:** 2.0.0
**Scope:** React (Vite/CRA) + Angular · Auth0 + Spring Authorization Server · Full Takeover mode

---

## What This Skill Does

Takes an **existing React or Angular frontend** connected to a **Spring Boot API**,
currently using **Auth0 or Spring Authorization Server (Spring AS)** as identity provider,
and replaces its entire auth layer with a **fully FAPI 2.0 Advanced compliant** stack:

```
BEFORE:
  Browser → (any auth) → Spring Boot API

AFTER:
  Browser (FAPI client) → Nginx → FAPI Gateway (Fastify/TS) → Spring Boot API
                                         ↕
                                   Auth0 / Spring AS
                                   (PAR · PKCE · DPoP · JARM)
```

**Takeover mode** means:
- All existing auth files are **archived** to `_fapi_archive/<timestamp>/`
- `import` / `inject` references to old auth are **rewritten** to point at new FAPI layer
- Old packages (`@auth0/auth0-react`, `@auth0/auth0-angular`, `angular-oauth2-oidc`,
  `keycloak-js`, etc.) are **removed** from `package.json`
- Nothing from the old auth layer is left active anywhere in the codebase

---

## Supported Matrix

| Frontend | SSO | Takeover | Deployment |
|---|---|---|---|
| React · Vite | Auth0 | ✅ Full | Docker Compose |
| React · CRA  | Spring AS | ✅ Full | Linux VPS (systemd) |
| Angular      | Auth0 | ✅ Full | Kubernetes (Helm) |
| Angular      | Spring AS | ✅ Full | All three (auto-detect) |

---

## Execution Rules (Claude must follow strictly)

1. Run phases **0 → 1 → 2 → 3 → 4 → 5 → 6 → 7** in order — never skip
2. **Phase 0 must complete** before any file is written
3. **Archive before replacing** — every replaced file goes to `_fapi_archive/`
4. **No `{{placeholder}}` values** in any delivered file — all resolved from ProjectProfile
5. **Run debug loop** on every phase PASS failure — max 3 iterations
6. **Never guess** on `issuerUrl`, `clientId`, `redirectUri` — always ask if not found
7. **Log all decisions** to `fapi-integration.log` with timestamps
8. **Re-run typecheck** after every file write — catch errors before handing over
9. If a debug loop iteration fails 3 times → document as gap, continue to next phase
10. **Final handover only after smoke tests run** — even if some fail (document failures)

---


## Execution Phases

This skill has been modularized to preserve your context limits. When executing this skill, you MUST sequentially read and execute the instructions in the following files, one by one. Do not proceed to the next phase until the previous phase's pass conditions are met.

- **Phase 0: Discovery** → Read `phases/phase_0.md`
- **Phase 1: Authorization Server Wrapper** → Read `phases/phase_1.md`
- **Phase 2: Archive Existing Auth Layer** → Read `phases/phase_2.md`
- **Phase 3: FAPI Core Library** → Read `phases/phase_3.md`
- **Phase 4: Framework Adapter** → Read `phases/phase_4.md`
- **Phase 5: FAPI Gateway** → Read `phases/phase_5.md`
- **Phase 6: Nginx Configuration** → Read `phases/phase_6.md`
- **Phase 7: Spring Boot Audit Layer** → Read `phases/phase_7.md`
- **Phase 8: Debug Loop** → Read `phases/phase_8.md`
- **Phase 9: Smoke Tests** → Read `phases/phase_9.md`
- **Phase 10: Handover Report** → Read `phases/phase_10.md`


## Delivery Checklist
After completing all phases, ensure the overall delivery checklist (found in the final phase report) is met.
