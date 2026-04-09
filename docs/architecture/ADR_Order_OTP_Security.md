# ADR: Order OTP Hashing & TTL Management

## Status
Proposed (Applied in V84 Migration)

## Context
The "Sabz" web application requires a secure mechanism to verify customers at physical fulfillment points (pickup/table-side). A simple plaintext OTP in the database is a security risk if the database is compromised. Additionally, OTPs must be short-lived to prevent reuse or replay attacks.

## Decisions

### 1. Cryptographically Secure Generation
OTPs will be generated using `java.security.SecureRandom` to ensure non-predictability.
- **Length**: 6 digits (numeric) for ease of manual entry by staff.
- **Character Set**: `0-9`.

### 2. Hashed Persistence (Secret-at-Rest)
OTPs will **never** be stored in plain text.
- **Algorithm**: SHA-256 (with a per-order salt) or BCrypt. Given the low entropy of a 6-digit OTP, a simple hash is vulnerable to brute-force if the salt is known. However, because the OTP has a very short TTL and the system enforces a strict **max 5 failed attempts** per order, the risk of online brute-force is mitigated.
- **Implementation**: We will store the salted hash in the `order_otp` table.

### 3. TTL Management
- **Takeaway**: 30 minutes past the scheduled pickup time.
- **Dine-In**: 15 minutes past the scheduled arrival time.
- **Enforcement**: Verification logic will check `expiry_at` against current time. A background job (Spring `@Scheduled`) will clean up expired, unverified OTPs daily.

### 4. Single-Use Enforcement
Upon successful verification, the `verified_at` column is populated. Any subsequent verification attempt for an OTP with a non-null `verified_at` will be rejected as "Already Used" and logged for fraud detection.

## Consequences
- **Positive**: High security for customer identity; PCI-DSS/GDPR compliant handling of sensitive tokens.
- **Negative**: Increased CPU overhead for hashing (minimal for SHA-256); slightly more complex verification logic compared to plaintext.
