## PHASE 0 — Discovery

### 0.1 Archive Timestamp

Generate once, use throughout:
```
ARCHIVE_TS=$(date +%Y%m%d%H%M%S)
ARCHIVE_DIR="_fapi_archive/${ARCHIVE_TS}"
mkdir -p "${ARCHIVE_DIR}"
```

### 0.2 Scan Project Files

Scan `/mnt/user-data/uploads/` and local working directory.
Read these files in priority order:

#### Frontend detection
```
package.json              → framework, existing auth deps, scripts
angular.json              → confirm Angular, extract sourceRoot, project name
vite.config.ts            → confirm React+Vite, port, proxy config
src/main.tsx              → React entrypoint, existing providers
src/main.ts               → Angular/React entrypoint
src/app.module.ts         → Angular root module, existing imports
src/app/app.module.ts     → Angular alternate path
src/app/app.config.ts     → Angular standalone config (v17+)
src/environments/environment.ts       → Angular env (API URL, clientId hints)
src/environments/environment.prod.ts  → Angular prod env
```

#### Existing auth detection (React)
```
src/**/Auth0Provider*     → Auth0 React SDK
src/**/auth0*             → Any Auth0 file
src/**/OAuthService*      → Custom OAuth
src/**/AuthContext*        → Custom auth context
src/**/AuthProvider*       → Any auth provider
src/**/*oidc*              → Generic OIDC
src/**/useAuth*            → Auth hook
src/**/ProtectedRoute*     → Route guard
src/**/*interceptor*       → Axios/fetch interceptor with auth
```

#### Existing auth detection (Angular)
```
src/**/*.module.ts         → look for Auth0Module, OAuthModule imports
src/**/auth.service.ts     → custom auth service
src/**/auth.guard.ts       → existing route guard
src/**/*interceptor*.ts    → HTTP interceptor with auth
src/**/auth-config.ts      → Auth0 or OIDC config file
```

#### Spring Boot detection
```
pom.xml                              → spring-security version, oauth2 deps
build.gradle / build.gradle.kts      → same
src/main/resources/application.yml   → security config, issuer-uri, client config
src/main/resources/application.properties
src/main/java/**/*SecurityConfig*.java  → security filter chain
src/main/java/**/*SecurityConfig*.kt
src/main/java/**/package-info.java   → extract base package name
```

### 0.3 Build ProjectProfile

```typescript
interface ProjectProfile {
  // ── Frontend ──────────────────────────────────────────────────────────
  frontend: {
    framework:    'react-vite' | 'react-cra' | 'angular';
    angularVersion?: number;          // 15, 16, 17+ (standalone)
    isAngularStandalone?: boolean;    // v17+ standalone components
    rootDir:      string;             // 'frontend/' | 'client/' | './'
    srcDir:       string;             // rootDir + 'src/'
    entrypoint:   string;             // path to main.tsx / main.ts
    buildTool:    'vite' | 'webpack' | 'ng-cli';
    port:         number;             // dev server port

    // Existing auth — everything here gets archived
    existingAuth: {
      type:       'auth0-react' | 'auth0-angular' | 'angular-oauth2-oidc'
                | 'custom-oidc' | 'none';
      files:      string[];           // all files to archive
      packages:   string[];           // npm packages to remove
      providerComponent?: string;     // e.g. 'Auth0Provider' — to be replaced
      guardFiles:   string[];         // existing route guards to archive
      interceptorFiles: string[];     // existing HTTP interceptors to archive
      configFiles:  string[];         // auth config files to archive
    };

    // HTTP client
    httpClient: {
      type:     'axios' | 'angular-httpclient' | 'fetch' | 'unknown';
      configFiles: string[];          // axios instance files, etc.
      interceptorFiles: string[];
    };
  };

  // ── SSO ───────────────────────────────────────────────────────────────
  sso: {
    type:               'auth0' | 'spring-as' | 'custom' | 'none';
    issuerUrl:          string;       // e.g. https://dev-xxx.us.auth0.com
    domain?:            string;       // Auth0 only: dev-xxx.us.auth0.com
    clientId:           string;
    audience?:          string;       // Auth0: API audience identifier
    redirectUri:        string;
    postLogoutRedirectUri: string;

    // Derived endpoints (auto-computed — see §DERIVE_ENDPOINTS)
    jwksUri:            string;
    parEndpoint:        string;
    tokenEndpoint:      string;
    authorizeEndpoint:  string;
    endSessionEndpoint: string;
    discoveryUrl:       string;       // /.well-known/openid-configuration
  };

  // ── Backend ───────────────────────────────────────────────────────────
  backend: {
    apiBaseUrl:         string;       // e.g. https://api.myapp.com
    basePackage:        string;       // e.g. com.shopro.api
    springSecurityMajor: 5 | 6;
    buildTool:          'maven' | 'gradle';
    securityConfigFiles: string[];
    existingOAuth2Config: boolean;
  };

  // ── Deployment ────────────────────────────────────────────────────────
  deployment:   'docker' | 'vps' | 'k8s' | 'all';
  gatewayPort:  number;               // default 3100
  nginxPort:    number;               // default 443
}
```

### 0.4 Derive SSO Endpoints

```typescript
// §DERIVE_ENDPOINTS
function deriveSsoEndpoints(sso: ProjectProfile['sso']): void {
  if (sso.type === 'auth0') {
    // Auth0 issuerUrl = https://<domain>/   (trailing slash matters)
    const base = sso.issuerUrl.replace(/\/$/, '');
    sso.jwksUri            = `${base}/.well-known/jwks.json`;
    sso.parEndpoint        = `${base}/oauth/par`;
    sso.tokenEndpoint      = `${base}/oauth/token`;
    sso.authorizeEndpoint  = `${base}/authorize`;
    sso.endSessionEndpoint = `${base}/v2/logout`;
    sso.discoveryUrl       = `${base}/.well-known/openid-configuration`;
    // NOTE: Auth0 PAR requires Enterprise plan — flag if not available
  }

  if (sso.type === 'spring-as') {
    const base = sso.issuerUrl.replace(/\/$/, '');
    sso.jwksUri            = `${base}/oauth2/jwks`;
    sso.parEndpoint        = `${base}/oauth2/par`;
    sso.tokenEndpoint      = `${base}/oauth2/token`;
    sso.authorizeEndpoint  = `${base}/oauth2/authorize`;
    sso.endSessionEndpoint = `${base}/connect/logout`;
    sso.discoveryUrl       = `${base}/.well-known/openid-configuration`;
  }
}
```

### 0.5 Interview — fill gaps only

Ask ONLY for fields that could not be discovered. Use `ask_user_input_v0` for
bounded choices, open-text for URLs and identifiers.

```
REQUIRED FIELDS (always ask if not found in scan):
  sso.issuerUrl       → "What is your {{ssoType}} issuer URL?"
  sso.clientId        → "What client_id is registered in {{ssoType}}?"
  sso.redirectUri     → "What callback/redirect URI is registered in {{ssoType}}?"
  backend.apiBaseUrl  → "What is your Spring Boot API base URL?"
  backend.basePackage → "What is the base Java package? (e.g. com.mycompany.api)"

CONDITIONAL FIELDS:
  sso.audience  (Auth0 only, if not in existing auth config)
              → "What is your Auth0 API audience identifier?"
  deployment    (if Docker Compose, VPS configs, and k8s/ not found)
              → multi-select: Docker Compose / VPS / Kubernetes / All three
```

### PHASE 0 PASS CONDITION
All `ProjectProfile` fields populated. No field contains `null` or `"unknown"`.
Zero `{{...}}` placeholders remaining.

---
