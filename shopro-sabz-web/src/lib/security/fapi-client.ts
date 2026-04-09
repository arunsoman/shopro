import { DPoPWebService } from './dpop-service';

export interface FapiConfig {
  issuerUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
}

export class FapiClient {
  private config: FapiConfig;

  constructor(config: FapiConfig) {
    this.config = config;
  }

  /**
   * Generates a random state and PKCE verifier/challenge for the auth flow.
   */
  async prepareAuthRequest() {
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const verifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const challenge = await this.generateS256Challenge(verifier);

    localStorage.setItem('fapi_auth_state', JSON.stringify({ state, nonce, verifier }));
    return { state, nonce, challenge };
  }

  private async generateS256Challenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Performs a Pushed Authorization Request (PAR) to the AS.
   * Note: This requires DPoP binding for the PAR call in FAPI 2.0 Advanced.
   */
  async startParFlow() {
    const { state, nonce, challenge } = await this.prepareAuthRequest();
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      state: state,
      nonce: nonce,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      response_mode: 'jwt' // JARM
    });

    const parUrl = `${this.config.issuerUrl}/oauth2/par`;
    const dpop = await DPoPWebService.generateProof('POST', parUrl);

    const response = await fetch(parUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'DPoP': dpop
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`PAR failed: ${await response.text()}`);
    }

    const { request_uri } = await response.json();
    
    // Redirect user to the authorize endpoint with the request_uri
    const authUrl = `${this.config.issuerUrl}/oauth2/authorize?client_id=${this.config.clientId}&request_uri=${request_uri}`;
    window.location.href = authUrl;
  }

  /**
   * Exchanges the authorization code for an entry token (AccessToken + IdToken).
   * Validates state and uses the PKCE verifier stored in localStorage.
   */
  async exchangeCodeForToken(code: string, state: string) {
    const stored = localStorage.getItem('fapi_auth_state');
    if (!stored) throw new Error("No FAPI auth state found in localStorage");
    
    const { state: storedState, verifier } = JSON.parse(stored);
    if (state !== storedState) throw new Error("FAPI state mismatch — potential CSRF");

    const tokenUrl = `${this.config.issuerUrl}/oauth2/token`;
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      code_verifier: verifier
    });

    const dpop = await DPoPWebService.generateProof('POST', tokenUrl);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'DPoP': dpop
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${await response.text()}`);
    }

    const tokens = await response.json();
    localStorage.removeItem('fapi_auth_state'); // Cleanup
    
    // Parse ID token to extract user info
    const idTokenClaims = this.parseIdToken(tokens.id_token);
    
    return {
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        claims: idTokenClaims
    };
  }

  private parseIdToken(idToken: string) {
    try {
        const payload = idToken.split('.')[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (error) {
        console.error("Failed to parse ID Token", error);
        return {};
    }
  }

  /**
   * Generates the OIDC end session URL.
   */
  getLogoutUrl(idTokenHint?: string) {
    const baseUrl = `${this.config.issuerUrl}/connect/logout`;
    const params = new URLSearchParams({
        post_logout_redirect_uri: "https://sabz.shopro.local/"
    });
    if (idTokenHint) {
        params.append('id_token_hint', idTokenHint);
    }
    return `${baseUrl}?${params.toString()}`;
  }
}
