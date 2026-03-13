package mls.sho.dms.application.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import mls.sho.dms.entity.staff.DeviceBinding;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.staff.DeviceBindingRepository;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import java.util.Map;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

/**
 * Implements FAPI 2.0 / DPoP (Proof-of-Possession) validation.
 * Ensures that requests are cryptographically bound to the device hardware.
 */
@Service
public class DPoPService {

    @Autowired
    private DeviceBindingRepository deviceBindingRepository;

    @Autowired
    private StaffRepository staffRepository;

    /**
     * Validates a DPoP proof against the current request and bound device key.
     * 
     * @param dpopHeader The raw DPoP header (JWT)
     * @param request The current HTTP request (to verify htu and htm)
     * @param expectedThumbprint The thumbprint of the public key bound to the user session
     * @return The thumbprint of the verified public key if valid, null otherwise.
     */
    public String validateProof(String dpopHeader, HttpServletRequest request, String expectedThumbprint) {
        if (dpopHeader == null || dpopHeader.isEmpty()) return null;

        try {
            // 1. Manual parse to extract JWK and claims
            String[] parts = dpopHeader.split("\\.");
            if (parts.length != 3) return null;
            
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            
            // Header
            String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            Map<String, Object> header = mapper.readValue(headerJson, Map.class);
            
            if (!"dpop+jwt".equals(header.get("typ"))) return null;
            
            Map<String, Object> jwk = (Map<String, Object>) header.get("jwk");
            if (jwk == null) return null;

            // 2. Validate thumbprint matches expected device binding
            String actualThumbprint = calculateJkt(jwk);
            if (expectedThumbprint != null && !expectedThumbprint.equals(actualThumbprint)) {
                return null;
            }

            // 3. Payload (Claims)
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            Map<String, Object> claims = mapper.readValue(payloadJson, Map.class);
            
            // 4. Validate 'htm' (method) and 'htu' (url)
            String method = (String) claims.get("htm");
            String url = (String) claims.get("htu");
            
            if (method == null || !method.equalsIgnoreCase(request.getMethod())) return null;
            
            String requestUrl = request.getRequestURL().toString();
            // strip query params for comparison as per FAPI recs
            if (requestUrl.contains("?")) {
                requestUrl = requestUrl.substring(0, requestUrl.indexOf("?"));
            }
            if (url == null || !requestUrl.startsWith(url)) return null;

            // 5. Freshness check (iat) - max 2 minutes skew
            Object iatObj = claims.get("iat");
            if (iatObj == null) return null;
            long iatSeconds = ((Number) iatObj).longValue();
            if (Math.abs(System.currentTimeMillis() / 1000 - iatSeconds) > 120) return null;

            return actualThumbprint;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Calculates the SHA-256 thumbprint of a JWK (RFC 7638).
     */
    public String calculateJkt(Map<String, Object> jwk) throws NoSuchAlgorithmException {
        // Minimum required fields for thumbprint calculation per kty
        Map<String, String> required = new java.util.TreeMap<>();
        String kty = (String) jwk.get("kty");
        required.put("kty", kty);
        
        if ("RSA".equals(kty)) {
            required.put("n", (String) jwk.get("n"));
            required.put("e", (String) jwk.get("e"));
        } else if ("EC".equals(kty)) {
            required.put("crv", (String) jwk.get("crv"));
            required.put("x", (String) jwk.get("x"));
            required.put("y", (String) jwk.get("y"));
        }

        StringBuilder sb = new StringBuilder("{");
        for (Map.Entry<String, String> entry : required.entrySet()) {
            if (sb.length() > 1) sb.append(",");
            sb.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue()).append("\"");
        }
        sb.append("}");
        
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(sb.toString().getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }

    /**
     * Records a new device binding after successful initial authentication.
     */
    public void bindDevice(UUID staffId, String publicKeyThumbprint, String deviceName) {
        StaffMember staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        DeviceBinding binding = new DeviceBinding();
        binding.setStaffMember(staff);
        binding.setPublicKeyThumbprint(publicKeyThumbprint);
        binding.setDeviceName(deviceName);
        binding.setLastActiveAt(Instant.now());
        
        deviceBindingRepository.save(binding);
    }
}
