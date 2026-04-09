## PHASE 1 — Custom Login to Spring Authorization Server Wrapper

### 1.1 Trigger Condition
Evaluate `profile.sso.type` from Phase 0:
- If `auth0` or `spring-as`, **SKIP THIS ENTIRE PHASE** and proceed directly to Phase 2.
- If `custom` or `none` (meaning the existing API uses standard Spring Security `/login`, custom JWTs, or no external OIDC provider), **YOU MUST EXECUTE THIS PHASE** to scaffold a compliant identity provider.

### 1.2 Extract Custom Identity Logic
Scan the existing `backend.srcDir` for:
- Implementations of `UserDetailsService`.
- Custom `AuthenticationProvider` or `PasswordEncoder` beans.
- JPA Entities representing users (e.g., `User`, `Account`, `KycDetails`).
- Existing `/api/auth/login` controllers.

### 1.3 Scaffold `fapi-auth-server` Project
Generate a standalone Spring Boot application in a new directory `fapi-auth-server/` at the repository root.
This new microservice will wrap their custom logic in a FAPI-compliant OIDC Spring Authorization Server.

**Dependencies needed (`pom.xml` or `build.gradle`):**
- `spring-boot-starter-oauth2-authorization-server`
- `spring-boot-starter-security`
- `spring-boot-starter-web`
- Whatever database/persistence dependencies the custom logic requires (e.g., `spring-boot-starter-data-jpa`, PostgreSQL Driver).

### 1.4 Port Identitiy Logic & Enforce FAPI Features
Copy the discovered identity configuration (`UserDetailsService`, `UserRepository`, `PasswordEncoder`) into `fapi-auth-server/src/main/java/com/fapi/auth/`.

**Inject FAPI 2.0 Compliance Features:**
If the legacy flow lacked strict security, implement standard Spring AS configurations for them:
- **PKCE & PAR Requirement**: 
  ```java
  RegisteredClient.clientSettings(ClientSettings.builder()
      .requireProofKey(true)
      .requireAuthorizationConsent(true)
      .build())
  ```
- **PAR Endpoint Activation**:
  ```yaml
  spring:
    security:
      oauth2:
        authorizationserver:
          endpoint:
            par-endpoint:
              enabled: true
  ```
- **DPoP Support**: 
  Ensure the resource server and AS agree on DPoP bindings. Spring AS natively supports bounding access tokens to the client's DPoP proof key in recent versions.
- **Strict JWK Rotation**: 
  Implement an in-memory `JWKSource<SecurityContext>` populated with a fresh `RSAKey` (2048-bit) on startup.

### 1.5 Multi-Client Support (Browser vs App)
The wrapper must support both web browsers and mobile apps. Scaffold two distinct `RegisteredClient` configurations:
1. **Web SPA (Browser)**: `public` client, restricted to `response_type=code`, strict redirect URIs, no `client_secret`.
2. **Mobile App**: `public` or `confidential` client (if using app-attestation), restricted redirect URIs specifically matching deep-links (e.g., `app://callback`).

### 1.6 Host Configuration & Deployment
Deploy the wrapped AS based on infrastructure:
- **Docker**: Append a new `fapi-auth-server` container block to `docker-compose.yml` exposing port `9000`. Link it to the same database as the main API.
- **VPS/Bare Metal**: Configure `scripts/install-vps.sh` to package the AS as an executable `bootJar` or run via `systemd`.

### 1.7 Mutate Project Profile
After generating the `fapi-auth-server`:
- Overwrite `profile.sso.type = 'spring-as'`
- Overwrite `profile.sso.issuerUrl = 'http://localhost:9000'` (or the correct network boundary URL)
- Assign `profile.sso.clientId` corresponding to the chosen frontend client.
- Proceed to Phase 2 for the frontend integration!
