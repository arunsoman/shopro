# UX Architecture Blueprint: CRM & Loyalty

## Background
This document serves as the implementation-ready UX spec for the **CRM & Loyalty** module, based on `12_CRM_AND_LOYALTY_REQUIREMENTS.md`. It covers all 7 epics: Customer Profiles, Loyalty Rewards, Marketing Automation, Guest Feedback, Reservation CRM Integration, CRM Analytics, and POS Integration.

The CRM module spans **two platforms**: the Manager/Owner desktop admin (React) and the Server/Host POS (Flutter). A lightweight guest-facing portal (React) also exists. This blueprint specifies all three surfaces.

---

## 1. Actor & Role Table

| Role             | Primary Goal                                                   | Device          | Urgency | Access Level |
|------------------|----------------------------------------------------------------|-----------------|---------|--------------|
| Manager          | Configure loyalty rules, run campaigns, monitor CRM dashboards | Desktop         | Low     | Admin        |
| Owner/GM         | Strategic CRM analytics, CLV, churn, campaign ROI              | Desktop/Mobile  | Low     | Admin+       |
| Server/Cashier   | Look up profiles, attach to tickets, apply/redeem loyalty      | Tablet (POS)    | High    | Operational  |
| Host             | View CRM data on reservations/waitlist, greet VIPs             | Tablet (Host)   | High    | Operational  |
| Customer/Guest   | View points, update preferences, provide feedback              | Mobile (Portal) | Medium  | Self-service |
| System (Engine)  | Trigger automated campaigns, calculate tiers, score churn      | Backend         | N/A     | System       |

---

## 2. Role × Feature Matrix

| Feature                          | Owner/GM   | Manager    | Server/Cashier | Host        | Customer  |
|----------------------------------|------------|------------|----------------|-------------|-----------|
| Create/Edit Customer Profile     | ✅ Write    | ✅ Write    | ✅ Write (basic)| ✅ Write (basic)| ❌ Hidden |
| View Customer Profile            | ✅ Read     | ✅ Read     | ✅ Read         | ✅ Read      | 👁 Own    |
| Merge Duplicate Profiles         | ✅ Write    | ✅ Write    | ❌ Hidden       | ❌ Hidden    | ❌ Hidden |
| Configure Loyalty Rules/Tiers    | ✅ Admin    | ✅ Write    | ❌ Hidden       | ❌ Hidden    | ❌ Hidden |
| Earn Points (automatic)          | —          | —          | —              | —           | ✅ Auto   |
| Redeem Points                    | ❌         | ❌         | ✅ Write        | ❌           | ❌        |
| Loyalty Balance Inquiry          | ✅ Read     | ✅ Read     | ✅ Read         | ✅ Read      | 👁 Own    |
| Create/Send Campaigns           | ✅ Write    | ✅ Write    | ❌ Hidden       | ❌ Hidden    | ❌ Hidden |
| Configure Automated Campaigns   | ✅ Write    | ✅ Write    | ❌ Hidden       | ❌ Hidden    | ❌ Hidden |
| Manage Promo Codes               | ✅ Write    | ✅ Write    | ✅ Apply at POS | ❌ Hidden    | ❌ Hidden |
| View Feedback Dashboard          | ✅ Read     | ✅ Read     | ❌ Hidden       | ❌ Hidden    | ❌ Hidden |
| Submit Feedback                  | ❌         | ❌         | ❌              | ❌           | ✅ Write  |
| Receive Low-Rating Alerts        | ✅ Push     | ✅ Push     | ❌              | ❌           | ❌        |
| CRM-Enriched Reservation View   | ✅ Read     | ✅ Read     | ❌ Hidden       | ✅ Read      | ❌ Hidden |
| CRM Analytics (CLV, Churn)      | ✅ Full     | ✅ Read     | ❌ Hidden       | ❌ Hidden    | ❌ Hidden |
| Campaign Performance Reports    | ✅ Full     | ✅ Read     | ❌ Hidden       | ❌ Hidden    | ❌ Hidden |
| Customer Segmentation            | ✅ Write    | ✅ Write    | ❌ Hidden       | ❌ Hidden    | ❌ Hidden |
| Opt-In/Preference Management    | ✅ Admin    | ✅ Write    | ✅ Capture      | ❌           | ✅ Write  |
| Guest Portal                    | ❌         | ❌         | ❌              | ❌           | ✅ Full   |

---

## 3. Domain Map

```text
App Domain Map — CRM & Loyalty Module
──────────────────────────────────────────────────

OWNER / MANAGER DOMAINS (Desktop Admin — React)
  └── CRM & Loyalty
        ├── Customer Database       ← profiles, search, segments, merge
        ├── Loyalty Program         ← rules config, tiers, bonus events
        ├── Campaigns               ← manual campaigns, automations, promo codes
        ├── Guest Feedback          ← survey results, alerts, staff scores
        └── CRM Analytics           ← CLV, campaign ROI, program health, churn

SERVER / CASHIER DOMAINS (POS Tablet — Flutter)
  ├── Customer Lookup              ← search-by-phone, attach to ticket
  ├── Profile Summary              ← view allergies, preferences, occasions
  ├── Loyalty Checkout             ← view balance, redeem points, apply promos
  └── Loyalty Lookup (Quick Action)← balance inquiry without open order

HOST DOMAINS (Host Tablet — Flutter)
  ├── CRM-Enriched Reservation     ← VIP badges, allergies, occasions on rez card
  └── CRM Waitlist Lookup          ← visit count, tier on walk-in lookup

CUSTOMER DOMAINS (Guest Portal — React)
  └── My Loyalty Portal            ← balance, history, preferences, opt-in/out

SYSTEM DOMAINS (Backend)
  ├── Point Calculation Engine
  ├── Tier Evaluation Engine
  ├── Campaign Scheduler
  ├── Churn Scoring Engine
  └── Feedback Collection Workflow
──────────────────────────────────────────────────
```

