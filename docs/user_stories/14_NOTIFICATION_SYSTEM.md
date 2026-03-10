# Multi-Channel Notification System — Design Document

> **Version:** 2.1
> **Status:** Draft
> **Scope:** Full-stack Multi-Channel Notification System (MCNS) supporting In-App (WebSocket), Email, WhatsApp, and Push Notifications (FCM/APNs) with a UI-driven admin console. Designed specifically for **Shopro POS** operational alerts with user-specific muting, real-time sync, state-dependent recall, TTL management, and rich actionable data over a unified dispatch engine.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Core Concepts & Terminology](#3-core-concepts--terminology)
4. [Database Schema](#4-database-schema)
5. [Notification Types & POS Role Mapping](#5-notification-types--pos-role-mapping)
6. [Epic 1 — Core Type & Template Management](#6-epic-1--core-type--template-management)
7. [Epic 2 — Channel Configuration](#7-epic-2--channel-configuration)
8. [Epic 3 — Recipient & Routing Management](#8-epic-3--recipient--routing-management)
9. [Epic 4 — Real-Time POS In-App Operations](#9-epic-4--real-time-pos-in-app-operations)
10. [Epic 5 — Sending, Reliability & Escalation](#10-epic-5--sending-reliability--escalation)
11. [Epic 6 — Monitoring & Logs](#11-epic-6--monitoring--logs)
12. [UI Screens & Wireframe Descriptions](#12-ui-screens--wireframe-descriptions)
13. [API Design](#13-api-design)
14. [Channel Integration Specifications](#14-channel-integration-specifications)
15. [Notification Dispatch Engine](#15-notification-dispatch-engine)
16. [Security & Access Control](#16-security--access-control)
17. [Non-Functional Requirements](#17-non-functional-requirements)
18. [Glossary](#18-glossary)

---

## 1. Executive Summary

The Multi-Channel Notification System (MCNS) for Shopro POS is a centralized platform allowing Restaurant Operators to define **notification types**, configure **delivery channels** (In-App via WebSocket, Email, WhatsApp, FCM Push, APNs Push), assign **recipients per channel**, and trigger operational alerts programmatically or manually.

It bridges high-volume POS operational cues (e.g., *"Order Ready"*, *"Table Needs Assistance"*) with multi-channel off-site alerting for management (e.g., *"Critical Stock Breach"*, *"PO Approval Required"*).

Crucially, the system supports:
- **State-dependent recall** — notifications vanish when the underlying issue is resolved (e.g., table marked clean auto-cancels all `TABLE_DIRTY` alerts).
- **Multi-device state sync** — reading or dismissing on one device instantly syncs to all devices for the same user.
- **Deep linking** — notification tap navigates directly to the relevant POS entity (order, table, PO, stock item).
- **Per-user muting** — staff can opt out of non-critical notification types without affecting global routing.
- **TTL-based purging** — a scheduled job keeps the in-app notification store lean for performance.

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Console (UI)                        │
│  Notification Types │ Channel Config │ Recipients │ Logs     │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST / GraphQL
┌──────────────────────────▼──────────────────────────────────┐
│                     Notification API                         │
│   POST /notifications/send   GET /types   GET /channels      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               Notification Dispatch Engine                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Job Queue  │  │ Template     │  │  Recipient         │  │
│  │  (Redis /   │  │ Renderer     │  │  Resolver          │  │
│  │   BullMQ)   │  │ (Handlebars) │  │  (DB Lookup)       │  │
│  └──────┬──────┘  └──────────────┘  └────────────────────┘  │
└─────────┼───────────────────────────────────────────────────┘
          │  Fan-out per channel
  ┌───────┼─────────────────────────────────────────┐
  │       │                   │                     │
  ▼       ▼                   ▼                     ▼
Web     Email               WhatsApp           FCM / APNs
Socket  (SMTP/SendGrid)    (Meta Bus. API)    (Firebase/Apple)
  │       │                   │                     │
  └───────┴───────────────────┴─────────────────────┘
                      │
         ┌────────────▼────────────┐
         │  Delivery Log (DB)      │
         │  status, timestamp,     │
         │  error, retry count     │
         └─────────────────────────┘
```

### WebSocket Event Types

The In-App channel communicates exclusively over a persistent WebSocket connection. Four event types are used:

| WS Event | Direction | Trigger |
|---|---|---|
| `WS_NEW` | Server → Client | New notification dispatched to user |
| `WS_UPDATE` | Server → Client | Read/dismissed state changed on another device |
| `WS_CANCEL` | Server → Client | `correlation_id` resolved; remove from UI |
| `WS_ACK` | Client → Server | Client confirms receipt of a `WS_NEW` event |

---

## 3. Core Concepts & Terminology

| Term | Definition |
|---|---|
| **Notification Type** | A named, reusable event definition (e.g., `ORDER_READY`, `STOCK_CRITICAL`) with a severity level. |
| **Channel** | A delivery mechanism: In-App (WebSocket), Email, WhatsApp, FCM (Android/Web push), or APNs (iOS push). |
| **Channel Configuration** | The credentials and settings required to operate a channel (e.g., SMTP host, WhatsApp API key, FCM server key). |
| **Recipient** | A person or system endpoint registered to receive notifications on a specific channel. |
| **Recipient Group** | A named collection of recipients (e.g., `Role: Manager`, `Role: Server`) for bulk targeting. Can map directly to POS roles. |
| **Notification Event** | A runtime trigger that names a notification type and supplies dynamic content variables. |
| **Template** | A Handlebars message template associated with a notification type on a given channel. |
| **Correlation ID** | A unique identifier linking a notification to a real-world state object (e.g., `dirty_tb_4`). Used to recall or cancel notifications globally when that state is resolved. |
| **Deep Link Payload** | A JSONB `data` field on in-app notifications (e.g., `{"route": "/inventory/po/123", "id": 123}`) enabling one-tap navigation to the relevant POS entity. |
| **Delivery Log** | An immutable record of every dispatch attempt, its outcome, timing, and rendered payload. |
| **TTL Purger** | A scheduled background job that deletes stale in-app notifications based on read/dismissed status and age thresholds. |
| **Mute Preference** | A per-user, per-type override that suppresses delivery of non-critical notification types for that user. |

---

## 4. Database Schema

### 4.1 `notification_types`

```sql
CREATE TABLE notification_types (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code           VARCHAR(100) UNIQUE NOT NULL,   -- e.g. ORDER_READY
    name           VARCHAR(255) NOT NULL,
    description    TEXT,
    severity       ENUM('INFO','WARNING','CRITICAL') DEFAULT 'INFO',
    is_mutable     BOOLEAN DEFAULT TRUE,           -- FALSE = cannot be muted by users
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

> `is_mutable = FALSE` is enforced for `CRITICAL` severity types (e.g., `VOID_REQUEST`, `SYSTEM_WARNING`). These cannot be suppressed by per-user mute preferences.

---

### 4.2 `channels`

```sql
CREATE TABLE channels (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type           ENUM('IN_APP','EMAIL','WHATSAPP','FCM','APNS') NOT NULL,
    name           VARCHAR(255) NOT NULL,           -- friendly name
    config         JSONB NOT NULL,                  -- encrypted credentials (AES-256-GCM)
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

**`config` JSONB examples by channel type:**

```jsonc
// IN_APP — no external credentials needed; config stores WS metadata
{ "ws_namespace": "/pos-alerts", "heartbeat_interval_ms": 30000 }

// EMAIL (SendGrid)
{ "provider": "sendgrid", "api_key": "SG.xxx", "from_address": "no-reply@shopro.com", "from_name": "Shopro POS" }

// EMAIL (SMTP)
{ "provider": "smtp", "host": "smtp.acme.com", "port": 587, "username": "...", "password": "...", "tls": true, "from_address": "..." }

// EMAIL (AWS SES)
{ "provider": "ses", "region": "us-east-1", "access_key_id": "...", "secret_access_key": "...", "from_address": "..." }

// EMAIL (Mailgun)
{ "provider": "mailgun", "api_key": "...", "domain": "mg.shopro.com", "from_address": "..." }

// WHATSAPP (Meta Cloud API)
{ "provider": "meta", "phone_number_id": "1234567890", "business_account_id": "...", "access_token": "EAAxx...", "template_namespace": "shopro_ns" }

// FCM
{ "project_id": "shopro-pos", "service_account_json": { ... } }

// APNS
{ "key_id": "XXXXXXXXXX", "team_id": "YYYYYYYYYY", "bundle_id": "com.shopro.pos", "private_key_pem": "-----BEGIN...", "environment": "production" }
```

---

### 4.3 `notification_templates`

```sql
CREATE TABLE notification_templates (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type_id  UUID REFERENCES notification_types(id) ON DELETE CASCADE,
    channel_id            UUID REFERENCES channels(id) ON DELETE CASCADE,
    subject               VARCHAR(500),            -- email subject / push title / WS title
    body_template         TEXT NOT NULL,            -- Handlebars template string
    meta                  JSONB,                   -- deep link config, WA template name, push icon URL
    is_active             BOOLEAN DEFAULT TRUE,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (notification_type_id, channel_id)
);
```

**`meta` JSONB examples by channel:**

```jsonc
// IN_APP — deep link routing
{ "route": "/tables/{{table_id}}", "icon": "table-dirty", "color": "warning" }

// EMAIL — reply-to and CC
{ "reply_to": "ops@shopro.com", "cc": ["manager@shopro.com"] }

// WHATSAPP — approved template binding
{ "wa_template_name": "po_approval_v3", "wa_language": "en_US" }

// FCM / APNS — push appearance
{ "icon_url": "https://cdn.shopro.com/icons/alert.png", "click_action": "/inventory/po/{{po_id}}" }
```

---

### 4.4 `recipients`

```sql
CREATE TABLE recipients (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id     UUID REFERENCES channels(id) ON DELETE CASCADE,
    user_id        UUID REFERENCES users(id),       -- NULL for external (vendor) recipients
    name           VARCHAR(255),
    address        VARCHAR(500) NOT NULL,            -- email / E.164 phone / device token
    meta           JSONB,                           -- locale, timezone, device OS, role
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.5 `recipient_groups`

```sql
CREATE TABLE recipient_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,   -- e.g. "Role: Manager", "All Servers"
    description TEXT,
    role_code   VARCHAR(100),            -- optional POS role binding; auto-populates members
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipient_group_members (
    group_id      UUID REFERENCES recipient_groups(id) ON DELETE CASCADE,
    recipient_id  UUID REFERENCES recipients(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, recipient_id)
);
```

> Groups with a `role_code` are **dynamic**: membership is automatically derived at dispatch time from the current POS role roster, not from a static list.

---

### 4.6 `notification_type_channels`

*Links which channels are active for a given notification type, the target recipient group per channel, and an optional fallback channel for escalation.*

```sql
CREATE TABLE notification_type_channels (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type_id  UUID REFERENCES notification_types(id) ON DELETE CASCADE,
    channel_id            UUID REFERENCES channels(id) ON DELETE CASCADE,
    recipient_group_id    UUID REFERENCES recipient_groups(id),
    fallback_channel_id   UUID REFERENCES channels(id),  -- escalation target on failure
    is_active             BOOLEAN DEFAULT TRUE,
    UNIQUE (notification_type_id, channel_id)
);
```

---

### 4.7 `in_app_notifications`

```sql
CREATE TABLE in_app_notifications (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id          UUID REFERENCES users(id) ON DELETE CASCADE,
    type_code             VARCHAR(100) NOT NULL,
    correlation_id        VARCHAR(255),               -- used for WS_CANCEL recall
    title                 VARCHAR(255),
    body                  TEXT,
    data                  JSONB,                      -- deep link: { "route": "...", "id": ... }
    is_read               BOOLEAN DEFAULT FALSE,
    is_dismissed          BOOLEAN DEFAULT FALSE,
    expires_at            TIMESTAMPTZ,                -- set at insert; enforced by TTL purger
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_in_app_recipient    ON in_app_notifications(recipient_id, is_dismissed, created_at DESC);
CREATE INDEX idx_in_app_correlation  ON in_app_notifications(correlation_id) WHERE correlation_id IS NOT NULL;
```

**TTL rules enforced at insert and by the purger job:**
- `is_dismissed = TRUE` or `is_read = TRUE` → `expires_at = created_at + 7 days`
- `is_read = FALSE` and `is_dismissed = FALSE` → `expires_at = created_at + 30 days`

---

### 4.8 `user_notification_preferences`

```sql
CREATE TABLE user_notification_preferences (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type_id  UUID REFERENCES notification_types(id) ON DELETE CASCADE,
    channel_id            UUID REFERENCES channels(id) ON DELETE CASCADE,
    is_muted              BOOLEAN DEFAULT FALSE,
    updated_at            TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, notification_type_id, channel_id)
);
```

> Preferences are ignored at dispatch time when `notification_types.is_mutable = FALSE`.

---

### 4.9 `notification_logs`

```sql
CREATE TABLE notification_logs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_id           UUID NOT NULL,             -- groups all channel jobs for one send event
    notification_type_id  UUID REFERENCES notification_types(id),
    channel_id            UUID REFERENCES channels(id),
    recipient_identifier  VARCHAR(255),              -- email address / phone / device token
    status                ENUM('PENDING','SENT','FAILED','RETRYING') DEFAULT 'PENDING',
    payload               JSONB,                     -- rendered content actually sent
    error_message         TEXT,
    attempt_count         INT DEFAULT 0,
    sent_at               TIMESTAMPTZ,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Notification Types & POS Role Mapping

Default seeded types. All are configurable via the admin console.

| Type Code | Description | Origin | Primary Recipient | Default Channels | Severity |
|:---|:---|:---|:---|:---|:---|
| `ORDER_READY` | Dish ready for pickup at pass | KDS | Server / Runner | In-App (WS) | INFO |
| `ITEM_REJECTED` | Kitchen cannot fulfill a specific item | KDS | Originating Server | In-App (WS) | WARNING |
| `ASSISTANCE_NEEDED` | Customer at table requested help | Table Button | Assigned Server | In-App (WS) | WARNING |
| `TABLE_DIRTY` | Table needs bussing after payment | POS (auto) | Busser / Runner | In-App (WS) | INFO |
| `STOCK_CRITICAL` | Ingredient below critical par level | Inventory | Chef / Manager | In-App, Email | CRITICAL |
| `PO_APPROVAL` | Purchase Order needs sign-off | Inventory | Manager / Owner | In-App, WhatsApp, Email | WARNING |
| `BID_RECEIVED` | New vendor bid for an RFQ | Inventory | Manager | In-App | INFO |
| `VOID_REQUEST` | Server needs approval to void item/bill | POS | Manager | In-App (WS) | CRITICAL |
| `CURBSIDE_ARRIVAL` | Customer arrived at curbside pickup spot | Customer App | Runner | In-App (WS) | INFO |
| `SYSTEM_WARNING` | Device battery low / connection lost | System | System Admin | In-App | CRITICAL |

> `VOID_REQUEST` and `SYSTEM_WARNING` have `is_mutable = FALSE` — they cannot be muted by any staff member.

---

## 6. Epic 1 — Core Type & Template Management

**Goal:** Allow administrators to define the full catalogue of notification events and per-channel message templates.

---

### US-14.1 · Create a Notification Type

**As an** Administrator,
**I want to** define a new notification type with a unique code, name, description, severity, and mute policy,
**So that** the system has a reusable event definition that all channels can subscribe to.

**Acceptance Criteria:**
- `code` must be UPPER_SNAKE_CASE; unique across the system. Duplicate submission returns `409 Conflict`.
- Severity defaults to `INFO`; options are `INFO`, `WARNING`, `CRITICAL`.
- `CRITICAL` types are automatically set to `is_mutable = FALSE` (admin can override to allow muting on non-security-critical types).
- Upon save the type is immediately available for channel routing.
- Creation is recorded in the audit log (actor, timestamp, full diff).

**Entities:** `NotificationType`, `AuditLog`
**Tech Stack:** React + shadcn/ui + Tailwind (Admin Console)

---

### US-14.2 · Edit a Notification Type

**As an** Administrator,
**I want to** edit the name, description, severity, and mute policy of an existing notification type,
**So that** I can keep definitions accurate as the Shopro POS system evolves.

**Acceptance Criteria:**
- The `code` field is immutable after creation to prevent breaking integrations.
- Changing severity to `CRITICAL` automatically sets `is_mutable = FALSE` unless explicitly toggled.
- Changes take effect immediately for all future dispatch events.
- All prior dispatch logs retain the metadata that was active at time of send.

**Entities:** `NotificationType`, `AuditLog`
**Tech Stack:** React + shadcn/ui + Tailwind

---

### US-14.3 · Deactivate / Reactivate a Notification Type

**As an** Administrator,
**I want to** deactivate a notification type without deleting it,
**So that** I can pause a category of alerts (e.g., during maintenance) without losing routing configuration.

**Acceptance Criteria:**
- Deactivating sets `is_active = false`; all subsequent dispatch attempts for this type return `409` with the reason.
- In-flight notifications already queued before deactivation are still delivered.
- A visual toggle (active = green, inactive = grey) is shown in the type list.
- Reactivation restores dispatch behaviour immediately with no configuration loss.

**Entities:** `NotificationType`
**Tech Stack:** React + shadcn/ui + Tailwind

---

### US-14.4 · Define Templates per Channel per Type

**As an** Administrator,
**I want to** define a separate message template (Handlebars `{{variable}}` syntax) for each channel linked to a notification type,
**So that** each channel delivers a message formatted appropriately for its medium.

**Acceptance Criteria:**
- **Email**: Subject line + full HTML body (rich text editor). Supports `{{variable}}` substitution in both.
- **WhatsApp**: Maps to a pre-approved Meta template name; binds `{{variable}}` to positional component parameters.
- **In-App**: Configures `title`, `body`, and the `data` JSONB for deep-link routing (e.g., `{"route": "/tables/{{table_id}}"}`).
- **FCM / APNs**: Short title (≤ 65 chars) and body (≤ 240 chars). `meta` stores click-action URL.
- A live preview panel renders the template using admin-supplied sample variable values.
- Saving validates that all `{{variable}}` tokens in the template have corresponding entries in the type's documented variable schema.

**Entities:** `NotificationTemplate`, `NotificationType`, `Channel`
**Tech Stack:** React + shadcn/ui + Tailwind + Handlebars (preview renderer)

---

## 7. Epic 2 — Channel Configuration

**Goal:** Allow administrators to configure, test, and manage each delivery channel's credentials and settings.

---

### US-14.5 · Configure an Email Channel

**As an** Administrator,
**I want to** configure an email delivery channel by providing SMTP credentials or a SendGrid / Mailgun / AWS SES API key,
**So that** the system can send off-site email alerts for management-level events like `PO_APPROVAL` and `STOCK_CRITICAL`.

**Acceptance Criteria:**
- Supported providers: **SMTP** (generic), **SendGrid**, **Mailgun**, **AWS SES**.
- Required fields vary by provider (see Schema §4.2 for config shapes).
- Credentials stored encrypted at rest (AES-256-GCM); encryption key held in AWS KMS / HashiCorp Vault.
- A **"Send Test Email"** button dispatches a test message to an address entered by the admin before the channel can be marked active.
- Sensitive fields shown masked (`••••••`); admin must re-enter to update.

**Entities:** `Channel`, `AuditLog`
**Tech Stack:** React + shadcn/ui + Tailwind (Admin Console); Node.js (credential encryption)

---

### US-14.6 · Configure a WhatsApp Channel

**As an** Administrator,
**I want to** configure a WhatsApp Business API channel,
**So that** managers receive instant chat-based alerts for approvals and stock breaches when away from the POS terminal.

**Acceptance Criteria:**
- Supported providers: **Meta Cloud API**, **Twilio (WhatsApp)**, **360dialog**.
- Required fields: Phone Number ID, Business Account ID, API Access Token, Webhook Verify Token.
- Admin can browse and select from pre-approved WhatsApp message templates fetched live from the provider API.
- A **"Send Test Message"** flow sends to an admin-supplied E.164 phone number.
- Channel card displays provider name and masked phone number; a warning badge appears if the access token is within 7 days of expiry.

**Entities:** `Channel`, `AuditLog`
**Tech Stack:** React + shadcn/ui + Tailwind

---

### US-14.7 · Configure an FCM Push Channel

**As an** Administrator,
**I want to** upload a Firebase service account JSON key to configure FCM push,
**So that** the system can push notifications to offline staff Android phones and web browser clients.

**Acceptance Criteria:**
- Config requires uploading the Firebase service account JSON file or providing Project ID + Server Key.
- Admin can specify a default notification icon URL and click-action URL base path.
- A **"Send Test Push"** flow accepts a specific device registration token and sends a live test notification.
- The UI warns if the service account JSON's private key expiry date is within 30 days.

**Entities:** `Channel`, `AuditLog`
**Tech Stack:** React + shadcn/ui + Tailwind

---

### US-14.8 · Configure an APNs Push Channel

**As an** Administrator,
**I want to** configure Apple Push Notification service for the Shopro iOS app,
**So that** iOS-device staff receive push alerts when they are off the POS terminal.

**Acceptance Criteria:**
- Supported auth: **APNs Auth Key** (`.p8` + Key ID + Team ID) — preferred; or **APNs Certificate** (`.p12` + passphrase).
- Required: Bundle ID (`com.shopro.pos`), environment toggle (Sandbox / Production).
- A **"Send Test Push"** flow accepts a device token and sends a test alert.
- Certificate / key expiry date displayed prominently; a red warning badge and ops alert fire within 30 days of expiry.

**Entities:** `Channel`, `AuditLog`
**Tech Stack:** React + shadcn/ui + Tailwind

---

### US-14.9 · Deactivate a Channel

**As an** Administrator,
**I want to** deactivate a channel without deleting it,
**So that** I can pause a delivery method (e.g., during WhatsApp API maintenance) without losing configuration or recipient lists.

**Acceptance Criteria:**
- A confirmation modal lists: "X notification types use this channel. Deactivating will pause delivery on this channel for those types."
- Deactivation skips the channel during dispatch; no new jobs are queued to it.
- Existing in-flight jobs already enqueued continue to process.
- Channel, recipients, and routing configuration are fully preserved for reactivation.

**Entities:** `Channel`, `NotificationTypeChannel`
**Tech Stack:** React + shadcn/ui + Tailwind

---

## 8. Epic 3 — Recipient & Routing Management

**Goal:** Define who receives which notification type on which channel, supporting both internal POS roles and external contacts.

---

### US-14.10 · Add a Recipient to a Channel

**As an** Administrator,
**I want to** register a recipient on a specific channel with their contact address,
**So that** the dispatch engine knows exactly where to deliver notifications on that channel.

**Acceptance Criteria:**
- Email: validated against RFC 5322 format.
- WhatsApp / SMS: validated as E.164 format (`+12125550100`).
- FCM / APNs: device registration token; non-empty string validation only.
- In-App: linked to a `user_id` from the POS user table; no separate address field needed.
- Duplicate addresses on the same channel are rejected (`409`).
- Optional fields: name, locale, timezone, custom metadata key-value pairs.

**Entities:** `Recipient`, `Channel`, `User`
**Tech Stack:** React + shadcn/ui + Tailwind

---

### US-14.11 · Bulk Import External Recipients

**As an** Administrator,
**I want to** import a CSV of vendor emails or phone numbers,
**So that** external contacts (e.g., vendors receiving RFQ bid notifications) can be onboarded efficiently.

**Acceptance Criteria:**
- CSV columns: `name`, `address`, `meta` (optional JSON string).
- System shows a preview of the first 10 rows with inline validation highlights before committing.
- Invalid rows (bad email format, non-E.164 phone) are listed in a downloadable error report; valid rows are imported.
- Duplicate detection: existing addresses on the same channel are skipped; a count is shown in the import summary.
- If >50% of rows fail validation the entire import is rejected; admin must fix and re-upload.

**Entities:** `Recipient`, `Channel`
**Tech Stack:** React + shadcn/ui + Tailwind; Node.js CSV parser

---

### US-14.12 · Create a Recipient Group & Assign to Routing Matrix

**As an** Administrator,
**I want to** create named recipient groups (e.g., `Role: Manager`, `All Runners`) and assign them to (Notification Type × Channel) combinations,
**So that** I can control exactly who receives each alert type on each channel.

**Acceptance Criteria:**
- Groups can be **static** (manually curated member list) or **dynamic** (bound to a POS `role_code`; membership resolved at dispatch time).
- The routing UI presents a matrix: Notification Types (rows) × Channels (columns). Each cell has a dropdown to select the recipient group.
- A single notification type can map to different groups on different channels (e.g., `PO_APPROVAL` → `Managers` via Email, but `Managers + Owner` via WhatsApp).
- A cell left empty means that channel is skipped for that type.
- Changes are effective immediately for future dispatches.

**Entities:** `RecipientGroup`, `RecipientGroupMember`, `NotificationTypeChannel`
**Tech Stack:** React + shadcn/ui + Tailwind

---

### US-14.13 · Deactivate a Recipient

**As an** Administrator,
**I want to** deactivate a recipient so they stop receiving notifications without deleting their record,
**So that** I can honour opt-out requests and temporarily suspend off-boarding staff without losing history.

**Acceptance Criteria:**
- Deactivated recipients are excluded from dispatch immediately.
- Their full delivery history in `notification_logs` is preserved.
- Deactivation is reversible; reactivation restores normal dispatch targeting immediately.

**Entities:** `Recipient`
**Tech Stack:** React + shadcn/ui + Tailwind

---

## 9. Epic 4 — Real-Time POS In-App Operations

**Goal:** Deliver a high-performance, real-time in-app notification experience on POS terminals and staff devices with state recall, multi-device sync, deep linking, and user-level muting.

---

### US-14.14 · Real-Time In-App Notification Center

**As a** Staff Member,
**I want to** see a live list of active actionable notifications on my POS terminal,
**So that** I can respond immediately to urgent operational cues without leaving the current screen.

**Acceptance Criteria:**
- A bell icon in the header displays a red badge with the unread count (capped at `99+`).
- Clicking the bell opens a slide-over panel listing notifications in reverse chronological order.
- Each notification shows: icon (colour-coded by severity), title, body, relative timestamp ("2 min ago"), and an action button if a deep link is defined.
- Tapping an actionable notification navigates the user directly to the relevant POS entity via the `data.route` deep link payload (e.g., `/inventory/po/123`, `/tables/4`).
- Unread notifications are visually distinct (bold title, highlighted background).
- The panel auto-scrolls to the newest unread notification on open.
- WebSocket connection loss is indicated by a yellow "Reconnecting…" banner; missed notifications are fetched via REST poll on reconnect.

**Entities:** `InAppNotification`, `User`, `WebSocketSession`
**Tech Stack:** Flutter (POS terminal app) + WebSocket (Socket.IO or native WS)

---

### US-14.15 · State-Dependent Recall & Group Cancellation

**As a** Staff Member,
**I want to** see notifications disappear automatically when the underlying issue is resolved by someone else (e.g., table bussed, void approved),
**So that** I do not act on stale operational information.

**Acceptance Criteria:**
- Notifications are issued with a `correlation_id` tied to the real-world state (e.g., `dirty_tb_4` for Table 4 dirty state).
- When the resolving action occurs in POS (e.g., Table 4 marked clean), the backend issues a `WS_CANCEL` event with `correlation_id: dirty_tb_4`.
- All connected clients holding a notification with that `correlation_id` immediately remove it from the active notification panel — no page refresh required.
- The corresponding `in_app_notifications` rows are soft-deleted (`is_dismissed = TRUE`, `expires_at = NOW() + 7 days`).
- Clients that are offline at the time of `WS_CANCEL` apply the cancellation retroactively on next reconnect by re-fetching active notifications.
- `correlation_id` recall is scoped globally across all recipients of that notification type for that event instance.

**Entities:** `InAppNotification`, `WebSocketSession`, `AuditLog`
**Tech Stack:** Flutter + Node.js WebSocket server (Socket.IO rooms keyed by `correlation_id`)

---

### US-14.16 · Multi-Device State Sync

**As a** Manager logged into both a POS terminal and a mobile device,
**I want** my "Read" and "Dismissed" states to sync instantly across all my active sessions,
**So that** I only action each alert once and do not see stale alerts on a secondary device.

**Acceptance Criteria:**
- Reading a notification on Device A sends a `PATCH /v1/notifications/{id}/read` request.
- The server broadcasts a `WS_UPDATE` event containing `{ id, is_read: true }` to all WebSocket sessions belonging to the same `user_id`.
- Device B applies the state update within 500ms of Device A's action under normal network conditions.
- The same sync applies to `is_dismissed`.
- The unread badge count updates in real time on all devices simultaneously.
- If Device B is offline, it fetches updated states via REST on reconnect.

**Entities:** `InAppNotification`, `WebSocketSession`, `User`
**Tech Stack:** Flutter + Node.js WebSocket server; Redis Pub/Sub (cross-instance broadcast)

---

### US-14.17 · User-Level Opt-Out & Notification Preferences (Muting)

**As a** Staff Member,
**I want to** mute specific non-critical notification types assigned to my role,
**So that** I can reduce alert noise and focus on the notifications relevant to my current task.

**Acceptance Criteria:**
- A **Notification Preferences** panel is accessible from the user Settings menu.
- The panel lists all notification types that target the user's role, grouped by channel, each with a mute toggle.
- Toggling mute creates or updates a row in `user_notification_preferences`.
- Mute preferences are checked at dispatch time by the Recipient Resolver; muted users are excluded from the recipient list for that dispatch.
- Types with `is_mutable = FALSE` (e.g., `VOID_REQUEST`, `SYSTEM_WARNING`) display a locked icon and cannot be toggled — a tooltip explains: *"This alert is mandatory and cannot be muted."*
- Preference changes take effect immediately for all subsequent dispatches; they do not retroactively remove already-delivered notifications.

**Entities:** `UserNotificationPreference`, `NotificationType`, `User`
**Tech Stack:** Flutter (Settings screen); REST API

---

### US-14.18 · TTL-Based Notification Purging

**As a** System Administrator,
**I want** stale in-app notifications to be automatically purged on a rolling schedule,
**So that** the `in_app_notifications` table stays lean and notification center queries remain fast even under high operational volume.

**Acceptance Criteria:**
- **Read or dismissed** notifications: purged after **7 days** from `created_at`.
- **Unread and not dismissed** notifications: purged after **30 days** from `created_at`.
- Purging runs as a `@Scheduled` background job (Spring Boot) or BullMQ cron job — configurable interval, default: **nightly at 02:00** restaurant local time.
- Each purge run logs: rows deleted, execution time, and any errors to `SystemJobLog`.
- Purged rows are **hard-deleted** from `in_app_notifications`; their delivery record is preserved in `notification_logs`.
- An admin can manually trigger a purge run from the admin console under `System > Maintenance`.

**Entities:** `InAppNotification`, `SystemJobLog`
**Tech Stack:** Spring Boot `@Scheduled` / BullMQ cron; PostgreSQL `DELETE WHERE expires_at < NOW()`

---

## 10. Epic 5 — Sending, Reliability & Escalation

**Goal:** Provide a reliable, idempotent dispatch API with automatic retries, channel fallback, and scheduling.

---

### US-14.19 · Trigger a Notification via API

**As a** Backend Service (POS engine, inventory service, KDS),
**I want to** POST a notification event to the MCNS API with a type code, dynamic variables, and an optional `correlation_id`,
**So that** the system automatically fans out to all configured channels and recipient groups without the calling service knowing delivery details.

**Acceptance Criteria:**

```http
POST /v1/notifications/send
Authorization: Bearer <service_token>
Content-Type: application/json

{
  "type": "PO_APPROVAL",
  "variables": {
    "manager_name": "Sara",
    "po_id": "PO-4412",
    "supplier": "Metro Foods",
    "total_amount": "$1,240.00"
  },
  "correlation_id": "po-4412-approval",
  "idempotency_key": "po-4412-approval-20240315T100000Z"
}
```

- Response: `202 Accepted` with `dispatch_id`, queued channels summary, and total recipient count.
- The `idempotency_key` prevents duplicate dispatches (Redis TTL deduplication, 24-hour window).
- If the notification type is inactive the API returns `409 Conflict`.
- All active channels and recipient groups for the type are resolved and jobs enqueued within **500ms** of the request.
- Muted recipients are filtered out at resolution time; the response includes `muted_recipients_excluded` count.

**Entities:** `NotificationType`, `NotificationTypeChannel`, `RecipientGroup`, `NotificationLog`
**Tech Stack:** Node.js / Spring Boot API; Redis (idempotency); BullMQ (job queue)

---

### US-14.20 · Send a Notification Manually via Admin UI

**As an** Administrator or Operator,
**I want to** trigger a notification type manually from the admin console,
**So that** I can send ad-hoc announcements or test real dispatch without writing API calls.

**Acceptance Criteria:**
- Admin selects a notification type from a searchable dropdown.
- A dynamic form generates input fields for each `{{variable}}` defined in the type's templates.
- A **"Preview per Channel"** panel renders the Handlebars output for each active channel using the entered variables.
- A confirmation dialog shows: which channels will receive this, how many recipients per channel, and the rendered preview per channel.
- After confirmation, dispatch is queued and the UI shows a live status feed (sent count, failed count, retrying count) auto-refreshed every 5 seconds.
- Manual sends are marked with `source: MANUAL` in `notification_logs`.

**Entities:** `NotificationType`, `NotificationLog`
**Tech Stack:** React + shadcn/ui + Tailwind; REST API

---

### US-14.21 · Schedule a Notification

**As an** Administrator,
**I want to** schedule a notification to be sent at a specific future date and time,
**So that** I can pre-configure time-sensitive communications (e.g., shift-start reminders, end-of-day reports).

**Acceptance Criteria:**
- Scheduling available in both UI (date-time picker with timezone) and API (`"scheduled_at": "2024-12-31T23:00:00Z"`).
- Scheduled notifications appear in a **"Scheduled Queue"** list with status, target time, and a cancel button.
- Dispatch fires within ±1 minute of `scheduled_at`.
- Cancelling a scheduled notification before firing removes all queued jobs with no delivery.
- Scheduled sends are recorded in `notification_logs` with `source: SCHEDULED`.

**Entities:** `NotificationLog`, `ScheduledJob`
**Tech Stack:** BullMQ delayed jobs; React + shadcn/ui + Tailwind

---

### US-14.22 · Automatic Retry & Channel Fallback Escalation

**As an** Operator,
**I want** failed notification deliveries to retry automatically, and critical alerts to escalate to a fallback channel if the primary channel exhausts all retries,
**So that** stock breaches, void requests, and system warnings are never silently dropped.

**Acceptance Criteria:**
- Max retry attempts: configurable per channel (default: **3**).
- Backoff schedule: **1 min → 5 min → 30 min** (exponential).
- Retries are per-recipient and per-channel; a WhatsApp failure does not block Email delivery.
- After max retries, the log entry is marked `FAILED`.
- If the notification type has `severity = CRITICAL` and a `fallback_channel_id` is configured in `notification_type_channels`, the system automatically re-dispatches to the fallback channel with a modified subject/title prefix `[ESCALATED]`.
- Example: `STOCK_CRITICAL` primary channel = WhatsApp fails → fallback = Email with subject `[ESCALATED] Critical Stock Alert`.
- After all retries and fallback exhausted, an ops alert fires (email + Slack webhook) to the configured ops contact.

**Entities:** `NotificationTypeChannel`, `NotificationLog`, `Channel`
**Tech Stack:** BullMQ retry with `backoff: exponential`; Node.js escalation handler

---

## 11. Epic 6 — Monitoring & Logs

**Goal:** Give administrators and operators full visibility into notification delivery health and historical records.

---

### US-14.23 · Real-Time Delivery Dashboard

**As an** Administrator,
**I want to** see a real-time dashboard showing delivery statistics across all channels,
**So that** I can monitor the health of the notification system at a glance and spot problems before they impact operations.

**Acceptance Criteria:**
- KPI tiles: **Total Sent** (today / 7d / 30d), **Success Rate %**, **Failed Count**, **Avg Delivery Latency** (p95).
- A time-series chart showing dispatch volume per channel over the selected period.
- A **Channel Breakdown** pie/bar chart.
- A **"Recent Failures"** widget: last 10 failed dispatches with type code, channel, recipient, error message, and a "Retry Now" button.
- Dashboard auto-refreshes every 30 seconds; a manual refresh button is also provided.

**Entities:** `NotificationLog`
**Tech Stack:** React + shadcn/ui + Tailwind + Recharts; REST polling or SSE

---

### US-14.24 · Search & Filter Delivery Logs

**As an** Administrator,
**I want to** search delivery logs by notification type, channel, recipient, status, and date range,
**So that** I can investigate specific delivery failures (e.g., why a manager did not receive a `PO_APPROVAL` WhatsApp message).

**Acceptance Criteria:**
- Filters: type code, channel type, status (`SENT` / `FAILED` / `RETRYING` / `PENDING`), date range, recipient identifier (partial match).
- Results show: timestamp, type code, channel, recipient name/address, status badge, error message (if failed), attempt count.
- Each row is expandable to show the full rendered payload that was sent.
- Export filtered results to CSV.
- Logs are retained for **90 days** in hot storage and **2 years** in cold archive.

**Entities:** `NotificationLog`
**Tech Stack:** React + shadcn/ui + Tailwind; REST API with pagination

---

### US-14.25 · Ops Alerts for Critical Failures

**As a** System Administrator,
**I want** an automated alert when a `CRITICAL` severity notification exhausts all retry attempts and fallback channels,
**So that** I can take manual action immediately without monitoring dashboards continuously.

**Acceptance Criteria:**
- Alerts dispatched to a configurable ops contact (email address and/or Slack webhook URL) set in System Settings.
- Alert payload contains: notification type, channel, recipient address, error message, total attempts, timestamp.
- Alert throttle: maximum **1 alert per (type + channel)** per **5-minute window** to prevent alert storms.
- Ops alert history is viewable in the Admin Console under `System > Ops Alerts`.

**Entities:** `NotificationLog`, `SystemSetting`, `OpsAlertLog`
**Tech Stack:** Node.js alert handler; SendGrid / Slack Webhook

---

## 12. UI Screens & Wireframe Descriptions

### Screen 1 · Dashboard (`/`)

```
┌─────────────────────────────────────────────────────────────────┐
│  MCNS Admin Console            [Notifications ▼] [Settings] [⚙] │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ Sent Today │  │ Success %  │  │  Failed    │  │ Avg Lat  │  │
│  │   1,284    │  │   98.7%    │  │    17      │  │  320ms   │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
│  [Volume Chart — 30 days, per-channel lines]                    │
│  Recent Failures                        Channel Breakdown       │
│  ┌──────────────────────────────────┐   ┌──────────────────┐   │
│  │ ● STOCK_CRITICAL / WA  [Retry]   │   │  [Pie Chart]     │   │
│  │ ● PO_APPROVAL / Email  [Retry]   │   │  In-App   38%    │   │
│  └──────────────────────────────────┘   │  Email    29%    │   │
│                                          │  FCM      21%    │   │
│                                          │  WhatsApp 12%    │   │
│                                          └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Screen 2 · Notification Types List (`/types`)

```
┌──────────────────────────────────────────────────────────────────┐
│  Notification Types                         [+ Create Type]       │
├──────────────────────────────────────────────────────────────────┤
│  Search: [____________]  Severity: [All ▼]  Status: [All ▼]      │
├──────────────────────────────────────────────────────────────────┤
│  Code              Name              Sev       Channels  Status   │
│  ─────────────────────────────────────────────────────────────── │
│  ORDER_READY       Order Ready       INFO      1 (WS)    ● Active │
│  STOCK_CRITICAL    Critical Stock    CRITICAL  3         ● Active │
│  PO_APPROVAL       PO Approval       WARNING   3         ● Active │
│  VOID_REQUEST      Void Request      CRITICAL  1 (WS) 🔒 ● Active │
│  TABLE_DIRTY       Table Dirty       INFO      1 (WS)    ● Active │
└──────────────────────────────────────────────────────────────────┘
```

> 🔒 denotes `is_mutable = FALSE` — type cannot be muted by users.

---

### Screen 3 · Create / Edit Notification Type (`/types/new`)

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back   Create Notification Type                                │
├──────────────────────────────────────────────────────────────────┤
│  Code *           [STOCK_CRITICAL                             ]   │
│  Name *           [Critical Stock Level Breach                ]   │
│  Description      [Triggered when ingredient drops below...   ]   │
│  Severity         ○ INFO  ○ WARNING  ● CRITICAL                   │
│  Allow Muting     [Toggle OFF — locked because CRITICAL]          │
│  Active           [Toggle ON]                                     │
├──────────────────────────────────────────────────────────────────┤
│  Channel Templates                                                │
│  [In-App ✓]  [Email ✓]  [WhatsApp ✓]  [FCM Push ✗]              │
│  ─ IN-APP TEMPLATE ──────────────────────────────────────────    │
│  Title:    [🚨 {{ingredient}} critically low                  ]   │
│  Body:     [Current stock: {{qty}} {{unit}}. Par: {{par}}     ]   │
│  Deep Link: route [/inventory/items/{{item_id}}] id [{{item_id}}] │
│  [Preview ▼]                                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

### Screen 4 · Channel Configuration (`/channels`)

```
┌──────────────────────────────────────────────────────────────────┐
│  Channels                                      [+ Add Channel]    │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────────────────┐  │
│  │  🔔 In-App (WS)      │  │  📧 Email                        │  │
│  │  /pos-alerts         │  │  SendGrid · no-reply@shopro.com  │  │
│  │  ● Active            │  │  ● Active                        │  │
│  │  [Edit]              │  │  [Edit] [Disable]                │  │
│  └──────────────────────┘  └──────────────────────────────────┘  │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐  │
│  │  💬 WhatsApp         │  │  🍎 APNs                         │  │
│  │  Meta · +1800555012  │  │  com.shopro.pos                  │  │
│  │  ● Active            │  │  ⚠ Key expires in 14 days        │  │
│  │  [Edit] [Disable]    │  │  [Edit] [Disable] [Renew]        │  │
│  └──────────────────────┘  └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Screen 5 · Routing Matrix (`/routing`)

```
┌──────────────────────────────────────────────────────────────────┐
│  Notification Routing Matrix                     [Save Changes]   │
├──────────────────┬──────────────┬──────────────┬─────────────────┤
│ Type             │ In-App (WS)  │ Email        │ WhatsApp        │
├──────────────────┼──────────────┼──────────────┼─────────────────┤
│ ORDER_READY      │ [Servers ▼]  │ —            │ —               │
│ STOCK_CRITICAL   │ [Chefs ▼]    │ [Managers ▼] │ [Managers ▼]    │
│ PO_APPROVAL      │ [Managers ▼] │ [Managers ▼] │ [Owner ▼]       │
│ VOID_REQUEST     │ [Managers ▼] │ —            │ —               │
│ TABLE_DIRTY      │ [Bussers ▼]  │ —            │ —               │
└──────────────────┴──────────────┴──────────────┴─────────────────┘
  "—" = channel not configured for this type. Click cell to assign.
```

---

### Screen 6 · In-App Notification Panel (POS Terminal — Flutter)

```
┌──────────────────────────────────┐
│  🔔 Notifications          (8)   │
│  ──────────────────────────────  │
│  🔴 VOID REQUEST           2m    │
│  Table 12 · Item #4 $18.00       │
│  [Approve] [Deny]                │
│  ──────────────────────────────  │
│  🟡 STOCK CRITICAL        15m    │
│  Chicken Breast: 0.5 kg left     │
│  [View Inventory →]              │
│  ──────────────────────────────  │
│  ⚪ ORDER READY            22m   │
│  Table 7 · Ticket #441           │
│  [Mark Delivered]                │
│  ──────────────────────────────  │
│  [Load older notifications…]     │
└──────────────────────────────────┘
```

---

### Screen 7 · User Notification Preferences (Flutter Settings)

```
┌──────────────────────────────────┐
│  ← Settings                      │
│  Notification Preferences        │
│  ──────────────────────────────  │
│  IN-APP                          │
│  Order Ready          [ON  ●]    │
│  Table Dirty          [ON  ●]    │
│  Void Request      🔒 [Locked]   │
│                                  │
│  EMAIL                           │
│  Stock Critical    🔒 [Locked]   │
│  PO Approval          [ON  ●]    │
│                                  │
│  WHATSAPP                        │
│  PO Approval          [OFF ○]    │
└──────────────────────────────────┘
```

---

### Screen 8 · Manual Send (`/send`)

```
┌──────────────────────────────────────────────────────────────────┐
│  Send Notification Manually                                       │
├──────────────────────────────────────────────────────────────────┤
│  Notification Type *  [STOCK_CRITICAL ▼]                          │
│  ingredient           [Chicken Breast                         ]   │
│  qty                  [0.5                                    ]   │
│  unit                 [kg                                     ]   │
│  par                  [5 kg                                   ]   │
│  item_id              [ITEM-9021                              ]   │
│                                                                   │
│  ── Preview ───────────────────────────────────────────────────  │
│  [🔔 In-App]  [📧 Email]  [💬 WhatsApp]                          │
│  Title: 🚨 Chicken Breast critically low                         │
│  Body:  Current stock: 0.5 kg. Par: 5 kg.                        │
│                                                                   │
│  Recipients:  🔔 4 (Chefs)  📧 3 (Managers)  💬 2 (Managers)    │
│  Schedule:    ● Send Now  ○ Schedule for: [Date/Time Picker]      │
│                                                                   │
│  [Cancel]                                       [Send Now →]      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 13. API Design

### Base URL

```
https://api.shopro.com/notifications/v1
```

### Authentication

All endpoints require `Authorization: Bearer <token>`.
Service-to-service calls use **service tokens** with role `NOTIFIER`.
Admin console calls use **user JWTs** with role `ADMIN` or `OPERATOR`.

---

### Endpoint Reference

| Method | Path | Role Required | Description |
|---|---|---|---|
| `GET` | `/types` | VIEWER | List all notification types |
| `POST` | `/types` | ADMIN | Create a notification type |
| `GET` | `/types/:id` | VIEWER | Get a single notification type |
| `PUT` | `/types/:id` | ADMIN | Update a notification type |
| `PATCH` | `/types/:id/deactivate` | ADMIN | Deactivate a type |
| `GET` | `/channels` | VIEWER | List all channels |
| `POST` | `/channels` | ADMIN | Add a channel |
| `PUT` | `/channels/:id` | ADMIN | Update channel config |
| `POST` | `/channels/:id/test` | ADMIN | Send a test notification |
| `PATCH` | `/channels/:id/deactivate` | ADMIN | Deactivate a channel |
| `GET` | `/recipients` | ADMIN | List recipients (filterable) |
| `POST` | `/recipients` | ADMIN | Add a recipient |
| `POST` | `/recipients/import` | ADMIN | Bulk CSV import |
| `GET` | `/groups` | ADMIN | List recipient groups |
| `POST` | `/groups` | ADMIN | Create a group |
| `GET` | `/routing` | ADMIN | Get full routing matrix |
| `PUT` | `/routing` | ADMIN | Update routing matrix |
| `GET` | `/preferences/:userId` | OPERATOR | Get user notification preferences |
| `PUT` | `/preferences/:userId` | OPERATOR | Update user notification preferences |
| `POST` | `/send` | NOTIFIER | Trigger a fan-out dispatch |
| `POST` | `/schedule` | NOTIFIER | Schedule a future dispatch |
| `PATCH` | `/:id/read` | USER | Mark in-app notification as read |
| `PATCH` | `/:id/dismiss` | USER | Dismiss an in-app notification |
| `DELETE` | `/correlations/:correlationId` | NOTIFIER | Trigger WS_CANCEL for a correlation ID |
| `GET` | `/logs` | OPERATOR | Query delivery logs |
| `GET` | `/logs/:id` | OPERATOR | Get a single log entry |

---

### `POST /send` — Trigger Dispatch

**Request:**
```json
{
  "type": "PO_APPROVAL",
  "variables": {
    "manager_name": "Sara",
    "po_id": "PO-4412",
    "supplier": "Metro Foods",
    "total_amount": "$1,240.00"
  },
  "correlation_id": "po-4412-approval",
  "idempotency_key": "po-4412-approval-20240315T100000Z"
}
```

**Response `202 Accepted`:**
```json
{
  "dispatch_id": "d9c4a3f1-...",
  "queued_channels": ["IN_APP", "EMAIL", "WHATSAPP"],
  "total_recipients": 8,
  "muted_recipients_excluded": 2,
  "scheduled_at": null
}
```

**Error codes:**

| Code | Reason |
|---|---|
| 400 | Missing required field or malformed variable |
| 404 | Notification type not found |
| 409 | Type is inactive / Duplicate idempotency key |
| 422 | Template variable mismatch |
| 503 | Job queue unavailable |

---

### `DELETE /correlations/:correlationId` — State Recall

```http
DELETE /v1/notifications/correlations/dirty_tb_4
Authorization: Bearer <service_token>
```

**Response `200 OK`:**
```json
{
  "correlation_id": "dirty_tb_4",
  "cancelled_count": 6,
  "ws_cancel_broadcast": true
}
```

Soft-deletes all `in_app_notifications` rows with the given `correlation_id` and broadcasts `WS_CANCEL` to all affected user WebSocket sessions.

---

## 14. Channel Integration Specifications

### 14.1 In-App — WebSocket (Socket.IO)

```
Transport:  WebSocket (Socket.IO with fallback to long-polling)
Namespace:  /pos-alerts
Auth:       JWT in socket handshake query: ?token=<user_jwt>
Room key:   user_id  (each authenticated user joins their own room)
Broadcast:  Redis Pub/Sub adapter for multi-instance clusters
```

**Event payloads:**

```jsonc
// WS_NEW — server → client
{ "event": "WS_NEW", "payload": {
  "id": "uuid", "type_code": "TABLE_DIRTY",
  "correlation_id": "dirty_tb_4",
  "title": "Table 4 needs bussing",
  "body": "Guest departed. Table 4 is ready to clean.",
  "data": { "route": "/tables/4", "table_id": 4 },
  "severity": "INFO", "created_at": "2024-03-15T10:22:00Z"
}}

// WS_CANCEL — server → client
{ "event": "WS_CANCEL", "payload": { "correlation_id": "dirty_tb_4" }}

// WS_UPDATE — server → client
{ "event": "WS_UPDATE", "payload": { "id": "uuid", "is_read": true, "is_dismissed": false }}

// WS_ACK — client → server
{ "event": "WS_ACK", "payload": { "id": "uuid" }}
```

---

### 14.2 Email — SendGrid

```
Provider:   SendGrid Web API v3
Endpoint:   POST https://api.sendgrid.com/v3/mail/send
Auth:       Authorization: Bearer <API_KEY>
Rate limit: 600 req/min (free); up to 1,000,000/day (paid)
Retry:      Retry on 429 and 5xx; respect Retry-After header
```

```json
{
  "personalizations": [{ "to": [{ "email": "{{address}}" }] }],
  "from": { "email": "no-reply@shopro.com", "name": "Shopro POS" },
  "subject": "{{rendered_subject}}",
  "content": [{ "type": "text/html", "value": "{{rendered_body}}" }]
}
```

---

### 14.3 WhatsApp — Meta Cloud API

```
Provider:   Meta WhatsApp Business Cloud API v18.0
Endpoint:   POST https://graph.facebook.com/v18.0/{{phone_number_id}}/messages
Auth:       Authorization: Bearer <ACCESS_TOKEN>
Rate limit: 1,000 messages/second (business tier)
Constraint: Must use pre-approved templates outside 24h customer-initiated session window
```

```json
{
  "messaging_product": "whatsapp",
  "to": "{{e164_phone}}",
  "type": "template",
  "template": {
    "name": "po_approval_v3",
    "language": { "code": "en_US" },
    "components": [{
      "type": "body",
      "parameters": [
        { "type": "text", "text": "{{manager_name}}" },
        { "type": "text", "text": "{{po_id}}" },
        { "type": "text", "text": "{{supplier}}" },
        { "type": "text", "text": "{{total_amount}}" }
      ]
    }]
  }
}
```

---

### 14.4 FCM — Firebase Cloud Messaging (V1 API)

```
Provider:   Google Firebase Cloud Messaging
Endpoint:   POST https://fcm.googleapis.com/v1/projects/{{project_id}}/messages:send
Auth:       OAuth2 Bearer from service account (scope: firebase.messaging)
Rate limit: 500 req/s per project; 240 messages/device/day
```

```json
{
  "message": {
    "token": "{{device_registration_token}}",
    "notification": {
      "title": "{{rendered_title}}",
      "body": "{{rendered_body}}"
    },
    "data": {
      "dispatch_id": "{{dispatch_id}}",
      "type": "{{notification_type_code}}",
      "route": "{{deep_link_route}}"
    },
    "android": { "priority": "high" },
    "webpush": { "fcm_options": { "link": "{{click_action_url}}" } }
  }
}
```

---

### 14.5 APNs — Apple Push Notification Service

```
Provider:   Apple APNs HTTP/2 API
Endpoint:   POST https://api.push.apple.com/3/device/{{device_token}}
Auth:       JWT signed with .p8 key (ES256), refreshed every 50 min
Headers:    apns-topic: com.shopro.pos
            apns-push-type: alert
            apns-priority: 10 (CRITICAL) / 5 (others)
Rate limit: No hard limit; 1 connection per 1,000 tokens recommended
```

```json
{
  "aps": {
    "alert": {
      "title": "{{rendered_title}}",
      "body": "{{rendered_body}}"
    },
    "sound": "default",
    "badge": 1,
    "interruption-level": "time-sensitive"
  },
  "dispatch_id": "{{dispatch_id}}",
  "type": "{{notification_type_code}}",
  "route": "{{deep_link_route}}"
}
```

> `interruption-level: time-sensitive` is used for `WARNING` and `CRITICAL` types to break through iOS Focus modes.

---

## 15. Notification Dispatch Engine

### 15.1 Full Dispatch Flow

```
1.  API receives POST /send
2.  Validate: type exists and is_active; all required variables present
3.  Deduplicate: check Redis for idempotency_key (TTL 24h); reject if exists; store key
4.  Resolve: query notification_type_channels for all active (type + channel) links
5.  For each linked channel:
    a. Resolve recipient group members
       (dynamic role-bound groups query POS role roster at this step)
    b. Filter out muted users (check user_notification_preferences)
    c. Render Handlebars template with provided variables
    d. Enqueue one job per recipient → appropriate channel queue
6.  Return 202 with dispatch_id, channel summary, and recipient counts
7.  Channel workers process queued jobs:
    - IN_APP:    Insert into in_app_notifications;
                 broadcast WS_NEW to user's Socket.IO room
    - EMAIL:     POST to configured email provider API
    - WHATSAPP:  POST to Meta Cloud API with approved template
    - FCM:       POST to FCM V1 API
    - APNS:      POST to APNs HTTP/2 API
8.  On success: write SENT log to notification_logs
9.  On failure: retry with exponential backoff (1m → 5m → 30m)
10. After max retries:
    a. Mark log entry as FAILED
    b. If fallback_channel_id configured → re-dispatch to fallback with [ESCALATED] prefix
    c. If severity = CRITICAL → fire ops alert (email + Slack webhook)
```

---

### 15.2 Queue Design (BullMQ / Redis)

```
Queues:
  notif:in_app    — 50 concurrent workers (in-memory + WS broadcast)
  notif:email     — 10 concurrent workers
  notif:whatsapp  —  5 concurrent workers (rate-limited by Meta)
  notif:fcm       — 20 concurrent workers
  notif:apns      — 20 concurrent workers

Job structure:
{
  "dispatch_id": "uuid",
  "notification_type_id": "uuid",
  "channel_id": "uuid",
  "recipient_id": "uuid",
  "correlation_id": "dirty_tb_4",        // optional
  "rendered_title": "...",
  "rendered_body": "...",
  "rendered_data": { "route": "..." },   // in-app deep link only
  "attempt": 1
}

Retry policy:
  attempts: 3
  backoff: { type: "exponential", delay: 60000 }  // 1m → 2m → 4m
```

---

### 15.3 Template Rendering

Templates use sandboxed **Handlebars** (no custom code helpers allowed).

```javascript
const Handlebars = require('handlebars');
// Sandbox: only allow safe helpers (eq, if, unless, each)
const template = Handlebars.compile(templateString);
const output = template(variables);
```

- **Email HTML body**: XSS sanitization applied to all variable values via `DOMPurify` before render.
- **In-App deep link** `route` values: URL path segment validation enforced to prevent open redirects.
- **WhatsApp**: Variables are mapped to positional parameters; the resolved template name is read from `meta.wa_template_name`.

---

### 15.4 State Recall Engine

```
1.  Trigger: DELETE /v1/notifications/correlations/:correlationId
            (called by POS business logic when state resolves)
2.  DB:      UPDATE in_app_notifications
             SET is_dismissed = TRUE,
                 expires_at = NOW() + INTERVAL '7 days'
             WHERE correlation_id = :correlationId
             AND is_dismissed = FALSE
3.  Redis:   PUBLISH ws_cancel_channel { correlationId }
4.  WS:      All Socket.IO server instances subscribe to ws_cancel_channel
             On message: emit WS_CANCEL to all user rooms holding this notification
5.  Client:  Flutter removes all matching items from local notification store
             (matched by correlation_id without server round-trip)
6.  Offline: On reconnect, client fetches active notifications via REST;
             cancelled items are absent from the response
```

---

## 16. Security & Access Control

### 16.1 Roles

| Role | Permissions |
|---|---|
| `ADMIN` | Full CRUD on types, channels, templates, recipients, groups, routing; manual send; view all logs; manage system settings |
| `OPERATOR` | Manual send; view logs; read-only types and channels |
| `VIEWER` | Read-only access to types, channels, and logs |
| `NOTIFIER` | Service account; `POST /send` and `DELETE /correlations/:id` only |
| `USER` | Own read/dismiss (`PATCH /:id/read`, `PATCH /:id/dismiss`); own preferences only |

---

### 16.2 Credential Security

- All channel credentials stored encrypted at rest using **AES-256-GCM**.
- Encryption key managed via **AWS KMS** or **HashiCorp Vault**; never stored alongside data.
- Secrets are never returned in plain text by any API response after initial save.
- Sensitive fields in UI shown as `••••••••`; admin must re-enter to update.
- Audit log records every credential update: actor, timestamp, field changed — value is never logged.

---

### 16.3 Rate Limiting

| Endpoint group | Limit |
|---|---|
| `POST /send` (service tokens) | 100 req/min per token |
| Admin UI API | 300 req/min per user |
| Bulk import | 5 req/min per user |
| WebSocket connections | 5 concurrent sessions per user |

---

## 17. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **API → Queue enqueue latency** | < 500ms (p99) |
| **In-App WS delivery** | < 1 second end-to-end (p95) |
| **Email delivery** | < 30 seconds end-to-end (p95) |
| **Push delivery (FCM/APNs)** | < 5 seconds end-to-end (p95) |
| **WhatsApp delivery** | < 10 seconds end-to-end (p95) |
| **WS_CANCEL propagation** | < 500ms to all connected clients (p95) |
| **Multi-device sync latency** | < 500ms (p95) |
| **Throughput** | 10,000 notifications / minute at peak |
| **API availability** | 99.9% uptime |
| **Read/dismissed TTL** | Purged within 7 days |
| **Unread TTL** | Purged within 30 days |
| **Log retention (hot)** | 90 days |
| **Log retention (cold archive)** | 2 years |
| **Idempotency window** | 24 hours |
| **Data encryption (at rest)** | AES-256-GCM |
| **Data encryption (in transit)** | TLS 1.3 |
| **Audit log retention** | 7 years |
| **GDPR compliance** | Recipient PII deletable on request; data residency configurable per deployment |

---

## 18. Glossary

| Term | Meaning |
|---|---|
| APNs | Apple Push Notification service |
| BullMQ | Redis-backed job queue for Node.js |
| Correlation ID | Unique token linking a notification to a real-world mutable state; used for recall |
| Deep Link | A `data.route` payload enabling one-tap navigation to a POS entity |
| E.164 | International phone number format standard (e.g. `+12125550100`) |
| FCM | Firebase Cloud Messaging (Google) |
| Handlebars | Logic-less JavaScript templating engine (`{{variable}}` syntax) |
| Idempotency Key | A client-supplied unique key preventing duplicate dispatch events |
| `is_mutable` | Flag on `NotificationType`; when `FALSE` disables user-level muting |
| MCNS | Multi-Channel Notification System (this system) |
| POS | Point of Sale — the Shopro restaurant management platform |
| Redis Pub/Sub | Message broker used for cross-instance WebSocket broadcast |
| SMTP | Simple Mail Transfer Protocol |
| Socket.IO | WebSocket library with fallback transport and room-based broadcasting |
| TTL | Time to Live — determines when a record is eligible for automatic purging |
| WS_ACK | WebSocket event: client confirms receipt of a new notification |
| WS_CANCEL | WebSocket event: server instructs client to remove a correlation-ID-matched notification |
| WS_NEW | WebSocket event: server pushes a new notification to client |
| WS_UPDATE | WebSocket event: server syncs read/dismissed state across devices |
| p95 | 95th percentile latency |