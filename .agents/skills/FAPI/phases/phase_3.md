## PHASE 2 — FAPI Core Library

Install dependencies, then generate the portable FAPI core.

### 2.1 Install packages

```bash
cd ${FRONTEND_ROOT}

# Common
npm install --save jose uuid

# React specific
if framework == 'react-vite' OR 'react-cra':
  npm install --save react react-dom
  # (already present — just ensure versions ≥18)

# Angular specific — no extra deps needed (uses native HttpClient)
```

### 2.2 Generate `src/lib/fapi/` — Core (framework-agnostic)

#### `src/lib/fapi/types.ts`

```typescript
export type SsoType = 'auth0' | 'spring-as';

export interface FapiConfig {
  ssoType:            SsoType;
  issuer:             string;
  clientId:           string;
  audience?:          string;       // Auth0 only
  redirectUri:        string;
  postLogoutRedirectUri: string;
  scopes:             string[];
  // Endpoints (all pre-populated by config.ts — never call discovery at runtime)
  jwksUri:            string;
  parEndpoint:        string;
  tokenEndpoint:      string;
  authorizeEndpoint:  string;
  endSessionEndpoint: string;
  dpop:               true;         // ALWAYS true — FAPI Advanced mandates DPoP
}

export interface TokenSet {
  accessToken:   string;
  idToken:       string;
  refreshToken?: string;
  expiresAt:     number;            // Unix timestamp
  tokenType:     'DPoP';           // always DPoP
  scope:         string;
}

export interface DPoPKeyPair {
  publicKey:  CryptoKey;
  privateKey: CryptoKey;           // non-extractable
  publicJwk:  JsonWebKey;          // cached export of publicKey
  thumbprint: string;              // SHA-256 JWK thumbprint
}

export interface FapiSession {
  tokenSet:      TokenSet;
  pkceVerifier:  string;
  state:         string;
  nonce:         string;
  dpopKeyPair?:  SerializedKeyPair; // public JWK only — private never serialized
}

// Only the public key survives sessionStorage serialization
export interface SerializedKeyPair {
  publicJwk:  JsonWebKey;
  thumbprint: string;
}

export class FapiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = false,
  ) {
    super(message);
    this.name = 'FapiError';
  }
}
```

#### `src/lib/fapi/crypto.ts`

```typescript
import type { DPoPKeyPair } from './types';

const B64URL = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function generateDPoPKeyPair(): Promise<DPoPKeyPair> {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,                          // private key NON-EXTRACTABLE — FAPI requirement
    ['sign', 'verify'],
  );
  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey) as JsonWebKey;
  const thumbprint = await computeJwkThumbprint(publicJwk);
  return { publicKey: pair.publicKey, privateKey: pair.privateKey, publicJwk, thumbprint };
}

export async function computeJwkThumbprint(jwk: JsonWebKey): Promise<string> {
  // RFC 7638 — SHA-256 of canonical JSON with required members only
  const canonical = JSON.stringify(
    jwk.kty === 'EC'
      ? { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y }
      : { e: jwk.e, kty: jwk.kty, n: jwk.n },
  );
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return B64URL(hash);
}

export async function createDPoPProof(
  keyPair: DPoPKeyPair,
  method: string,
  url: string,
  accessToken?: string,
  serverNonce?: string,
): Promise<string> {
  const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: keyPair.publicJwk };
  const now    = Math.floor(Date.now() / 1000);

  const payload: Record<string, unknown> = {
    jti: crypto.randomUUID(),
    htm: method.toUpperCase(),
    htu: normaliseUrl(url),
    iat: now,
    exp: now + 120,                 // 2 min — FAPI max
  };

  if (accessToken) {
    const hash = await crypto.subtle.digest(
      'SHA-256', new TextEncoder().encode(accessToken),
    );
    payload['ath'] = B64URL(hash);  // ath REQUIRED on resource requests
  }

  if (serverNonce) {
    payload['nonce'] = serverNonce;  // include AS-issued nonce when challenged
  }

  const hdr = B64URL(new TextEncoder().encode(JSON.stringify(header)).buffer as ArrayBuffer);
  const pld = B64URL(new TextEncoder().encode(JSON.stringify(payload)).buffer as ArrayBuffer);
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    keyPair.privateKey,
    new TextEncoder().encode(`${hdr}.${pld}`),
  );

  return `${hdr}.${pld}.${B64URL(sig)}`;
}

function normaliseUrl(url: string): string {
  try { const u = new URL(url); return `${u.protocol}//${u.host}${u.pathname}`; }
  catch { return url; }
}
```

#### `src/lib/fapi/pkce.ts`

```typescript
// S256 ONLY — plain method forbidden by FAPI 2.0