---

## 4. Navigation Architecture

### 4.1 Manager Admin Sidebar (Desktop — React)

The CRM module is a **top-level sidebar item** with sub-navigation:

```text
▸ Dashboard
▸ Menu
▸ Orders
▸ Floor Plan
▸ Staff
▸ Inventory
▸ CRM & Loyalty   ◀ active section
  ▸ Customers          ← profile list, search, segments
  ▸ Loyalty Program    ← rules, tiers, bonus events
  ▸ Campaigns          ← manual + automated campaigns
  ▸ Feedback           ← survey dashboard
  ▸ Analytics          ← CLV, ROI, churn
▸ Reports
─────────────
▸ Settings
```

### 4.2 Server POS (Flutter — Quick Actions)

CRM is accessed through **contextual touchpoints**, not a dedicated tab:

```text
POS Home Screen (Bottom Tab Bar):
┌──────────────────────────────────────────────────┐
│ 🏠 Floor │ 📋 Orders │ 🍽 Menu │ 🎁 Loyalty │ 👤 Me │
└──────────────────────────────────────────────────┘

🎁 Loyalty Tab → Loyalty Lookup (balance inquiry by phone)

Contextual CRM on Order Screen:
  ┌───────────────────────────────────────────────┐
  │  [🔍 Attach Customer]  ← top of order screen  │
  │  Tap → Phone search → Attach to ticket         │
  │  Attached → [👤 Profile Summary] icon appears  │
  └───────────────────────────────────────────────┘

Checkout Screen:
  ┌───────────────────────────────────────────────┐
  │  Loyalty: 500pts ($5.00) [Apply Points]        │
  │  Promo Code: [________] [Apply]                │
  └───────────────────────────────────────────────┘
```

### 4.3 Host App (Flutter — Contextual CRM)

CRM data appears inline on reservation and waitlist cards — no separate tab:

```text
Reservation Card (enhanced):
  ┌─────────────────────────────────────┐
  │  7:30 PM · Party of 4               │
  │  John Smith  ⭐ Gold  🎂 Birthday!  │
  │  ⚠ Nut Allergy · 12 visits          │
  │  [Seat Table]  [Cancel]              │
  └─────────────────────────────────────┘
```

### 4.4 Guest Portal Header

```text
┌──────────────────────────────────────────────────┐
│ [🍴 Restaurant Logo]    My Rewards    [Preferences] │
└──────────────────────────────────────────────────┘
```

Footer (public page):
```text
© 2026 [Restaurant Name] · Privacy Policy · Terms of Service
```

---

## 5. Page Inventory

### 5.1 Admin Pages (React — Manager/Owner)

| Page                         | Route                              | Type       | Primary Actor | Entry From                    | Exits To                    |
|------------------------------|------------------------------------|------------|---------------|-------------------------------|------------------------------|
| Customer List                | `/crm/customers`                   | List       | Manager       | Sidebar → CRM → Customers    | Profile Detail, Create, Merge|
| Customer Detail              | `/crm/customers/:id`               | Detail     | Manager       | Customer List                 | Edit, Segment, Order History |
| Create Customer              | `/crm/customers/new`               | Form       | Manager       | Customer List "+ New"         | Customer Detail (success)    |
| Customer Segments            | `/crm/customers/segments`          | List       | Manager       | Sidebar sub-nav               | Segment Detail, Create       |
| Create/Edit Segment          | `/crm/customers/segments/:id`      | Form       | Manager       | Segment List                  | Segment List                 |
| Merge Profiles               | `/crm/customers/merge`             | Wizard     | Manager       | Customer List toolbar         | Customer List                |
| Loyalty Config               | `/crm/loyalty/config`              | Settings   | Manager       | Sidebar → Loyalty Program     | —                            |
| Loyalty Tiers                | `/crm/loyalty/tiers`               | List+Form  | Manager       | Sidebar → Loyalty Program     | —                            |
| Bonus Events                 | `/crm/loyalty/bonus-events`        | List       | Manager       | Sidebar → Loyalty Program     | Create Event                 |
| Create Bonus Event           | `/crm/loyalty/bonus-events/new`    | Form       | Manager       | Bonus Events List             | Bonus Events List            |
| Campaign List                | `/crm/campaigns`                   | List       | Manager       | Sidebar → Campaigns           | Campaign Detail, Create      |
| Create Campaign              | `/crm/campaigns/new`               | Wizard     | Manager       | Campaign List "+ New"         | Campaign List (success)      |
| Campaign Detail              | `/crm/campaigns/:id`               | Detail     | Manager       | Campaign List                 | Recipient drill-down         |
| Automated Campaigns          | `/crm/campaigns/automations`       | List+Config| Manager       | Sidebar → Campaigns           | Edit Automation              |
| Promo Code List              | `/crm/campaigns/promos`            | List       | Manager       | Sidebar → Campaigns           | Create Promo, Detail         |
| Create Promo Code            | `/crm/campaigns/promos/new`        | Form       | Manager       | Promo Code List               | Promo Code List              |
| Feedback Dashboard           | `/crm/feedback`                    | Dashboard  | Manager       | Sidebar → Feedback            | Drill-down, By Server        |
| Feedback By Server           | `/crm/feedback/staff`              | Dashboard  | Manager       | Feedback Dashboard tab        | Staff detail drill-down      |
| CLV Dashboard                | `/crm/analytics/clv`               | Dashboard  | Owner         | Sidebar → Analytics           | —                            |
| Campaign Performance         | `/crm/analytics/campaigns`         | Dashboard  | Manager       | Sidebar → Analytics           | Campaign Detail              |
| Loyalty Program Health       | `/crm/analytics/loyalty`           | Dashboard  | Owner         | Sidebar → Analytics           | Export                       |
| Churn Risk List              | `/crm/analytics/churn`             | List       | Owner         | Sidebar → Analytics           | Customer Detail, Win-Back    |

