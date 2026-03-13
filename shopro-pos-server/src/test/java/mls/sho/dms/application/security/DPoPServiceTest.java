package mls.sho.dms.application.security;

import com.fasterxml.jackson.databind.ObjectMapper;
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

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private String generateProof(String method, String url, Map<String, Object> jwk, long iat) throws Exception {
        Map<String, Object> header = new HashMap<>();
        header.put("typ", "dpop+jwt");
        header.put("alg", "RS256");
        header.put("jwk", jwk);
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("htm", method);
        payload.put("htu", url);
        payload.put("iat", iat);
        payload.put("jti", UUID.randomUUID().toString());
        
        String h = Base64.getUrlEncoder().withoutPadding().encodeToString(mapper.writeValueAsBytes(header));
        String p = Base64.getUrlEncoder().withoutPadding().encodeToString(mapper.writeValueAsBytes(payload));
        return h + "." + p + ".dummy-signature";
    }

    @Test
    void shouldFailOnNullHeader() {
        assertNull(dpopService.validateProof(null, mock(HttpServletRequest.class), "any"));
    }

    @Test
    void shouldValidateCorrectProof() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURL()).thenReturn(new StringBuffer("https://api.shopro.com/api/v1/payments"));

        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "RSA");
        jwk.put("n", "rXy...testing");
        jwk.put("e", "AQAB");

        String proof = generateProof("POST", "https://api.shopro.com/api/v1/payments", jwk, System.currentTimeMillis() / 1000);
        String actualJkt = dpopService.calculateJkt(jwk);
        
        assertNotNull(dpopService.validateProof(proof, request, actualJkt));
    }

    @Test
    void shouldFailOnMethodMismatch() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURL()).thenReturn(new StringBuffer("https://api.shopro.com/api/v1/payments"));

        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "RSA");
        jwk.put("n", "rXy...testing");
        jwk.put("e", "AQAB");

        String proof = generateProof("POST", "https://api.shopro.com/api/v1/payments", jwk, System.currentTimeMillis() / 1000);
        
        assertNull(dpopService.validateProof(proof, request, dpopService.calculateJkt(jwk)));
    }

    @Test
    void shouldFailOnExpiredProof() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURL()).thenReturn(new StringBuffer("https://api.shopro.com/api/v1/payments"));

        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "RSA");
        jwk.put("n", "rXy...testing");
        jwk.put("e", "AQAB");

        // 5 minutes ago
        String proof = generateProof("POST", "https://api.shopro.com/api/v1/payments", jwk, (System.currentTimeMillis() / 1000) - 300);
        
        assertNull(dpopService.validateProof(proof, request, dpopService.calculateJkt(jwk)));
    }
}
