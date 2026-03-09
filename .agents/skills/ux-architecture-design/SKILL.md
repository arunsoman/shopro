# UX Architecture & Information Design Skill
Follow all diagrams exactly. Input: user stories / epics. Output: complete UX blueprint before any code is written.

---

## PIPELINE OVERVIEW

```mermaid
flowchart LR
    A[Epics + User Stories] --> B[S1: Extract Actors & Roles]
    B --> C[S2: Domain Grouping]
    C --> D[S3: Navigation Architecture]
    D --> E[S4: Page Inventory]
    E --> F[S5: Layout Zone Maps]
    F --> G[S6: Component Dictionary]
    G --> H[S7: Interaction Flows]
    H --> I[S8: UX Rules Applied]
    I --> J[S9: Handoff Checklist]
    J --> K[Output to Frontend Skill]
```

---

## STEP 1 — ACTOR & ROLE EXTRACTION

```mermaid
flowchart TD
    A[Read all user stories] --> B[Extract distinct actors]
    B --> C[For each actor define:\nPrimary goal\nDevice context\nUrgency profile\nTech comfort]
    C --> D[Build Role × Feature Matrix\nRead / Write / Admin / Hidden]
    D --> E{More than 7 features\nper role?}
    E -->|Yes| F[Split into sub-domains]
    E -->|No| G[Output Actor Table\n+ Role×Feature Matrix]
```

**Actor Table format:**
`Role | Primary Goal | Device | Urgency | Access Level`

**Role × Feature Matrix format:**
`Feature | RoleA | RoleB | RoleC → ✅Write / 👁Read / ❌Hidden`

---

## STEP 2 — DOMAIN GROUPING

```mermaid
flowchart TD
    A[Features list] --> B[Group by actor mental model\nNOT by database structure]
    B --> C{Group size?}
    C -->|Fewer than 3| D[Merge with adjacent group]
    C -->|3–7| E[Keep as domain]
    C -->|More than 7| F[Split into sub-domains]
    E --> G{Who uses it?}
    G -->|All roles| H[GLOBAL section\ntop navigation]
    G -->|One role only| I[ROLE-SPECIFIC section\nhidden from others via RBAC]
    H & I --> J[Identify home domain\nper role = first screen after login]
```

**Domain Map format:**
```
GLOBAL → Dashboard
ROLE_A DOMAINS → Domain1, Domain2
ROLE_B DOMAINS → Domain3
```

---

## STEP 3 — NAVIGATION ARCHITECTURE

```mermaid
flowchart TD
    A[Navigation] --> B[3.1 Header]
    A --> C[3.2 Sidebar]
    A --> D[3.3 Bottom Tab Bar]
    A --> E[3.4 Footer]
    A --> F[3.5 Contextual Nav]
```

### 3.1 Header Rules

```mermaid
flowchart LR
    LEFT[Left:\nLogo→role home\nBreadcrumb if 3+ deep] 
    CENTER[Center:\nGlobal search\nonly if cross-entity]
    RIGHT[Right:\nNotifications bell\nRole badge if switchable\nUser avatar menu\nQuick +New button\non section home only]

    LEFT --- CENTER --- RIGHT

    RULES[RULES:\nMax height 64px desktop / 56px mobile\nNOT a nav menu — no section links\nMobile: collapse right into avatar+hamburger\nsubtle border-bottom + backdrop-blur]
```

### 3.2 Sidebar Rules

```mermaid
flowchart TD
    A{Role type?}
    A -->|Back-office desktop\ne.g. Manager| B[240px fixed sidebar]
    A -->|Operational mobile\ne.g. Server Kitchen| C[No sidebar\nuse Bottom Tab Bar]
    B --> D[Structure:\n1. Logo→dashboard\n2. Dashboard always first\n3. Most-used domains next\n4. Divider\n5. Settings always last\n6. Avatar+logout at bottom]
    D --> E[Rules:\nMax 7 top-level items\nActive: border-l-2 border-primary\nCollapse to 48px icon rail\nMax 2 nesting levels\nMobile: full-screen drawer]
```

### 3.3 Bottom Tab Bar Rules

```mermaid
flowchart TD
    A[Bottom Tab Bar\nfor mobile/tablet operational roles] --> B[Max 5 tabs\noverflow → More tab]
    B --> C[Active: icon+label in primary color\nInactive: muted]
    C --> D[FAB above bar\nfor single most frequent action]
    D --> E[Height: 64px + iOS safe area inset]
```

### 3.4 Footer Policy

