## PHASE 3 — Framework Adapter

### 3A — React Adapter

Generate `src/lib/fapi/react/`:

#### `src/lib/fapi/react/FapiProvider.tsx`

```typescript
'use client'; // Next.js compat — ignored in Vite/CRA

import {
  createContext, useContext, useEffect, useState,
  useCallback, useRef, type ReactNode,
} from 'react';
import { createFapiClient, getFapiClient, type FapiClient } from '../client';
import { FAPI_CONFIG } from '../config';
import type { FapiError } from '../types';

interface FapiContextValue {
  isAuthenticated:  boolean;
  isLoading:        boolean;
  error:            FapiError | null;
  user:             Record<string, unknown> | null;
  login:            () => Promise<void>;
  logout:           () => void;
  fetch:            (url: string, init?: RequestInit) => Promise<Response>;
}

const FapiCtx = createContext<FapiContextValue | null>(null);

export function FapiProvider({ children }: { children: ReactNode }) {
  const clientRef             = useRef<FapiClient | null>(null);
  const [isLoading,  setLoading]  = useState(true);
  const [isAuth,     setAuth]     = useState(false);
  const [error,      setError]    = useState<FapiError | null>(null);

  useEffect(() => {
    const client = createFapiClient(FAPI_CONFIG);
    clientRef.current = client;

    async function bootstrap() {
      try {
        // Handle callback redirect
        const callbackPath = new URL(FAPI_CONFIG.redirectUri).pathname;
        if (window.location.pathname === callbackPath) {
          await client.handleCallback();
          // Redirect to app root after successful callback
          window.history.replaceState({}, document.title, '/');
        }
        setAuth(client.isAuthenticated());
      } catch (e) {
        setError(e as FapiError);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const login  = useCallback(() => getFapiClient().login(), []);
  const logout = useCallback(() => getFapiClient().logout(), []);
  const apiFetch = useCallback(
    (url: string, init?: RequestInit) => getFapiClient().fetch(url, init),
    [],
  );

  return (
    <FapiCtx.Provider value={{
      isAuthenticated: isAuth,
      isLoading,
      error,
      user: clientRef.current?.getUser() ?? null,
      login,
      logout,
      fetch: apiFetch,
    }}>
      {isLoading ? <FapiLoadingScreen /> : children}
    </FapiCtx.Provider>
  );
}

function FapiLoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: 'system-ui',
    }}>
      <div>Authenticating…</div>
    </div>
  );
}

export function useFapi(): FapiContextValue {
  const ctx = useContext(FapiCtx);
  if (!ctx) throw new Error('[FAPI] useFapi must be used inside <FapiProvider>');
  return ctx;
}
```

#### `src/lib/fapi/react/withFapiGuard.tsx`

```typescript
import { useEffect, type ComponentType } from 'react';
import { useFapi } from './FapiProvider';

export function withFapiGuard<P extends object>(
  Component: ComponentType<P>,
  FallbackComponent?: ComponentType,
) {
  return function GuardedComponent(props: P) {
    const { isAuthenticated, isLoading, login } = useFapi();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        login().catch(console.error);
      }
    }, [isLoading, isAuthenticated]);

    if (isLoading) return FallbackComponent ? <FallbackComponent /> : null;
    if (!isAuthenticated) return null;
    return <Component {...props} />;
  };
}
```

#### `src/lib/fapi/react/useApi.ts`

```typescript
// Convenience hook for making FAPI-authenticated API calls
import { useCallback } from 'react';
import { useFapi } from './FapiProvider';

export function useApi() {
  const { fetch: fapiFetch } = useFapi();

  const get = useCallback(
    (url: string) => fapiFetch(url, { method: 'GET' }),
    [fapiFetch],
  );

  const post = useCallback(
    (url: string, body: unknown) => fapiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    [fapiFetch],
  );

  const put = useCallback(
    (url: string, body: unknown) => fapiFetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    [fapiFetch],
  );

  const del = useCallback(
    (url: string) => fapiFetch(url, { method: 'DELETE' }),
    [fapiFetch],
  );

  return { get, post, put, del, fetch: fapiFetch };
}
```

### 3B — Angular Adapter

Detect Angular version to choose correct pattern:
- **Angular v17+** (standalone = true in `angular.json`) → use `provideHttpClient`, functional guards
- **Angular v15–16** → use `NgModule` + class-based guards

Generate `src/lib/fapi/angular/`:

#### `src/lib/fapi/angular/fapi.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { createFapiClient, getFapiClient } from '../client';
import { FAPI_CONFIG } from '../config';
import type { FapiConfig } from '../types';

@Injectable({ providedIn: 'root' })
export class FapiService {
  private router = inject(Router);
  private client = createFapiClient(FAPI_CONFIG);

  async init(): Promise<void> {
    const callbackPath = new URL(FAPI_CONFIG.redirectUri).pathname;
    if (window.location.pathname === callbackPath) {
      try {
        await this.client.handleCallback();
        await this.router.navigateByUrl('/');
      } catch (e) {
        console.error('[FAPI] Callback handling failed:', e);
        await this.login();
      }
    }
  }