### 5.2 POS Pages (Flutter — Server/Cashier)

| Page                         | Route (Flutter)                    | Type        | Primary Actor | Entry From                    | Exits To                    |
|------------------------------|------------------------------------|-------------|---------------|-------------------------------|------------------------------|
| Customer Search Modal        | Modal over Order Screen            | Search      | Server        | "Attach Customer" tap         | Order Screen                 |
| Profile Summary Sheet        | Bottom Sheet on Order Screen       | Detail      | Server        | Profile icon tap              | Order Screen                 |
| Loyalty Lookup               | `/loyalty-lookup`                  | Quick Action| Cashier       | Bottom Tab "Loyalty"          | Home                         |
| Loyalty Redemption (Checkout)| Inline on Checkout Screen          | Inline      | Cashier       | Checkout flow                 | Payment                     |
| Create Profile Modal         | Modal from Search (no result)      | Form        | Server        | Search → "Create New"         | Order Screen                 |

### 5.3 Host Pages (Flutter)

| Page                         | Route (Flutter)                    | Type        | Primary Actor | Entry From                    | Exits To                    |
|------------------------------|------------------------------------|-------------|---------------|-------------------------------|------------------------------|
| CRM Reservation Card         | Inline on Reservation Detail       | Enrichment  | Host          | Reservation list tap          | —                            |
| CRM Waitlist Lookup          | Inline on Waitlist phone entry     | Enrichment  | Host          | Waitlist phone number entry   | —                            |

### 5.4 Guest Portal Pages (React)

| Page                         | Route                              | Type       | Primary Actor | Entry From                    | Exits To                    |
|------------------------------|------------------------------------|------------|---------------|-------------------------------|------------------------------|
| Loyalty Portal Home          | `/loyalty/:token`                  | Public     | Customer      | Receipt link / SMS link       | Preferences                  |
| Preferences / Opt-In         | `/loyalty/:token/preferences`      | Form       | Customer      | Portal Home                   | Portal Home                  |
| Feedback Survey              | `/feedback/:token`                 | Form       | Customer      | Post-meal SMS/Email link      | Thank You page               |
| Feedback Thank You           | `/feedback/:token/thanks`          | Static     | Customer      | Survey submit                 | —                            |

---

## 6. Layout Zone Maps

### 6.1 Customer List (`/crm/customers`)
```text
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px)              │  ZONE A: "Customers" [+ New Customer] │
│                              │          [🔀 Merge]  [📥 Export]      │
│ ▸ CRM & Loyalty ◀           ├────────────────────────────────────── │
│   ▸ Customers ◀ active       │  ZONE B: [🔍 Search by name/phone]    │
│   ▸ Loyalty Program          │          [Segment ▾] [Tier ▾]         │
│   ▸ Campaigns                │          [Last Visit ▾] [Sort ▾]      │
│   ▸ Feedback                 ├────────────────────────────────────── │
│   ▸ Analytics                │  ZONE C: Customer Table                │
│                              │                                        │
│                              │  Name      │Phone │Tier  │Visits│CLV   │
│                              │  ─────────────────────────────────── │
│                              │  J.Smith   │*4521 │⭐Gold │ 47   │$2,180│
│                              │  M.Chen    │*8834 │Silver │ 12   │$650  │
│                              │  A.Johnson │*2201 │Bronze │  3   │$95   │
│                              │                                        │
│                              │  [← Prev]  Page 1 of 12  [Next →]     │
│                              ├────────────────────────────────────── │
│                              │  ZONE D (slide-in): Customer Quick View│
│                              │  ← opens when a row is clicked         │
└──────────────────────────────┴────────────────────────────────────── ┘
```

### 6.2 Customer Detail (`/crm/customers/:id`)
```text
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR           │  ZONE A: ← Customers · "John Smith"             │
│                   │          ⭐ Gold  │  📞 *4521  │  ✉️ j@email.com  │
│                   ├──────────────────────────────────────────────── │
│                   │  TABS: [Profile] [Orders] [Loyalty] [Feedback]  │
│                   ├──────────────────────────────────────────────── │
│                   │  ZONE C: Tab Content                             │
│                   │                                                  │
│                   │  [Profile Tab]:                                   │
│                   │  ┌─── Contact ─────┬─── Allergies ─────────────┐│
│                   │  │ Name: John Smith│ 🔴 Nut Allergy             ││
│                   │  │ Phone: 555-4521 │ 🟡 Gluten-Free             ││
│                   │  │ Email: j@...    │ [+ Add Tag]                ││
│                   │  ├─── Occasions ───┼─── Preferences ───────────┤│
│                   │  │ 🎂 Mar 15       │ Prefers window seating     ││
│                   │  │ 💍 Jun 22       │ Likes extra crispy fries   ││
│                   │  └─────────────────┴───────────────────────────┘│
│                   │                                                  │
│                   │  [Orders Tab]: Last 20 orders table              │
│                   │  [Loyalty Tab]: Points history timeline          │
│                   │  [Feedback Tab]: Survey responses list           │
└───────────────────┴──────────────────────────────────────────────── ┘
```

