package mls.sho.dms.application.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

/**
 * Provides JWS (JSON Web Signature) for sensitive financial responses.
 * Follows FAPI 2.0 recommendations for message integrity.
 */
@Service
public class ResponseSigningService {

    @Value("${shopro.security.signing-secret:temporary-secret-key-at-least-256-bits-long}")
    private String signingSecret;

    /**
     * signs a payload (typically a financial DTO) and returns a JWS string.
     */
    public String signResponse(Map<String, Object> payload) {
        byte[] apiKeySecretBytes = Base64.getDecoder().decode(Base64.getEncoder().encodeToString(signingSecret.getBytes()));
        Key signingKey = new SecretKeySpec(apiKeySecretBytes, SignatureAlgorithm.HS256.getJcaName());

        return Jwts.builder()
                .setClaims(payload)
                .setIssuedAt(new Date())
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }
}
