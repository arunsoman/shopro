package mls.sho.dms.application.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.security.PublicKey;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ResponseSigningServiceTest {

    private ResponseSigningService service;

    @BeforeEach
    void setUp() {
        service = new ResponseSigningService();
        service.init();
    }

    @Test
    void shouldGenerateVerifiableSignature() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", "12345");
        payload.put("amount", 150.50);
        payload.put("currency", "USD");

        String jwsToken = service.signResponse(payload);
        assertNotNull(jwsToken);

        PublicKey publicKey = service.getPublicKey();
        assertNotNull(publicKey);

        // Verify the signature using the public key
        Jws<Claims> claimsJws = Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(jwsToken);

        assertEquals("12345", claimsJws.getPayload().get("orderId"));
        assertEquals(150.50, claimsJws.getPayload().get("amount"));
        assertEquals("USD", claimsJws.getPayload().get("currency"));
    }
}