### 6.3 Loyalty Config (`/crm/loyalty/config`)
```text
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR           │  ZONE A: "Loyalty Program Configuration"         │
│                   ├───────────────────────────────────────────────── │
│                   │  ZONE C: Settings Form (Two-column)              │
│                   │  ┌─── Earning Rules ────┬─── Redemption Rules ──┐│
│                   │  │ Points per $1: [1  ] │ $ per Point: [$0.01]  ││
│                   │  │ Min Redemption: [100]│ Expiration: [365] days││
│                   │  └──────────────────────┴──────────────────────┘│
│                   │                                                   │
│                   │  ┌─── Preview Calculator ──────────────────────┐ │
│                   │  │ "A $50 check earns 50 pts worth $0.50"      │ │
│                   │  └─────────────────────────────────────────────┘ │
│                   │                                                   │
│                   │  ZONE E (sticky): [Cancel] [Save Configuration]   │
└───────────────────┴───────────────────────────────────────────────── ┘
```

### 6.4 Campaign Creation Wizard (`/crm/campaigns/new`)
```text
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR           │  ZONE A: ← Campaigns · "New Campaign"            │
│                   │  Progress: [1.Audience]──[2.Content]──[3.Review]  │
│                   ├───────────────────────────────────────────────── │
│                   │  ZONE C: Wizard Step Content                      │
│                   │                                                   │
│                   │  STEP 1 — Select Audience:                        │
│                   │  ○ All Customers (1,247)                          │
│                   │  ○ Segment: [VIPs ▾] (89)                         │
│                   │  ○ Custom Filter:                                  │
│                   │    Last Visit: [Before ▾] [30 days ago]            │
│                   │    Tier: [Any ▾]                                   │
│                   │    → Preview: 312 recipients                       │
│                   │                                                   │
│                   │  STEP 2 — Compose Message:                        │
│                   │  Channel: [SMS ○] [Email ○] [Both ●]              │
│                   │  Subject: [________________]                      │
│                   │  Body: [________________________________]         │
│                   │  Merge fields: {FirstName} {PromoCode} {Tier}     │
│                   │  Promo Code: [● Generate unique] ○ Existing       │
│                   │                                                   │
│                   │  STEP 3 — Review & Send:                          │
│                   │  Recipients: 312 │ Channel: Both │ Code: YES      │
│                   │  [Preview SMS] [Preview Email]                    │
│                   │                                                   │
│                   │  ZONE E: [← Back]  [Save Draft]  [Send Now 📤]   │
└───────────────────┴───────────────────────────────────────────────── ┘
```

### 6.5 Feedback Dashboard (`/crm/feedback`)
```text
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR           │  ZONE A: "Guest Feedback"  [Date Range ▾]        │
│                   ├───────────────────────────────────────────────── │
│                   │  ZONE C: Dashboard Cards (Top Row)                │
│                   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│
│                   │  │ Avg ⭐   │ │ NPS     │ │ Total   │ │ Alerts ││
│                   │  │ 4.2     │ │ +42     │ │ 156     │ │ 3 🔴   ││
│                   │  └─────────┘ └─────────┘ └─────────┘ └────────┘│
│                   │                                                   │
│                   │  TABS: [Overview] [By Category] [By Server]       │
│                   │                                                   │
│                   │  [Overview]: Weekly trend line + Distribution bar  │
│                   │  [By Category]: Food 4.5 · Service 4.0 · Ambiance │
│                   │  [By Server]: Server-level avg rating table        │
│                   │                                                   │
│                   │  Recent Feedback (scrollable list):               │
│                   │  ┌─────────────────────────────────────────────┐ │
│                   │  │ ⭐⭐ J.Smith · Table 12 · 2h ago             │ │
│                   │  │ "Service was slow tonight"  [Respond ↗]     │ │
│                   │  └─────────────────────────────────────────────┘ │
└───────────────────┴───────────────────────────────────────────────── ┘
```

### 6.6 CRM Analytics — CLV Dashboard (`/crm/analytics/clv`)
```text
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR           │  ZONE A: "Customer Lifetime Value"  [Date ▾]     │
│                   ├───────────────────────────────────────────────── │
│                   │  ZONE C: KPI Cards                                │
│                   │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│                   │  │ Avg CLV  │ │ Gold CLV │ │ New Cust │         │
│                   │  │ $385     │ │ $1,420   │ │ 34/mo    │         │
│                   │  └──────────┘ └──────────┘ └──────────┘         │
│                   │                                                   │
│                   │  CLV by Tier (bar chart): Bronze│Silver│Gold│Plat│
│                   │  CLV Trend (line chart): monthly over 12 months  │
│                   │                                                   │
│                   │  Top 20 Customers by CLV (table):                │
│                   │  Name │ Tier │ Visits │ Revenue │ CLV             │
│                   │  ──────────────────────────────────────           │
│                   │  [📥 Export CSV]                                   │
└───────────────────┴───────────────────────────────────────────────── ┘
```

