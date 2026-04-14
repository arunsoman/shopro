# API Audit Logging Feature

## Overview
Add comprehensive server-side audit logging for every API call made by users.

## User Story

**As a** System Administrator,  
**I want** all API calls to be logged with clear user intent,  
**So that** I can trace user actions without exposing private data and maintain compliance.

## Requirements

1. Every API request must create an entry in the server log file
2. Log entries must NOT contain private/sensitive data (passwords, tokens, PII)
3. Log entries must clearly show user intent in format: `userid -> action description`
4. Example format: `userid -> added a new ingredient[ingredient_name or id] to the inventory`

## Tech Stack
- Backend: Spring Boot 3.x with Java
- Database: PostgreSQL
- Logging: SLF4J with Logback

---

## Acceptance Criteria

1. Every REST API call (POST, PUT, DELETE, PATCH) creates an audit log entry
2. Log entry includes: username/userId, timestamp, HTTP method, endpoint, action description
3. Sensitive fields are NEVER logged: passwords, tokens, API keys, credit cards, SSN, full request/response bodies containing PII
4. Log format example: `userid -> added a new ingredient[ingredient_name or id] to the inventory`
5. If logging fails, the request continues (non-blocking) but logs a warning

---

## Data Schema ← resolved in iteration 1

### AuditLog Entity
| Field | Type | Description |
|---|---|---|
| id | BIGINT | Primary key, auto-generated |
| username | VARCHAR(100) | User ID or 'system' for automated actions |
| action | VARCHAR(50) | CREATE, READ, UPDATE, DELETE |
| entity_name | VARCHAR(100) | Entity type (e.g., Ingredient, MenuItem) |
| entity_id | VARCHAR(50) | ID of affected entity |
| details | VARCHAR(500) | Human-readable action description |
| timestamp | TIMESTAMP | UTC timestamp |
| ip_address | VARCHAR(45) | Client IP (optional) |

---

## Sensitive Data Exclusion Rules ← resolved in iteration 1

The following MUST NOT be logged:
- Passwords and password confirmations
- Authentication tokens (JWT, session IDs)
- API keys and secrets
- Credit card numbers / payment details
- Social Security Numbers (SSN)
- Full request/response bodies containing PII
- Bank account details
- Biometric data
- Personal email addresses (log user ID instead)

**Safe to log**: userId, entity IDs, action descriptions, timestamps, HTTP status codes

---

## Log Format Specification ← resolved in iteration 1

**Pattern**: `{userId} -> {action_description}[{entity_type}:{entity_id}]`

**Examples**:
- `user_123 -> added a new ingredient[Ingredient:456] to the inventory`
- `manager_01 -> updated menu item price[MenuItem:789]`
- `system -> automatically archived expired item[MenuItem:101]`
- `user_123 -> deleted supplier[Supplier:202]`

---

## Log Retention Policy ← resolved in iteration 1

- **Online/Active**: 90 days in database
- **Archived**: 2 years in cold storage
- **Deletion**: After 2 years, soft-delete or export then delete
- **Rotation**: Daily rollover, compress logs older than 7 days

---

## Error Handling ← resolved in iteration 1

1. **Non-blocking**: Use @Async to log without slowing API response
2. **Fallback**: If database logging fails, log to stdout as last resort
3. **Circuit breaker**: If logging fails 10 times consecutively, alert admin
4. **Retry**: Failed log entries retried up to 3 times with exponential backoff

---

## Implementation Approach

Use Spring AOP (Aspect-Oriented Programming) to intercept all REST controller methods:

1. Create `@Aspect` component with `@Pointcut` for controller package
2. Use `@AfterReturning` to capture successful API calls
3. Extract user from `SecurityContextHolder`
4. Build action description from HTTP method + endpoint + entity
5. Save to `AuditLog` entity asynchronously

---

## Roles Definition ← resolved in iteration 2

| Role | Description | Entry Point | Accessible Surfaces |
|---|---|---|---|
| Owner/Admin | Full system access for restaurant ownership | /admin (Admin Dashboard) | All surfaces: POS, KDS, Reports, Settings, Audit Logs, User Management |
| Manager | Day-to-day operations oversight | /manager-dashboard | POS Grid, Tableside, KDS, Reports (financial), Inventory, Staff Management |
| Server | Order taking and customer service | POS terminal (/pos) | POS Grid, Tableside, Order History |
| Kitchen/Expo | Kitchen display and order preparation | /kds (Kitchen Display System) | KDS screen, Order Queue |
| Cashier | Payment processing and checkout | /register | Payment processing, Receipts, Daily Settlement |
| System | Automated background jobs | N/A (automated) | Internal: scheduled tasks, webhooks, integrations |

