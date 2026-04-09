package mls.sho.dms.application.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.http.HttpServletRequest;
import mls.sho.dms.repository.staff.DeviceBindingRepository;
import mls.sho.dms.repository.staff.StaffRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DPoPServiceTest {

    @Mock
    private DeviceBindingRepository deviceBindingRepository;

    @Mock
    private StaffRepository staffRepository;

    @InjectMocks
    private DPoPService dpopService;

    private ObjectMapper mapper = new ObjectMapper();

    private java.security.KeyPair keyPair;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        java.security.KeyPairGenerator keyGen = java.security.KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        keyPair = keyGen.generateKeyPair();
    }

    private String generateProof(String method, String url, Map<String, Object> jwk, long iat) throws Exception {
        return Jwts.builder()
                .header()
                .type("dpop+jwt")
                .add("jwk", jwk)
                .and()
                .claim("htm", method)
                .claim("htu", url)
                .claim("iat", new java.util.Date(iat * 1000))
                .claim("jti", UUID.randomUUID().toString())
                .signWith(keyPair.getPrivate(), Jwts.SIG.RS256)
                .compact();
    }

    private String base64UrlEncodeUnsigned(java.math.BigInteger value) {
        byte[] array = value.toByteArray();
        if (array[0] == 0) {
            byte[] tmp = new byte[array.length - 1];
            System.arraycopy(array, 1, tmp, 0, tmp.length);
            array = tmp;
        }
        return Base64.getUrlEncoder().withoutPadding().encodeToString(array);
    }

    @Test
    void shouldValidateCorrectProof() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURL()).thenReturn(new StringBuffer("https://api.shopro.com/api/v1/payments"));
        when(request.getRequestURI()).thenReturn("/api/v1/payments");

        java.security.interfaces.RSAPublicKey publicKey = (java.security.interfaces.RSAPublicKey) keyPair.getPublic();
        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "RSA");
        jwk.put("n", base64UrlEncodeUnsigned(publicKey.getModulus()));
        jwk.put("e", base64UrlEncodeUnsigned(publicKey.getPublicExponent()));

        String proof = generateProof("POST", "https://api.shopro.com/api/v1/payments", jwk, System.currentTimeMillis() / 1000);
        String actualJkt = dpopService.calculateJkt(jwk);
        
        DPoPService.ValidationResult result = dpopService.validateProof(proof, request, actualJkt);
        if (!result.isValid()) {
            System.err.println("Validation failed in test: " + result.error() + " - " + result.message());
        }
        assertTrue(result.isValid(), "Validation should be valid: " + result.message());
    }

    @Test
    void shouldFailOnMethodMismatch() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURL()).thenReturn(new StringBuffer("https://api.shopro.com/api/v1/payments"));
        when(request.getRequestURI()).thenReturn("/api/v1/payments");

        java.security.interfaces.RSAPublicKey publicKey = (java.security.interfaces.RSAPublicKey) keyPair.getPublic();
        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "RSA");
        jwk.put("n", base64UrlEncodeUnsigned(publicKey.getModulus()));
        jwk.put("e", base64UrlEncodeUnsigned(publicKey.getPublicExponent()));

        String proof = generateProof("POST", "https://api.shopro.com/api/v1/payments", jwk, System.currentTimeMillis() / 1000);
        
        assertFalse(dpopService.validateProof(proof, request, dpopService.calculateJkt(jwk)).isValid());
    }

    @Test
    void shouldFailOnExpiredProof() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURL()).thenReturn(new StringBuffer("https://api.shopro.com/api/v1/payments"));
        when(request.getRequestURI()).thenReturn("/api/v1/payments");

        java.security.interfaces.RSAPublicKey publicKey = (java.security.interfaces.RSAPublicKey) keyPair.getPublic();
        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "RSA");
        jwk.put("n", base64UrlEncodeUnsigned(publicKey.getModulus()));
        jwk.put("e", base64UrlEncodeUnsigned(publicKey.getPublicExponent()));

        // 5 minutes ago
        String proof = generateProof("POST", "https://api.shopro.com/api/v1/payments", jwk, (System.currentTimeMillis() / 1000) - 300);
        
        assertFalse(dpopService.validateProof(proof, request, dpopService.calculateJkt(jwk)).isValid());
    }
}