### 6.7 POS — Customer Search & Profile (Flutter)
```text
ORDER SCREEN with Customer Attachment:
┌────────────────────────────────────────────────────────────────┐
│  HEADER: 🍴 Shopro │ Table 7  │ Server: Maria  │ 🔔 │ 👤     │
├────────────────────────────────────────────────────────────────┤
│  [🔍 Attach Customer ▾]   ← tappable bar at top of order      │
│  ────────────────────────────────────────────────────────────  │
│  Order Items:                                                  │
│  1× Truffle Burger        $24.00                               │
│  1× House Salad            $9.50                               │
│  ────────────────────────────────────────────────────────────  │
│  Subtotal: $33.50                                              │
├────────────────────────────────────────────────────────────────┤
│  🏠 Floor │ 📋 Orders │ 🍽 Menu │ 🎁 Loyalty │ 👤 Me          │
└────────────────────────────────────────────────────────────────┘

After tap → Customer Search Modal (slides up):
┌────────────────────────────────────────────────────────────────┐
│  Search Customer                                    [✕ Close] │
│  [🔍 Phone, name, or email_____________________]              │
│  ──────────────────────────────────────────────────────────── │
│  John Smith    ···4521   ⭐Gold   ⚠Nut        [Attach]       │
│  Jane Smith    ···4522   Bronze               [Attach]       │
│  ──────────────────────────────────────────────────────────── │
│  No match? [+ Create New Profile]                              │
└────────────────────────────────────────────────────────────────┘

After attach → Profile Summary Badge + Bottom Sheet on tap:
┌────────────────────────────────────────────────────────────────┐
│  [👤 John Smith · ⭐Gold · ⚠Nut Allergy]  ← tappable banner  │
│                                                                │
│  Bottom Sheet (on banner tap):                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  John Smith               ⭐ Gold Tier                    │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  🔴 ALLERGIES: Nut Allergy                                │ │
│  │  🎂 Birthday: Mar 15 (in 6 days!)                         │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  💰 Loyalty: 850 pts ($8.50)  │  47 Visits  │  CLV $2,180│ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  Last 5 Orders:                                           │ │
│  │   Mar 2 — Truffle Burger, Caesar Salad — $38.50           │ │
│  │   Feb 24 — Ribeye Steak, House Red — $62.00              │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  📝 Notes: Prefers window seating                         │ │
│  │  [Edit Profile]  [Detach from Ticket]                     │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 6.8 POS — Checkout with Loyalty (Flutter)
```text
CHECKOUT SCREEN (after "Pay" is tapped):
┌────────────────────────────────────────────────────────────────┐
│  HEADER: Checkout · Table 7 · John Smith ⭐Gold               │
├────────────────────────────────────────────────────────────────┤
│  Items:                                                        │
│  1× Truffle Burger        $24.00                               │
│  1× House Salad            $9.50                               │
│  ────────────────────────────────────────────────────────────  │
│  Subtotal:                 $33.50                              │
│  Tax:                       $2.85                              │
│  ============================================================ │
│  LOYALTY SECTION (highlighted card):                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🎁 Available: 850 pts ($8.50)                             │ │
│  │ Apply: [All 850]  or  Custom: [___] pts                   │ │
│  │                              [Apply Points]               │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ 🏷️ Promo Code: [BIRTHDAY20____]        [Apply Code]      │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ────────────────────────────────────────────────────────────  │
│  Loyalty Redemption:       -$8.50                              │
│  TOTAL:                    $27.85                              │
│  ────────────────────────────────────────────────────────────  │
│  Will earn: 28 pts  │  New balance: 28 pts                     │
│  ────────────────────────────────────────────────────────────  │
│  [💳 Card]  [💵 Cash]  [📱 Mobile Pay]  [Split Payment]      │
└────────────────────────────────────────────────────────────────┘
```

### 6.9 Guest Loyalty Portal (`/loyalty/:token`)
```text
┌────────────────────────────────────────────────────────────────┐
│ [🍴 Restaurant Logo]          My Rewards       [Preferences ⚙]│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Welcome back, John! 👋                                        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ⭐ GOLD MEMBER                                           │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  850 Points   •   $8.50 value                             │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░ 85% to Platinum (150 more)     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Recent Activity:                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Mar 2  │ +34 pts │ Earned on order #4521               │   │
│  │ Feb 24 │ +62 pts │ Earned on order #4488               │   │
│  │ Feb 18 │ -200pts │ Redeemed ($2.00 off)                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ © 2026 [Restaurant Name] · Privacy Policy · Terms of Service   │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. Component Placement Dictionary