  async login(): Promise<void> {
    return this.client.login();
  }

  logout(): void {
    this.client.logout();
  }

  isAuthenticated(): boolean {
    return this.client.isAuthenticated();
  }

  getUser(): Record<string, unknown> | null {
    return this.client.getUser();
  }

  async fetch(url: string, init?: RequestInit): Promise<Response> {
    return getFapiClient().fetch(url, init);
  }

  getAccessToken(): string | null {
    const { tokenStore } = require('../token-store');
    return tokenStore.getAccessToken();
  }
}
```

#### `src/lib/fapi/angular/fapi-http.interceptor.ts`

```typescript
import { inject } from '@angular/core';
import type { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { tokenStore } from '../token-store';
import { createDPoPProof } from '../crypto';
import { getFapiClient } from '../client';

// Functional interceptor (Angular v15+)
export function fapiHttpInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const token = tokenStore.getAccessToken();
  if (!token) return next(req);

  // Only intercept requests to the API base URL
  const apiBase = '{{profile.backend.apiBaseUrl}}';
  if (!req.url.startsWith(apiBase)) return next(req);

  return from(
    getFapiClient().fetch(req.url, { method: req.method })
      .then(async () => {
        // Build DPoP proof for this exact request
        const client = getFapiClient() as any;
        if (!client.keyPair) await client.init();
        const proof = await createDPoPProof(
          client.keyPair!, req.method, req.url, token
        );
        return proof;
      })
  ).pipe(
    switchMap(proof => {
      const authReq = req.clone({
        setHeaders: {
          'Authorization': `DPoP ${token}`,
          'DPoP':          proof,
        },
      });
      return next(authReq);
    }),
  );
}
```

#### `src/lib/fapi/angular/fapi-auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { FapiService } from './fapi.service';

// Functional guard (Angular v15+)
export const fapiAuthGuard: CanActivateFn = async (_route, _state) => {
  const fapi = inject(FapiService);
  if (fapi.isAuthenticated()) return true;
  await fapi.login();
  return false;
};
```

#### `src/lib/fapi/angular/fapi.module.ts` (for Angular v15/v16 NgModule apps)

```typescript
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FapiService } from './fapi.service';
import type { FapiConfig } from '../types';

// Class-based interceptor adapter for Angular <v15
import { Injectable } from '@angular/core';
import type { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { tokenStore } from '../token-store';
import { createDPoPProof } from '../crypto';
import { getFapiClient } from '../client';

@Injectable()
export class FapiHttpInterceptorClass implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = tokenStore.getAccessToken();
    if (!token) return next.handle(req);
    return from(
      (async () => {
        const client = getFapiClient() as any;
        if (!client.keyPair) await client.init();
        return createDPoPProof(client.keyPair!, req.method, req.url, token);
      })()
    ).pipe(
      switchMap(proof => next.handle(
        req.clone({ setHeaders: { 'Authorization': `DPoP ${token}`, 'DPoP': proof } })
      )),
    );
  }
}

@NgModule({ imports: [HttpClientModule] })
export class FapiModule {
  static forRoot(_config: FapiConfig): ModuleWithProviders<FapiModule> {
    return {
      ngModule: FapiModule,
      providers: [
        FapiService,
        { provide: HTTP_INTERCEPTORS, useClass: FapiHttpInterceptorClass, multi: true },
      ],
    };
  }
}
```

#### `src/lib/fapi/angular/fapi.initializer.ts`

```typescript
// APP_INITIALIZER factory — runs FapiService.init() before app renders
import type { ApplicationConfig } from '@angular/core';
import { APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { FapiService } from './fapi.service';
import { fapiHttpInterceptor } from './fapi-http.interceptor';
import { routes } from '../../app/app.routes';    // adjust path to actual routes

function fapiInitFactory(fapi: FapiService): () => Promise<void> {
  return () => fapi.init();
}

// For standalone Angular v17+:
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([fapiHttpInterceptor])),
    {
      provide:    APP_INITIALIZER,
      useFactory: fapiInitFactory,
      deps:       [FapiService],
      multi:      true,
    },
  ],
};
```

### PHASE 3 PASS CONDITIONS
- [ ] React: `FapiProvider.tsx`, `withFapiGuard.tsx`, `useApi.ts` generated
- [ ] Angular: `fapi.service.ts`, `fapi-http.interceptor.ts`, `fapi-auth.guard.ts`,
       `fapi.module.ts`, `fapi.initializer.ts` generated
- [ ] `{{profile.backend.apiBaseUrl}}` resolved in `fapi-http.interceptor.ts`
- [ ] Entrypoint (`main.tsx` or `main.ts`) updated to use new provider/initializer
- [ ] TypeScript compiles cleanly: `tsc --noEmit` exits 0

---