const B64URL = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const raw      = crypto.getRandomValues(new Uint8Array(32));
  const verifier = B64URL(raw.buffer as ArrayBuffer);
  const hash     = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: B64URL(hash) };
}

export const generateState = (): string =>
  B64URL((crypto.getRandomValues(new Uint8Array(32))).buffer as ArrayBuffer);

export const generateNonce = (): string =>
  B64URL((crypto.getRandomValues(new Uint8Array(32))).buffer as ArrayBuffer);
```

#### `src/lib/fapi/token-store.ts`

```typescript
import type { FapiSession } from './types';

// FAPI: NO localStorage.
// Primary: in-memory (closure) — survives JS execution, not page refresh.
// Fallback: sessionStorage — tab-scoped, cleared on close, acceptable per FAPI.
// Private key NEVER serialized — DPoP keypair regenerated on page refresh → silent re-login.

const SESSION_KEY = '__fapi__';
let _mem: FapiSession | null = null;

export const tokenStore = {
  save(s: FapiSession): void {
    _mem = s;
    try {
      // Omit dpopKeyPair private key — only store public JWK fingerprint
      const safe: FapiSession = {
        ...s,
        dpopKeyPair: s.dpopKeyPair
          ? { publicJwk: s.dpopKeyPair.publicJwk, thumbprint: s.dpopKeyPair.thumbprint }
          : undefined,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    } catch { /* quota exceeded — memory only */ }
  },

  load(): FapiSession | null {
    if (_mem) return _mem;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) { _mem = JSON.parse(raw); return _mem; }
    } catch { /* corrupted */ }
    return null;
  },

  clear(): void {
    _mem = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  },

  isExpired(): boolean {
    const s = this.load();
    if (!s?.tokenSet.accessToken) return true;
    return Date.now() / 1000 > s.tokenSet.expiresAt - 30;   // 30s buffer
  },

  getAccessToken(): string | null {
    return this.load()?.tokenSet.accessToken ?? null;
  },
};
```

#### `src/lib/fapi/par-client.ts`

```typescript
import type { FapiConfig } from './types';
import { FapiError } from './types';

export interface PARResult {
  requestUri:  string;
  expiresIn:   number;
}

export async function pushAuthorizationRequest(
  config: FapiConfig,
  params: {
    state:                string;
    nonce:                string;
    codeChallenge:        string;
    codeChallengeMethod:  'S256';
  },
): Promise<PARResult> {
  const body = new URLSearchParams({
    client_id:             config.clientId,
    response_type:         'code',
    redirect_uri:          config.redirectUri,
    scope:                 config.scopes.join(' '),
    state:                 params.state,
    nonce:                 params.nonce,
    code_challenge:        params.codeChallenge,
    code_challenge_method: 'S256',
    // Auth0: include audience for API access
    ...(config.audience ? { audience: config.audience } : {}),
  });

  const res = await fetch(config.parEndpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>;
    throw new FapiError(
      `PAR failed (${res.status}): ${err['error_description'] ?? err['error'] ?? 'unknown'}`,
      err['error'] ?? 'PAR_FAILED',
      res.status === 400,
    );
  }

  const data = await res.json() as { request_uri: string; expires_in: number };
  return { requestUri: data.request_uri, expiresIn: data.expires_in };
}
```

#### `src/lib/fapi/client.ts`

```typescript
import type { FapiConfig, DPoPKeyPair, TokenSet } from './types';
import { FapiError } from './types';
import { generateDPoPKeyPair, createDPoPProof } from './crypto';
import { generatePKCE, generateState, generateNonce } from './pkce';
import { tokenStore } from './token-store';
import { pushAuthorizationRequest } from './par-client';