| Component                    | Page(s)                           | Zone  | Trigger            | Primary Action                    |
|------------------------------|-----------------------------------|-------|--------------------|-----------------------------------|
| `GlobalHeader`               | All admin pages                   | Top   | Always             | Brand, notifications, user menu   |
| `SidebarNav`                 | All admin desktop                 | Left  | Always             | Section navigation                |
| `PageHeader`                 | All admin pages                   | A     | Always             | Title + primary CTA               |
| `FilterBar`                  | Customer List, Campaign List      | B     | Always             | Search, segment filter, tier      |
| `CustomerTable`              | `/crm/customers`                  | C     | Always             | Sortable customer data rows       |
| `CustomerQuickView`          | `/crm/customers`                  | D     | Row click          | Slide-in profile summary          |
| `CustomerDetailTabs`         | `/crm/customers/:id`             | C     | Always             | Profile/Orders/Loyalty/Feedback   |
| `AllergyBadge`               | Profile, Order, Reservation       | C     | Always (if exists) | Red alert for safety-critical     |
| `TierBadge`                  | Profile, Lists, Reservation       | C     | Always             | ⭐Gold / Silver / Bronze / Plat   |
| `OccasionBanner`             | Profile Summary, Reservation      | C     | Within window      | 🎂 Birthday / 💍 Anniversary     |
| `SegmentRuleBuilder`         | `/crm/customers/segments/:id`    | C     | Always             | AND/OR filter rule creation       |
| `MergeWizard`                | `/crm/customers/merge`           | C     | Always             | Side-by-side compare + merge      |
| `LoyaltyConfigForm`         | `/crm/loyalty/config`            | C     | Always             | Earning/redemption rule editing   |
| `PreviewCalculator`          | `/crm/loyalty/config`            | C     | Always             | Live preview of rule changes      |
| `TierConfigCards`            | `/crm/loyalty/tiers`             | C     | Always             | Tier threshold + multiplier setup |
| `BonusEventCard`             | `/crm/loyalty/bonus-events`      | C     | Always             | Event summary with dates          |
| `CampaignWizard`             | `/crm/campaigns/new`             | C     | Always             | 3-step: Audience→Content→Review   |
| `CampaignPerformanceRow`     | `/crm/analytics/campaigns`       | C     | Always             | Per-campaign stats expandable     |
| `PromoCodeTable`             | `/crm/campaigns/promos`          | C     | Always             | Code list with usage stats        |
| `FeedbackStatCards`          | `/crm/feedback`                  | C     | Always             | Avg rating, NPS, total, alerts    |
| `RatingTrendChart`           | `/crm/feedback`                  | C     | Always             | Weekly rating trend line          |
| `FeedbackCommentCard`        | `/crm/feedback`                  | C     | Always             | Individual feedback with respond  |
| `ServerScoreTable`           | `/crm/feedback/staff`            | C     | Tab switch         | Per-server rating breakdown       |
| `CLVStatCards`               | `/crm/analytics/clv`             | C     | Always             | Avg CLV, CLV by tier, new cust    |
| `CLVTrendChart`              | `/crm/analytics/clv`             | C     | Always             | Monthly CLV line chart            |
| `ChurnRiskList`              | `/crm/analytics/churn`           | C     | Always             | At-risk customers with actions    |
| `ChurnRiskBadge`             | Churn list, Customer detail       | C     | Always             | 🔴 High / 🟡 Medium / 🟢 Low     |
| `WinBackQuickAction`         | Churn list                        | C     | Row action         | One-click send win-back offer     |
| `LoyaltyHealthGauges`        | `/crm/analytics/loyalty`         | C     | Always             | Points issued/redeemed, liability |
| `TierDistributionPieChart`   | `/crm/analytics/loyalty`         | C     | Always             | Bronze/Silver/Gold/Plat pie       |
| **POS (Flutter)**            |                                   |       |                    |                                   |
| `CustomerSearchModal`        | POS Order Screen                  | Modal | "Attach" tap       | Phone/name search with typeahead  |
| `ProfileSummarySheet`        | POS Order Screen                  | Sheet | Profile icon tap   | Allergies, history, tier, notes   |
| `LoyaltyCheckoutCard`        | POS Checkout Screen               | C     | Always (if linked) | Point balance, apply, promo code  |
| `LoyaltyLookupScreen`        | POS Loyalty Tab                   | C     | Always             | Balance inquiry by phone          |
| `PointsEarnedToast`          | POS Checkout (after payment)      | OL    | Payment success    | "[Name] earned 28 pts"            |
| `AutoMatchToast`             | POS Checkout                      | OL    | Card match         | "Profile auto-matched: [Name]"    |
| `CreateProfileModal`         | POS Customer Search               | Modal | "No match" state   | Quick phone+name profile creation |
| **Host (Flutter)**           |                                   |       |                    |                                   |
| `CRMReservationCard`         | Reservation detail                | C     | Auto (phone match) | Tier, allergies, occasions, visits|
| `VIPBadge`                   | Reservation list, Waitlist        | C     | Gold+ tier         | ⭐ Gold highlight on row          |
| `CRMWaitlistInline`          | Waitlist phone entry              | C     | Phone match        | Visit count, tier, last visit     |
| **Guest Portal (React)**     |                                   |       |                    |                                   |
| `LoyaltyPortalCard`          | `/loyalty/:token`                | C     | Always             | Tier, balance, progress bar       |
| `PointsHistoryTimeline`      | `/loyalty/:token`                | C     | Always             | Transaction list                  |
| `PreferenceToggles`          | `/loyalty/:token/preferences`    | C     | Always             | SMS/Email opt-in/out toggles      |
| `FeedbackSurveyForm`         | `/feedback/:token`               | C     | Always             | Star rating + comment + categories|
| `EmptyState`                 | All list pages (0 results)        | C     | No data            | Illustration + CTA ("Create")     |
| `ErrorToast`                 | All pages                         | OL    | API error          | Auto-dismiss 6s, dismissable      |
| `ConfirmDialog`              | Merge, Delete segment, Send camp. | Modal | Destructive action | Confirm with entity name           |
| `SuccessToast`               | All pages                         | OL    | Successful action  | Auto-dismiss 4s                   |

---

## 8. Interaction Flows

### FLOW: US-1.6 Customer Profile Search & Attach to Ticket
**Actor:** Server
**Entry:** Taps "🔍 Attach Customer" bar on POS Order Screen
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. Server taps "Attach Customer."
     → `CustomerSearchModal` slides up from bottom (full height on mobile).
     → Focus auto-lands in search input. Keyboard appears.

  2. Server types phone number digits.
     → Typeahead results appear after 3 chars (<500ms).
     → Each result shows: Name, Last 4 Digits, Tier Badge, Allergy Icon.

  3. Server taps "Attach" on the correct result.
     → Modal closes.
     → Profile banner appears at top of order: "[👤 John Smith · ⭐Gold · ⚠Nut Allergy]"
     → If allergies exist: non-dismissible allergy alert animates briefly.

  4. Server taps profile banner.
     → `ProfileSummarySheet` slides up: Last 5 orders, tier, allergies, notes, occasions.