```mermaid
flowchart TD
    A{Page type?}
    A -->|Authenticated app shell| B[NO FOOTER\nuse sidebar bottom slot\nfor settings/logout]
    A -->|Public pages login/menu| C[Minimal footer:\n© Brand · Privacy · Terms · Support]
```

### 3.5 Contextual Navigation

```mermaid
flowchart TD
    A[Deep content page?] --> B[Page-level tabs\nfor multi-facet entities\nDetails/Modifiers/Audit]
    A --> C[Breadcrumb\nSection→Page→Item\nlinks to each ancestor]
    A --> D[Section anchors\nsticky right side\nfor long settings pages]
    A --> E[Back button\nalways when list→detail\nNEVER history.go -1]
```

---

## STEP 4 — PAGE INVENTORY

```mermaid
flowchart TD
    A[For every screen needed] --> B[Define:\nRoute URL pattern\nPage type\nPrimary actor\nEntry points\nExit points]
    B --> C{Every user story\nhas a page?}
    C -->|No| D[Add missing pages]
    C -->|Yes| E[Output Page Inventory Table]
```

**Page types:** `Auth | Dashboard | List | Detail | CreateForm | EditForm | Wizard | FullScreenTool | Settings | Public`

**Table format:**
`Page | Route | Type | Primary Actor | Entry From | Exits To`

---

## STEP 5 — LAYOUT ZONE SPECIFICATION

```mermaid
flowchart TD
    A[Layout Zones] --> ZA[ZONE A — Page Header Bar\n56–72px\nTitle + breadcrumb + CTA + actions]
    A --> ZB[ZONE B — Filter/Control Bar\n48–56px sticky\nSearch + filters + sort + view toggle]
    A --> ZC[ZONE C — Content Area\nFluid main content\nDataTable / CardGrid / Form / Canvas]
    A --> ZD[ZONE D — Detail Panel\n360–480px slides from right\nTriggered by row/card click]
    A --> ZE[ZONE E — Summary/Action Bar\nSticky bottom\nTotals + submit + secondary action]
    A --> ZF[ZONE F — Empty State\nNEVER blank white\nIllustration + headline + CTA]
```

### Zone Maps per Page Type

```mermaid
flowchart TD
    PT{Page type?}
    PT -->|Dashboard| DA[Sidebar fixed left\nZONE A: greeting\nZONE C: stat cards grid\nZONE C: recent activity feed]
    PT -->|List| LI[Sidebar\nZONE A: title + Create button\nZONE B: search+filter+sort+toggle sticky\nZONE C: CardGrid 1→2→3→4 col by breakpoint\nZONE F if empty\nPagination below ZONE C]
    PT -->|CreateEdit Form| CF[Sidebar\nZONE A: back link + title + draft badge\nZONE C: 2-col form stacks on mobile\nLeft: text inputs\nRight: photo upload\nZONE E sticky: Cancel + Save Draft + Publish]
    PT -->|FullScreen Operational| FS[Header only\nLeft panel: entity list 240px\nZONE C: interactive canvas\nBottom Tab Bar\nNO sidebar]
    PT -->|Detail with Panel| DP[List dims in background\nZONE D slides in from right\nPhoto + name + status + actions\nTabs for facets]
```

---

## STEP 6 — COMPONENT PLACEMENT DICTIONARY

```mermaid
flowchart TD
    A[For every component implied\nby user stories] --> B[Define:\nName\nPage s it appears on\nZone A-F or Top/Bot/Modal/OL\nTrigger: always/hover/select/scroll/condition\nPrimary action]
    B --> C[Output Component Dictionary Table]
```

**Table format:**
`Component | Pages | Zone | Trigger | Primary Action`

**Always include these universal components:**
`GlobalHeader · SidebarNav · BottomTabBar · PageHeader · FilterBar · EmptyState · ErrorToast · ValidationInlineError · ConfirmDeleteDialog · FormActionBar · StatusBadge · ImageWithSkeleton · DetailSlidePanel · BreadcrumbNav · PageTabs`

---

## STEP 7 — INTERACTION FLOW SPECIFICATION

```mermaid
flowchart TD
    A[For each user story] --> B[Define entry point]
    B --> C[Document happy path\nas numbered steps\nactor action → system response → UI state]
    C --> D[Document branch conditions]
    D --> E{Branch type?}
    E -->|Valid input variant| F[BRANCH label\nstate change]
    E -->|Client validation fail| G[Inline error\nno submit\nscroll to first error]
    E -->|Duplicate detected| H[Non-blocking dialog\nCancel + Save Anyway]
    E -->|Server 422| I[ErrorToast\nfield-level inline errors from details map]
    E -->|Server 5xx| J[ErrorToast generic\nre-enable submit]
    F & G & H & I & J --> K[Document exit point\nwhere actor ends up\nnext likely actions]
```