export class FapiClient {
  private keyPair: DPoPKeyPair | null = null;

  constructor(readonly config: FapiConfig) {}

  // ── Initialise DPoP keypair ─────────────────────────────────────────────
  async init(): Promise<void> {
    if (!this.keyPair) {
      this.keyPair = await generateDPoPKeyPair();
    }
  }

  // ── Login — PAR → redirect ──────────────────────────────────────────────
  async login(): Promise<void> {
    await this.init();

    const { verifier, challenge } = await generatePKCE();
    const state = generateState();
    const nonce = generateNonce();

    // Persist PKCE + state + nonce BEFORE redirect
    tokenStore.save({
      tokenSet: { accessToken: '', idToken: '', expiresAt: 0, tokenType: 'DPoP', scope: '' },
      pkceVerifier: verifier,
      state,
      nonce,
      dpopKeyPair: this.keyPair
        ? { publicJwk: this.keyPair.publicJwk, thumbprint: this.keyPair.thumbprint }
        : undefined,
    });

    const { requestUri } = await pushAuthorizationRequest(this.config, {
      state,
      nonce,
      codeChallenge:       challenge,
      codeChallengeMethod: 'S256',
    });

    // Redirect — ONLY client_id + request_uri (FAPI requirement)
    const url = new URL(this.config.authorizeEndpoint);
    url.searchParams.set('client_id',   this.config.clientId);
    url.searchParams.set('request_uri', requestUri);
    window.location.href = url.toString();
  }

  // ── Callback handler — JARM + token extraction ──────────────────────────
  async handleCallback(): Promise<void> {
    // Gateway validates JARM and exchanges code → tokens
    // Tokens arrive in the URL fragment (SPA mode)
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    const idToken     = fragment.get('id_token');
    const expiresIn   = parseInt(fragment.get('expires_in') ?? '300', 10);

    if (!accessToken || !idToken) {
      // Check for error in fragment
      const error = fragment.get('error');
      if (error) {
        throw new FapiError(
          `Auth error: ${fragment.get('error_description') ?? error}`,
          error,
          false,
        );
      }
      throw new FapiError('No tokens in callback', 'NO_TOKENS', false);
    }

    const session = tokenStore.load();
    if (!session) {
      throw new FapiError('No session state — possible CSRF', 'NO_SESSION', false);
    }

    tokenStore.save({
      ...session,
      tokenSet: {
        accessToken,
        idToken,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
        tokenType: 'DPoP',
        scope: this.config.scopes.join(' '),
      },
    });

    // Sanitise URL — remove auth fragments from browser history
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // ── FAPI-compliant fetch — DPoP proof injected automatically ────────────
  async fetch(input: string, init: RequestInit = {}): Promise<Response> {
    if (tokenStore.isExpired()) {
      await this.login();
      return Promise.reject(new FapiError('Session expired — redirecting', 'EXPIRED', true));
    }

    await this.init();
    const token = tokenStore.getAccessToken()!;
    const proof = await createDPoPProof(this.keyPair!, init.method ?? 'GET', input, token);

    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> ?? {}),
      'Authorization': `DPoP ${token}`,
      'DPoP':          proof,
    };

    const response = await fetch(input, { ...init, headers });

