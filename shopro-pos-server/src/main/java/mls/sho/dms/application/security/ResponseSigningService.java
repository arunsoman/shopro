package mls.sho.dms.application.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.KeyPair;
import java.security.PublicKey;
import java.util.Date;
import java.util.Map;

/**
 * Provides JWS (JSON Web Signature) for sensitive financial responses.
 * Follows FAPI 2.0 recommendations for message integrity and non-repudiation.
 */
@Service
public class ResponseSigningService {

    private KeyPair keyPair;

    @PostConstruct
    public void init() {
        // In a production environment, keys should be loaded from a secure HSM or KeyStore.
        // For the MVP and development, we generate a persistent-per-session key pair.
        this.keyPair = Keys.keyPairFor(SignatureAlgorithm.PS256);
    }

    /**
     * Signs a payload (typically a financial DTO) and returns a JWS string using asymmetric PS256.
     */
    public String signResponse(Map<String, Object> payload) {
        return Jwts.builder()
                .setClaims(payload)
                .setIssuedAt(new Date())
                .signWith(keyPair.getPrivate(), SignatureAlgorithm.PS256)
                .compact();
    }

    /**
     * Returns the public key for verification.
     * In a full FAPI implementation, this would be exposed via a JWKS endpoint.
     */
    public PublicKey getPublicKey() {
        return keyPair.getPublic();
    }
}