---

## STEP 8 — UX RULES (APPLY UNIVERSALLY)

```mermaid
flowchart TD
    R[UX Rules] --> R1[Feedback:\n100ms loading indicator\n1000ms result\nSkeletons match real content dimensions]
    R --> R2[Errors:\nValidation inline next to field NEVER modal\nAPI errors toast top-right 6s auto-dismiss\nDestructive actions: confirm dialog with entity name\nDuplicate: non-blocking Cancel+Save Anyway]
    R --> R3[Navigation:\nCurrent page visible in sidebar AND breadcrumb\nBack = logical parent NEVER history.go-1\nDeep links always work on hard refresh\nModal max 3 steps else use full page]
    R --> R4[Forms:\nValidate on blur not keystroke\nRequired fields marked with asterisk\nMulti-step: progress indicator + back without data loss\nAuto-save debounce 2s show timestamp\nMobile: submit at bottom within thumb reach]
    R --> R5[RBAC:\nHide elements role cannot access entirely\nException: disable+tooltip for discoverable features\nRole switch triggers full UI refresh]
    R --> R6[Accessibility WCAG 2.1 AA:\nAll interactive elements keyboard reachable\nIcons have aria-label\nContrast 4.5:1 text on surface\nVisible focus rings on-brand\nAll inputs have label not just placeholder\nLoading states aria-live=polite]
```

### Responsive Breakpoints

```mermaid
flowchart LR
    M[Mobile < 640px\nSidebar: drawer\nHeader: avatar only\nGrid: 1 col\nForm: 1 col]
    T[Tablet 640–1023px\nSidebar: icon rail\nHeader: avatar+notif\nGrid: 2 col\nForm: 1 col]
    D[Desktop 1024–1279px\nSidebar: 240px fixed\nHeader: all visible\nGrid: 2–3 col\nForm: 2 col]
    W[Wide ≥1280px\nSidebar: 240px fixed\nHeader: all visible\nGrid: 3–4 col\nForm: 2 col]
    M --> T --> D --> W
```

---

## STEP 9 — HANDOFF CHECKLIST

```mermaid
flowchart TD
    CHECK[Before handing off to\nFrontend or Fullstack Skill] --> C1{Every user story\nhas a page?}
    C1 -->|No| FIX1[Add missing pages]
    C1 -->|Yes| C2{Every page\nhas zone map?}
    C2 -->|No| FIX2[Add zone maps]
    C2 -->|Yes| C3{Every component\nin dictionary?}
    C3 -->|No| FIX3[Add components]
    C3 -->|Yes| C4{Every flow has\nhappy + 2 error branches?}
    C4 -->|No| FIX4[Add error branches]
    C4 -->|Yes| C5{Every role\nhas home page?}
    C5 -->|No| FIX5[Define home pages]
    C5 -->|Yes| C6{Nav depth\nmax 3 levels?}
    C6 -->|No| FIX6[Flatten navigation]
    C6 -->|Yes| C7{Mobile layout\naddressed per page?}
    C7 -->|No| FIX7[Add mobile specs]
    C7 -->|Yes| C8{All destructive actions\nhave confirm flow?}
    C8 -->|No| FIX8[Add confirm dialogs]
    C8 -->|Yes| C9{All forms have\nempty+loading+error+success states?}
    C9 -->|No| FIX9[Add missing states]
    C9 -->|Yes| DONE[✅ Hand off to\nFrontend / Fullstack Skill]
    FIX1 & FIX2 & FIX3 & FIX4 & FIX5 & FIX6 & FIX7 & FIX8 & FIX9 --> CHECK
```

---

## OUTPUT FORMAT (in order)

```mermaid
flowchart TD
    OUT[Output Sections] --> O1[1. Actor + Role Table]
    OUT --> O2[2. Role × Feature Matrix]
    OUT --> O3[3. Domain Map]
    OUT --> O4[4. Navigation Architecture\nHeader + Sidebar + TabBar + Footer]
    OUT --> O5[5. Page Inventory Table]
    OUT --> O6[6. Zone Maps per page type]
    OUT --> O7[7. Component Placement Dictionary]
    OUT --> O8[8. Interaction Flows\nall stories happy+error]
    OUT --> O9[9. UX Rules Applied\nnote which heuristics apply]
    OUT --> O10[10. Handoff Checklist\nall items checked or flagged]
    O10 --> NEXT[Feed into:\nFrontend Implementation Skill\nor Fullstack Skill]
```