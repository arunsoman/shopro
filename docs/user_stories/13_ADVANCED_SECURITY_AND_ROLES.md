# 13. Advanced Security & Role Management Requirements

## 1. Overview
This document captures requirements for high-assurance security protocols (FAPI 2.0), dynamic role management, and operational resilience (Offline Support) for the Shopro POS system.

## 2. Advanced Security (FAPI 2.0)

### US-13.1: DPoP Device Binding
- **As a** Manager, **I want to** ensure that my staff's authentication tokens are cryptographically bound to the specific POS terminal hardware, **so that** stolen tokens cannot be used on unauthorized devices.
- **Acceptance Criteria**:
    - The terminal must generate a hardware-backed key pair (DPoP Proof) for every login.
    - The server must verify the `DPoP` header against the issued token's public key for all financial and administrative endpoints.
    - Requests without a valid DPoP proof must be rejected with a `401 Unauthorized` error.

### US-13.2: Signed Financial Responses
- **As a** Restaurant Owner, **I want to** ensure that final bill totals and payment statuses transmitted to customers are cryptographically signed by the server, **so that** no man-in-the-middle can alter transaction amounts.
- **Acceptance Criteria**:
    - The server must provide a JWS (JSON Web Signature) for all `PaymentResponse` and `OrderTotal` objects.
    - The client (Flutter/Web) must verify the signature before displaying the final amount or processing a payment.

## 3. Dynamic Roles & Permissions

### US-13.3: Threshold-Based Discount Permissions
- **As a** General Manager, **I want to** define roles with specific discount thresholds (e.g., Server can discount up to 10%, Supervisor up to 25%), **so that** standard staff have some flexibility but large discounts require manual override.
- **Acceptance Criteria**:
    - Permissions for `PAYMENT:DISCOUNT` must support an optional `max_percentage` attribute.
    - Applying a discount above the staff member's threshold must trigger the Manager Override prompt (US-1.2).

### US-13.4: Inheritance Loop Prevention
- **As a** Manager, **I want to** be protected from creating circular dependencies in role hierarchies, **so that** the permission system does not enter an infinite loop during resolution.
- **Acceptance Criteria**:
    - The Admin UI must perform a cycle-detection check during role configuration.
    - Circular inheritance attempts must be blocked with a clear explanation of the dependency chain.

## 4. Operational Resilience

### US-13.5: Offline Capability Token
- **As a** Server, **I want to** continue operating the POS during internet outages using cached permissions, **so that** customer service is not interrupted.
- **Acceptance Criteria**:
    - The system must securely cache a signed "Offline Capability Token" with a configurable TTL (default 12 hours).
    - Verified actions performed offline must be queued for reconciliation once the network is restored.