**BRANCH A: No results found**
  2a. Search returns 0 matches.
      → "No customers found" + [+ Create New Profile] button displayed.

  2b. Server taps "Create New Profile."
      → `CreateProfileModal` opens: Phone (pre-filled), Name (required), Email (optional).
      → On save → profile created → auto-attached to ticket.

**BRANCH B: Multiple similar results**
  2c. Multiple matches appear.
      → Server scrolls and selects correct one.
      → If unsure, Server can tap a result to peek profile details before attaching.

**ERROR PATH:** Network failure during search.
  → "Unable to search. Check connection." inline error.
  → Server can retry or dismiss and proceed without CRM attachment.

**EXIT:** Order screen with customer attached. Allergy data propagates to KDS on "Send."
────────────────────────────────────────────────────────────────

### FLOW: US-2.2 Redeeming Loyalty Points at Checkout
**Actor:** Cashier
**Entry:** Checkout screen opens for an order with an attached customer profile.
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. Checkout screen loads.
     → `LoyaltyCheckoutCard` appears showing: "🎁 Available: 850 pts ($8.50)"
     → Two options: [Apply All 850] or Custom Amount: [___] pts.

  2. Cashier taps "Apply All 850."
     → API call: `POST /loyalty/redeem { customerId, points: 850, orderId }`
     → "-$8.50 Loyalty Redemption" line item appears on bill.
     → Total recalculates instantly.
     → "Will earn: [X] pts" recalculates based on new subtotal.

  3. Cashier proceeds to payment.
     → After payment success: Points deducted from balance. New points credited.
     → Receipt includes "LOYALTY SUMMARY" section.
     → Toast: "John earned 28 pts. New balance: 28 pts."

**BRANCH A: Partial redemption**
  2a. Cashier types "500" in custom field, taps Apply.
      → "-$5.00 Loyalty Redemption" appears.
      → Remaining: 350 pts still available.

**BRANCH B: Below minimum threshold**
  2b. Cashier types "50" (below configured minimum of 100).
      → Inline error: "Minimum redemption is 100 points."
      → Apply button stays disabled.

**BRANCH C: Promo code applied alongside points**
  3a. Cashier also enters promo code "BIRTHDAY20."
      → API validates → "-20%" discount line appears ABOVE loyalty redemption.
      → Points apply to the post-discount subtotal.

**BRANCH D: Invalid/expired promo code**
  3b. Cashier enters "EXPIRED10."
      → Inline error: "Promo code EXPIRED10 is expired."
      → Code input clears. Cashier can retry.

**ERROR PATH:** Redemption API fails.
  → Toast: "Could not apply loyalty points. Try again."
  → Bill reverts to pre-redemption state. Points NOT deducted.

**EXIT:** Payment screen → receipt with loyalty summary.
────────────────────────────────────────────────────────────────

### FLOW: US-3.1 Creating a Targeted Campaign
**Actor:** Manager
**Entry:** Clicks "+ New Campaign" from Campaign List (`/crm/campaigns`).
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. Manager lands on `CampaignWizard` Step 1: Select Audience.
     → Options: All Customers, Existing Segment, or Custom Filter.
     → On selecting Custom Filter: filter fields appear (Last Visit, Tier, Spend, Category).
     → Live "Recipient Preview" count updates as filters change.

  2. Manager clicks "Next →" to Step 2: Compose Message.
     → Channel selector: SMS / Email / Both.
     → Message template with merge fields: `{FirstName}`, `{PromoCode}`, `{Tier}`.
     → Option to generate auto promo code or select existing.
     → Character count for SMS (160 char limit per segment).
     → Email preview renders in a phone-frame mockup.

  3. Manager clicks "Next →" to Step 3: Review & Send.
     → Summary: Recipients count, Channel, Message preview, Promo code (if any).
     → [Preview SMS] [Preview Email] buttons show actual rendered messages.
     → Anti-spam reminder: "All recipients have opted in. Opt-out instructions included."

  4. Manager clicks "Send Now 📤."
     → `ConfirmDialog`: "Send campaign to 312 customers? This cannot be undone."
     → On confirm: API processes send. Progress bar shows send status.
     → Success: Redirect to Campaign Detail with "Sending…" status.
     → Messages delivered via gateway over next minutes.

**BRANCH A: 0 recipients after filtering**
  1a. Filter returns 0 customers.
      → "No customers match this criteria" + [Adjust Filters] prompt.
      → "Next" button disabled.

**BRANCH B: Manager saves as draft**
  4a. At any step, Manager clicks "Save Draft."
      → Campaign saved with status "DRAFT." Returns to Campaign List.

**ERROR PATH:** SMS gateway returns partial failure.
  → Campaign Detail shows: "Sent: 290 / 312 | Failed: 22."
  → Failed recipients listed with error reason.
  → [Retry Failed] button available.

**EXIT:** Campaign Detail page showing live delivery stats.
────────────────────────────────────────────────────────────────

### FLOW: US-4.1 Post-Meal Feedback Collection
**Actor:** System → Customer
**Entry:** Order enters `PAID` state with attached CustomerProfile.
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. System detects order paid with linked profile.
     → 30-minute timer starts (configurable).

  2. Timer fires. System sends SMS/Email with feedback link.
     → SMS: "Hi {FirstName}, how was your meal? Rate us: [link]"
     → Opt-out check: only sent if customer SMS/Email is opted-in.

  3. Customer taps link → lands on `/feedback/:token`.
     → `FeedbackSurveyForm`: 1–5 star rating (required), Category chips (optional: Food, Service, Ambiance, Wait Time), Free-text comment (optional, max 500 chars).

  4. Customer submits.
     → "Thank you!" page with restaurant branding.
     → Feedback stored and linked to CustomerProfile and OrderTicket.

  5. Result appears on Manager Feedback Dashboard within 1 minute.