    // Handle server DPoP nonce challenge (RFC 9449 §7.3)
    if (response.status === 401) {
      const wwwAuth = response.headers.get('WWW-Authenticate') ?? '';
      if (wwwAuth.includes('use_dpop_nonce')) {
        const nonceMatch = wwwAuth.match(/nonce="([^"]+)"/);
        if (nonceMatch?.[1] && this.keyPair) {
          const retryProof = await createDPoPProof(
            this.keyPair, init.method ?? 'GET', input, token, nonceMatch[1]
          );
          return fetch(input, {
            ...init,
            headers: { ...headers, 'DPoP': retryProof },
          });
        }
      }
    }

    return response;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  isAuthenticated(): boolean {
    return !!tokenStore.getAccessToken() && !tokenStore.isExpired();
  }

  getUser(): Record<string, unknown> | null {
    const s = tokenStore.load();
    if (!s?.tokenSet.idToken) return null;
    try {
      return JSON.parse(
        atob(s.tokenSet.idToken.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/'))
      ) as Record<string, unknown>;
    } catch { return null; }
  }

  logout(): void {
    const idToken = tokenStore.load()?.tokenSet.idToken;
    tokenStore.clear();
    // RP-initiated logout (OIDC)
    const url = new URL(this.config.endSessionEndpoint);

    if (this.config.ssoType === 'auth0') {
      url.searchParams.set('client_id', this.config.clientId);
      url.searchParams.set('returnTo',  this.config.postLogoutRedirectUri);
    } else {
      // Spring AS
      if (idToken) url.searchParams.set('id_token_hint', idToken);
      url.searchParams.set('post_logout_redirect_uri', this.config.postLogoutRedirectUri);
    }

    window.location.href = url.toString();
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────
let _instance: FapiClient | null = null;

export function getFapiClient(): FapiClient {
  if (!_instance) throw new Error('FapiClient not initialised — call createFapiClient() first');
  return _instance;
}

export function createFapiClient(config: FapiConfig): FapiClient {
  _instance = new FapiClient(config);
  return _instance;
}
```

#### `src/lib/fapi/config.ts` (generated from ProjectProfile — NO placeholders)

```typescript
// AUTO-GENERATED by fapi-integration skill v2.0.0
// DO NOT EDIT — re-run the skill to regenerate
import type { FapiConfig } from './types';

export const FAPI_CONFIG: FapiConfig = {
  ssoType:               '{{profile.sso.type}}',
  issuer:                '{{profile.sso.issuerUrl}}',
  clientId:              '{{profile.sso.clientId}}',
  audience:              '{{profile.sso.audience}}',       // omit if Spring AS
  redirectUri:           '{{profile.sso.redirectUri}}',
  postLogoutRedirectUri: '{{profile.sso.postLogoutRedirectUri}}',
  scopes:                ['openid', 'profile', 'email'],
  jwksUri:               '{{profile.sso.jwksUri}}',
  parEndpoint:           '{{profile.sso.parEndpoint}}',
  tokenEndpoint:         '{{profile.sso.tokenEndpoint}}',
  authorizeEndpoint:     '{{profile.sso.authorizeEndpoint}}',
  endSessionEndpoint:    '{{profile.sso.endSessionEndpoint}}',
  dpop:                  true,
};
```

**TEMPLATE RESOLUTION RULE:** Before writing `config.ts`, replace every
`{{profile.sso.*}}` with the actual value from ProjectProfile.
If `sso.type === 'spring-as'`, omit the `audience` line entirely.

### PHASE 2 PASS CONDITIONS
- [ ] `src/lib/fapi/` exists with: `types.ts`, `crypto.ts`, `pkce.ts`, `token-store.ts`, `par-client.ts`, `client.ts`, `config.ts`
- [ ] `config.ts` has zero `{{...}}` placeholders
- [ ] TypeScript compilation of fapi core passes: `tsc --noEmit`

---
