# Multi-Channel Notification System — Design Document

> **Version:** 1.0  
> **Status:** Draft  
> **Scope:** Full-stack notification platform supporting Email, WhatsApp, and Push Notifications (FCM / APNs) with a UI-driven admin console for managing notification types, channels, and recipients.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Core Concepts & Terminology](#3-core-concepts--terminology)
4. [Database Schema](#4-database-schema)
5. [User Stories — Notification Type Management](#5-user-stories--notification-type-management)
6. [User Stories — Channel Configuration](#6-user-stories--channel-configuration)
7. [User Stories — Recipient Management](#7-user-stories--recipient-management)
8. [User Stories — Sending Notifications](#8-user-stories--sending-notifications)
9. [User Stories — Monitoring & Logs](#9-user-stories--monitoring--logs)
10. [UI Screens & Wireframe Descriptions](#10-ui-screens--wireframe-descriptions)
11. [API Design](#11-api-design)

---

## 1. Executive Summary

The Multi-Channel Notification System (MCNS) is a centralized platform that allows administrators to define **notification types**, configure **delivery channels** (Email, WhatsApp, FCM Push, APNs Push), assign **recipients per channel**, and trigger notifications programmatically or manually. When a notification event is raised, the system automatically dispatches the message across every configured channel to all registered recipients, handling retries, delivery tracking, and audit logging.

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
  ┌───────┼───────────────────────────────────┐
  │       │                                   │
  ▼       ▼                   ▼               ▼
Email   WhatsApp           FCM Push        APNs Push
(SMTP/  (WhatsApp          (Google         (Apple
SendGrid) Business API)    Firebase)       Push)
  │       │                   │               │
  └───────┴───────────────────┴───────────────┘
                      │
         ┌────────────▼────────────┐
         │  Delivery Log (DB)      │
         │  status, timestamp,     │
         │  error, retry count     │
         └─────────────────────────┘
```

---

## 3. Core Concepts & Terminology

| Term | Definition |
|---|---|
| **Notification Type** | A named, reusable event definition (e.g., `ORDER_PLACED`, `PASSWORD_RESET`) with a title, default message template, and severity level. |
| **Channel** | A delivery mechanism: Email, WhatsApp, FCM (Android/Web push), or APNs (iOS push). |
| **Channel Configuration** | The credentials and settings required to operate a channel (e.g., SMTP host, WhatsApp API key, FCM server key). |
| **Recipient** | A person or system endpoint registered to receive notifications on a specific channel. |
| **Recipient Group** | A named collection of recipients for bulk targeting. |
| **Notification Event** | A runtime trigger that names a notification type and supplies dynamic content variables. |
| **Template** | A message template associated with a notification type on a given channel, supporting variable substitution. |
| **Delivery Log** | An immutable record of every dispatch attempt, its outcome, and timing. |

---

## 4. Database Schema

### 4.1 `notification_types`

```sql
CREATE TABLE notification_types (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code           VARCHAR(100) UNIQUE NOT NULL,   -- e.g. ORDER_PLACED
    name           VARCHAR(255) NOT NULL,
    description    TEXT,
    severity       ENUM('INFO','WARNING','CRITICAL') DEFAULT 'INFO',
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 `channels`

```sql
CREATE TABLE channels (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type           ENUM('EMAIL','WHATSAPP','FCM','APNS') NOT NULL,
    name           VARCHAR(255) NOT NULL,           -- friendly name
    config         JSONB NOT NULL,                  -- encrypted credentials
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

**`config` JSONB examples by type:**

```jsonc
// EMAIL
{ "provider": "sendgrid", "api_key": "SG.xxx", "from_address": "no-reply@acme.com", "from_name": "Acme" }

// WHATSAPP
{ "provider": "meta", "phone_number_id": "1234567890", "access_token": "EAAxx...", "template_namespace": "acme_ns" }

// FCM
{ "project_id": "acme-app", "service_account_json": { ... } }

// APNS
{ "key_id": "XXXXXXXXXX", "team_id": "YYYYYYYYYY", "bundle_id": "com.acme.app", "private_key_pem": "-----BEGIN..." }
```

### 4.3 `notification_templates`

```sql
CREATE TABLE notification_templates (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type_id  UUID REFERENCES notification_types(id) ON DELETE CASCADE,
    channel_id            UUID REFERENCES channels(id) ON DELETE CASCADE,
    subject               VARCHAR(500),            -- email subject / push title
    body_template         TEXT NOT NULL,            -- Handlebars template string
    meta                  JSONB,                   -- channel-specific extras
    is_active             BOOLEAN DEFAULT TRUE,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (notification_type_id, channel_id)
);
```

### 4.4 `recipients`

```sql
CREATE TABLE recipients (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id     UUID REFERENCES channels(id) ON DELETE CASCADE,
    name           VARCHAR(255),
    address        VARCHAR(500) NOT NULL,  -- email / phone / device token
    meta           JSONB,                 -- e.g. locale, timezone, device OS
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.5 `recipient_groups`

```sql
CREATE TABLE recipient_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipient_group_members (
    group_id      UUID REFERENCES recipient_groups(id) ON DELETE CASCADE,
    recipient_id  UUID REFERENCES recipients(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, recipient_id)
);
```

### 4.6 `notification_type_channels`

*Links which channels are active for a given notification type, and which recipient groups to target.*

```sql
CREATE TABLE notification_type_channels (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type_id  UUID REFERENCES notification_types(id) ON DELETE CASCADE,
    channel_id            UUID REFERENCES channels(id) ON DELETE CASCADE,
    recipient_group_id    UUID REFERENCES recipient_groups(id),
    is_active             BOOLEAN DEFAULT TRUE,
    UNIQUE (notification_type_id, channel_id)
);
```

### 4.7 `notification_logs`

```sql
CREATE TABLE notification_logs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type_id  UUID REFERENCES notification_types(id),
    channel_id            UUID REFERENCES channels(id),
    recipient_id          UUID REFERENCES recipients(id),
    status                ENUM('PENDING','SENT','FAILED','RETRYING') DEFAULT 'PENDING',
    payload               JSONB,          -- rendered content sent
    error_message         TEXT,
    attempt_count         INT DEFAULT 0,
    sent_at               TIMESTAMPTZ,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. User Stories — Notification Type Management

### US-101 · Create a Notification Type
**As an** administrator,  
**I want to** define a new notification type with a unique code, human-readable name, description, and severity,  
**So that** the system has a reusable event definition that all channels can subscribe to.

### US-102 · Edit a Notification Type
**As an** administrator,  
**I want to** edit the name, description, and severity of an existing notification type,  
**So that** I can keep definitions accurate as the system evolves.

### US-103 · Deactivate / Reactivate a Notification Type
**As an** administrator,  
**I want to** deactivate a notification type without deleting it,  
**So that** I can pause notifications for a specific event without losing configuration.

### US-104 · View All Notification Types
**As an** administrator,  
**I want to** view a filterable, searchable list of all notification types with their status and linked channels,  
**So that** I can get a full picture of the notification landscape at a glance.

### US-105 · Define Templates per Channel per Type
**As an** administrator,  
**I want to** define a separate message template for each channel linked to a notification type,  
**So that** each channel delivers a message formatted appropriately for its medium.

---

## 6. User Stories — Channel Configuration

### US-201 · Add an Email Channel
**As an** administrator,  
**I want to** configure an email delivery channel by providing SMTP credentials or a SendGrid/Mailgun/SES API key,  
**So that** the system can send email notifications through my chosen provider.

### US-202 · Add a WhatsApp Channel
**As an** administrator,  
**I want to** configure a WhatsApp Business API channel,  
**So that** the system can deliver notifications as WhatsApp messages.

### US-203 · Add an FCM Push Channel (Android & Web)
**As an** administrator,  
**I want to** configure a Firebase Cloud Messaging channel,  
**So that** the system can deliver push notifications to Android and web browser clients.

### US-204 · Add an APNs Push Channel (iOS)
**As an** administrator,  
**I want to** configure an Apple Push Notification service channel,  
**So that** the system can deliver push notifications to iOS devices.

### US-205 · Edit Channel Configuration
**As an** administrator,  
**I want to** update the credentials or settings of an existing channel,  
**So that** I can rotate API keys or update provider configuration without recreating the channel and losing linked recipients.

### US-206 · Deactivate a Channel
**As an** administrator,  
**I want to** deactivate a channel without deleting it,  
**So that** I can temporarily halt delivery on a channel without losing configuration.

---

## 7. User Stories — Recipient Management

### US-301 · Add a Recipient to a Channel
**As an** administrator,  
**I want to** register a recipient on a specific channel with their contact address,  
**So that** the system knows where to send notifications on that channel.

### US-302 · Bulk Import Recipients
**As an** administrator,  
**I want to** import a list of recipients via CSV upload for a given channel,  
**So that** I can onboard large recipient lists efficiently.

### US-303 · Create a Recipient Group
**As an** administrator,  
**I want to** create named recipient groups and assign recipients to them,  
**So that** I can target a subset of recipients for specific notification types.

### US-304 · Assign a Recipient Group to a Notification Type + Channel
**As an** administrator,  
**I want to** link a specific recipient group to a (notification type + channel) combination,  
**So that** when that notification type fires, only the correct recipients on that channel receive it.

### US-305 · Deactivate a Recipient
**As an** administrator,  
**I want to** deactivate a recipient so they stop receiving notifications,  
**So that** I can honor opt-out requests without losing their record.

---

## 8. User Stories — Sending Notifications

### US-401 · Trigger a Notification via API
**As a** backend service or developer,  
**I want to** POST a notification event to the Notification API with a type code and content variables,  
**So that** the system automatically delivers messages to all recipients across all configured channels for that type.

### US-402 · Send a Notification Manually via UI
**As an** administrator,  
**I want to** trigger a notification type manually from the admin console,  
**So that** I can send announcements or test real dispatch without calling the API.

### US-403 · Schedule a Notification
**As an** administrator,  
**I want to** schedule a notification to be sent at a specific future date and time,  
**So that** I can pre-configure time-sensitive communications.

### US-404 · Automatic Retry on Failure
**As a** system operator,  
**I want** failed notification deliveries to be automatically retried with exponential backoff,  
**So that** transient provider errors do not result in missed notifications.

---

## 9. User Stories — Monitoring & Logs

### US-501 · View Notification Delivery Dashboard
**As an** administrator,  
**I want to** see a real-time dashboard showing delivery statistics across all channels,  
**So that** I can monitor the health of the notification system at a glance.

### US-502 · Search and Filter Delivery Logs
**As an** administrator,  
**I want to** search delivery logs by notification type, channel, recipient, status, and date range,  
**So that** I can investigate specific delivery issues.

### US-503 · Receive Alerts for Critical Failures
**As a** system operator,  
**I want** the system to alert me when a `CRITICAL` severity notification fails all retry attempts,  
**So that** I can take manual action immediately.

---

## 10. UI Screens & Wireframe Descriptions

(Available in the original template, truncated here to keep the file concise, as the key user stories and DB schemas are captured above).

---

## 11. API Design

### Base URL
`https://api.acme.com/notifications/v1`

### Authentication
All endpoints require a Bearer token in the `Authorization` header.  
Service-to-service calls use dedicated service tokens with role `NOTIFIER`.  
Admin UI calls use user JWTs with role `ADMIN`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/types` | List all notification types |
| `POST` | `/types` | Create a notification type |
| `GET` | `/channels` | List all channels |
| `POST` | `/send` | Trigger a notification |