**Note:** Owner/Admin role is the only role permitted to:
- View and export audit logs
- Delete audit log entries
- Modify user roles and permissions

## Permission Matrix for Audit Logs ← resolved in iteration 2

| Role | CREATE | READ (own) | READ (all) | UPDATE | DELETE | EXPORT |
|---|---|---|---|---|---|---|
| Owner/Admin | N/A (auto) | ✅ | ✅ | N/A | ✅ (own records only) | ✅ |
| Manager | N/A | ✅ | ✅ | N/A | ❌ | ✅ |
| Server | N/A | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kitchen/Expo | N/A | ❌ | ❌ | ❌ | ❌ | ❌ |
| Cashier | N/A | ❌ | ❌ | ❌ | ❌ | ❌ |
| System | ✅ (auto) | ❌ | ❌ | ❌ | ❌ | ❌ |

**Note:** Audit log entries are auto-created by the SYSTEM actor; human actors cannot manually create them.

## Audit Log Query Capabilities ← resolved in iteration 2

**Supported Filters:**
- `startDate` / `endDate`: Filter by timestamp range (ISO 8601 format)
- `username` or `principal`: Filter by user who performed the action
- `entityName`: Filter by entity type (e.g., Ingredient, MenuItem, Order)
- `action`: Filter by action type: CREATE, READ, UPDATE, DELETE
- `ipAddress`: Filter by client IP address

**Pagination:**
- `page`: Page number (0-indexed, default: 0)
- `size`: Page size (default: 20, max: 100)
- `sort`: Sort field (default: timestamp, direction: DESC)

**Example Query:**
```
GET /api/v1/audit-logs?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z&username=manager_01&entityName=Ingredient&page=0&size=50
```

## Audit Log API Endpoints ← resolved in iteration 2

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| GET | /api/v1/audit-logs | List audit logs with filters | Manager, Admin |
| GET | /api/v1/audit-logs/{id} | Get single audit log entry | Manager, Admin |
| GET | /api/v1/audit-logs/export | Export logs (CSV/JSON) | Admin only |
| DELETE | /api/v1/audit-logs/{id} | Delete single log entry | Admin only |

**Response Format (GET /audit-logs):**
```json
{
  "content": [
    {
      "id": "123",
      "username": "manager_01",
      "action": "CREATE",
      "entityName": "Ingredient",
      "entityId": "456",
      "details": "added a new ingredient[Ingredient:456] to the inventory",
      "timestamp": "2024-01-15T10:30:00Z",
      "ipAddress": "192.168.1.100"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8
}
```

---

## Resolved Gaps Log
| Gap ID | Iteration | Category | Resolution Summary |
|---|---|---|---|
| GAP-001 | 1 | STORY_STRUCTURE | Added 5 acceptance criteria for audit logging |
| GAP-002 | 1 | DATA_SCHEMA | Defined audit_log entity with 8 fields |
| GAP-003 | 1 | DATA_SCHEMA | Defined 9 categories of sensitive data to exclude |
| GAP-004 | 1 | API_CONTRACT | Log format: `{userId} -> {action_description}[{entity_type}:{entity_id}]` |
| GAP-005 | 1 | TEMPORAL | Default retention: 90 days online, archive for 2 years |
| GAP-006 | 1 | EDGE_CASES | Non-blocking async logging with fallback to system.out |
| GAP-007 | 2 | ROLE_ACTOR | Defined 6 roles: Owner/Admin, Manager, Server, Kitchen/Expo, Cashier, System |
| GAP-008 | 2 | SECURITY | Permission matrix for audit logs: Admin has full CRUD+EXPORT+DELETE, Manager has READ+EXPORT |
| GAP-009 | 2 | EDGE_CASES | Audit log query filters: date range, username, entity type, action, IP address + pagination |
| GAP-010 | 2 | API_CONTRACT | REST endpoints: GET /audit-logs, GET /audit-logs/{id}, GET /export, DELETE /{id} |
