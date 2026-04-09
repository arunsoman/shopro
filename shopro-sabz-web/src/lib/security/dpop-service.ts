import { Base64 } from 'js-base64';

export class DPoPWebService {
  private static cachedKeyPair: CryptoKeyPair | null = null;

  /**
   * Generates or retrieves a persistent, non-extractable RSA-PSS key pair.
   */
  static async getOrCreateKeyPair(): Promise<CryptoKeyPair> {
    if (this.cachedKeyPair) {
      return this.cachedKeyPair;
    }
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      false, // non-extractable
      ["sign", "verify"]
    );
    this.cachedKeyPair = keyPair;
    return keyPair;
  }

  /**
   * Generates a DPoP proof JWT for the given method and URL.
   */
  static async generateProof(method: string, url: string): Promise<string> {
    const keyPair = await this.getOrCreateKeyPair();
    const publicJWK = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);

    const header = {
      typ: "dpop+jwt",
      alg: "PS256",
      jwk: {
        kty: publicJWK.kty,
        n: publicJWK.n,
        e: publicJWK.e,
      },
    };

    const payload = {
      jti: crypto.randomUUID(),
      htm: method.toUpperCase(),
      htu: url.split('?')[0], // strip query params
      iat: Math.floor(Date.now() / 1000),
    };

    const encodedHeader = Base64.encodeURI(JSON.stringify(header));
    const encodedPayload = Base64.encodeURI(JSON.stringify(payload));
    const dataToSign = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);

    const signature = await window.crypto.subtle.sign(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      keyPair.privateKey,
      dataToSign
    );

    const encodedSignature = Base64.fromUint8Array(new Uint8Array(signature), true);
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }
}
