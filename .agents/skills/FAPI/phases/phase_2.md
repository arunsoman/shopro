## PHASE 1 — Archive Existing Auth Layer

**Full takeover = archive everything, rewrite all references.**

### 1.1 Build archive manifest

Collect all files to archive from `profile.frontend.existingAuth`:
- `existingAuth.files`
- `existingAuth.guardFiles`
- `existingAuth.interceptorFiles`
- `existingAuth.configFiles`
- Any file whose `import` contains the old auth package names

```bash
# Log manifest
echo "=== FAPI ARCHIVE MANIFEST ===" >> fapi-integration.log
echo "Timestamp: ${ARCHIVE_TS}" >> fapi-integration.log
echo "Archive dir: ${ARCHIVE_DIR}" >> fapi-integration.log
```

### 1.2 Archive files

For every file in the manifest:
```bash
# Preserve directory structure inside archive
RELATIVE_PATH=$(realpath --relative-to="${FRONTEND_ROOT}" "${FILE}")
DEST="${ARCHIVE_DIR}/${RELATIVE_PATH}"
mkdir -p "$(dirname ${DEST})"
cp "${FILE}" "${DEST}"
echo "ARCHIVED: ${FILE} → ${DEST}" >> fapi-integration.log
# Then DELETE the original
rm "${FILE}"
```

### 1.3 Remove old auth packages

```bash
# React
REMOVE_PKGS=""

# Auth0 React
if profile.frontend.existingAuth.packages includes "@auth0/auth0-react"; then
  REMOVE_PKGS="${REMOVE_PKGS} @auth0/auth0-react"
fi
# Auth0 Angular
if includes "@auth0/auth0-angular"; then
  REMOVE_PKGS="${REMOVE_PKGS} @auth0/auth0-angular"
fi
# Angular OAuth2 OIDC
if includes "angular-oauth2-oidc"; then
  REMOVE_PKGS="${REMOVE_PKGS} angular-oauth2-oidc"
fi
# OIDC client
if includes "oidc-client" OR "oidc-client-ts"; then
  REMOVE_PKGS="${REMOVE_PKGS} oidc-client oidc-client-ts"
fi

cd ${FRONTEND_ROOT} && npm uninstall ${REMOVE_PKGS}
```

### 1.4 Rewrite import references

For every remaining `.ts` / `.tsx` file in `src/` that imports from archived files:

```typescript
// PATTERN: find imports of old auth provider/service
// e.g.: import { Auth0Provider } from '@auth0/auth0-react'
//       import { AuthService } from './auth/auth.service'
//       import { AuthGuard } from './guards/auth.guard'

// REPLACEMENT RULE:
//   Old Auth0Provider   → FapiProvider  (from '@/lib/fapi/react')
//   Old Auth0Angular    → FapiService   (from '@/lib/fapi/angular/fapi.service')
//   Old useAuth0        → useFapi       (from '@/lib/fapi/react')
//   Old AuthService     → FapiService   (from '@/lib/fapi/angular/fapi.service')
//   Old AuthGuard       → FapiAuthGuard (from '@/lib/fapi/angular/fapi-auth.guard')
//   Old HTTP interceptor → FapiHttpInterceptor

// Write these rewrites to a REWRITE MAP before executing:
REWRITE_MAP = {
  '@auth0/auth0-react':     '@/lib/fapi/react',
  '@auth0/auth0-angular':   '@/lib/fapi/angular/fapi.service',
  'angular-oauth2-oidc':    '@/lib/fapi/angular/fapi.service',
  './auth/auth.service':    '@/lib/fapi/angular/fapi.service',
  '../auth/auth.service':   '@/lib/fapi/angular/fapi.service',
  './guards/auth.guard':    '@/lib/fapi/angular/fapi-auth.guard',
  './auth.guard':           '@/lib/fapi/angular/fapi-auth.guard',
}
// Log each rewrite
```

### 1.5 Rewrite entrypoint wrapper

**React — `src/main.tsx`:**
```typescript
// BEFORE (example):
// <Auth0Provider domain="..." clientId="..." redirectUri="...">
//   <App />
// </Auth0Provider>

// AFTER (generated):
import { FapiProvider } from '@/lib/fapi/react/FapiProvider';

root.render(
  <StrictMode>
    <FapiProvider>
      <App />
    </FapiProvider>
  </StrictMode>
);
```

**Angular — `src/app.module.ts` or `src/app/app.config.ts` (v17+ standalone):**
```typescript
// BEFORE: Auth0Module.forRoot({...}) or OAuthModule.forRoot()
// AFTER:  FapiModule.forRoot(FAPI_CONFIG)
// Also: replace existing HTTP_INTERCEPTORS provider with FapiHttpInterceptor
```

### PHASE 1 PASS CONDITIONS
- [ ] `_fapi_archive/${ARCHIVE_TS}/` contains all old auth files
- [ ] `fapi-integration.log` lists every archived file
- [ ] Old auth packages absent from `package.json`
- [ ] No remaining imports from removed packages (`grep -r "@auth0\|angular-oauth2-oidc" src/` → 0 results)
- [ ] Entrypoint rewritten to use FAPI provider
- [ ] `npm run build` (React) or `ng build --configuration=development` (Angular) exits 0

---