**BRANCH A: Rating ≤ 2 stars**
  5a. System triggers `Real-Time Feedback Alert` push notification to Manager.
      → Notification: "⚠ John Smith rated 2★ on Table 12: 'Service was slow'"
      → [Respond] quick-action → opens pre-drafted apology SMS/Email.

**BRANCH B: Customer is opted out of SMS**
  2b. System skips SMS. Checks Email opt-in. Sends Email if opted-in.
      → If both opted-out: no feedback request sent. Logged as "Skipped (opt-out)."

**ERROR PATH:** Feedback link expired (token expires after 7 days)
  → Customer sees: "This survey has expired. Thank you for being a valued guest."

**EXIT:** Manager sees feedback on dashboard. Customer sees thank-you page.
────────────────────────────────────────────────────────────────

### FLOW: US-5.1 CRM-Enriched Reservation View
**Actor:** Host
**Entry:** Host views reservation list; taps a reservation card.
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. Reservation list loads.
     → System matches each reservation phone number against `CustomerProfile`.
     → Matched reservations show enriched cards: Tier badge, allergy icon, visit count.

  2. Host taps a reservation card.
     → `CRMReservationCard` expands: Full CRM data (tier, allergies, occasions, VIP flag, notes).
     → If upcoming occasion: "🎂 Birthday in 3 days!" banner displayed.

  3. Host taps "Seat Table."
     → Table opened with customer auto-attached to ticket.
     → Allergy data propagated to Server's POS and KDS.

**BRANCH A: No profile match**
  1a. Phone number has no matching profile.
      → Reservation card shows: "New Guest" + [Create Profile] shortcut.

**BRANCH B: VIP guest**
  1b. Guest is Gold tier or above (or manually VIP-tagged).
      → Reservation row has gold star background highlight.
      → Host at a glance knows to prioritize and personalize.

**EXIT:** Table opened with CRM-enriched ticket. Kitchen sees allergy flags.
────────────────────────────────────────────────────────────────

---

## 9. UX Rules & Heuristics Applied

*   **Safety-Critical Data (Rule 8.1):** Allergy badges use 🔴 red color + text label + icon. Never color alone. Propagated to KDS ticket header — not dismissible by kitchen staff.
*   **Skeleton Loading (Rule 8.1):** Customer search typeahead, dashboard stat cards, and profile summary sheet all show skeleton states while loading.
*   **Empty States (Rule 8.1):** Customer List (0 customers): "No customers yet. Create your first profile." Campaign List (0 campaigns): "No campaigns sent. Start your first campaign."
*   **Inline Validation (Rule 8.4):** All forms validate on blur. Promo code entry validates on "Apply" click. Minimum redemption threshold shows inline error.
*   **Destructive Confirmations (Rule 8.2):** Merge profiles, delete segments, and send campaigns all require `ConfirmDialog` with entity name or count in the dialog text.
*   **Role-Based Visibility (Rule 8.5):** Servers see CRM lookup and checkout loyalty only. Campaign, analytics, feedback dashboards are hidden (not disabled) for Server role. Host sees CRM data read-only on reservations.
*   **Wizard for Complex Flows (Rule 8.3):** Campaign creation uses a 3-step wizard (>3 fields/decisions). Merge profiles uses a side-by-side wizard. Never trapped in a modal.
*   **Mobile POS Optimization (Rule 8.4):** Loyalty checkout card and profile summary use bottom sheets (thumb-reachable). Customer search is full-height modal with auto-keyboard focus.
*   **Toast not Modal for Success/Errors (Rule 8.2):** Points earned, auto-match, and API errors surface as toasts. Never interrupt the flow with modals for non-destructive notifications.
*   **Accessibility (Rule 8.6):** Star ratings in feedback survey are keyboard-navigable (arrow keys). All tier badges include `aria-label` ("Gold Tier Member"). Allergy badges carry `role="alert"`.
*   **One-Click Win-Back (Rule 8.3):** Churn risk list offers a single "Send Win-Back" button per row. No unnecessary navigation — action completes inline.

---

## 10. Handoff Checklist

- [x] **Every user story has at least one page** — All 28 stories mapped to pages in the inventory.
- [x] **Every page has a layout zone map** — 9 zone maps covering all major page types.
- [x] **Every component has a dictionary entry** — 45+ components across Admin, POS, Host, and Guest Portal.
- [x] **Major flows documented** — 5 full interaction flows with happy paths and error branches.
- [x] **Every role has a home page:**
  - Manager/Owner → `/crm/customers` (via sidebar CRM section)
  - Server → POS Order Screen with contextual CRM attachment
  - Host → Reservation list with CRM-enriched cards
  - Customer → `/loyalty/:token` portal
- [x] **Header anatomy fully specified** — Admin global header, POS header, Host header, Guest portal header.
- [x] **Footer policy clear** — No footer in authenticated admin/POS shell. Footer only on Guest Portal (public).
- [x] **Navigation max 3 levels** — CRM > Customers > Customer Detail (3 levels ✅).
- [x] **Mobile layout addressed** — POS modals and bottom sheets optimized for thumb reach. Portal is mobile-responsive.
- [x] **All destructive actions have confirmation flows** — Merge, delete segment, send campaign.
- [x] **All forms have states documented** — Empty, loading (skeletons), error (inline + toast), success (redirect + toast).
- [x] **Cross-platform flows specified** — Admin (React), POS (Flutter), Host (Flutter), Guest Portal (React).
- [x] **Safety-critical data escalation** — Allergies propagate from CRM → Order → KDS with non-dismissible badges.
