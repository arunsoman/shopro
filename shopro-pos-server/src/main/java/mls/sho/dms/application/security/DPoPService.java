package mls.sho.dms.application.security;

import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.HttpServletRequest;
import mls.sho.dms.entity.staff.DeviceBinding;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.staff.DeviceBindingRepository;
import mls.sho.dms.repository.staff.StaffRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.security.PublicKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Set;

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

    private static final Logger log = LoggerFactory.getLogger(DPoPService.class);

    @Autowired
    private DeviceBindingRepository deviceBindingRepository;

    @Autowired
    private StaffRepository staffRepository;

    public record ValidationResult(boolean isValid, String jkt, String error, String message) {
        public static ValidationResult success(String jkt) {
            return new ValidationResult(true, jkt, null, "Success");
        }
        public static ValidationResult failure(String error, String message) {
            return new ValidationResult(false, null, error, message);
        }
    }

    public ValidationResult validateProof(String dpopHeader, HttpServletRequest request, String expectedThumbprint) {
        if (dpopHeader == null || dpopHeader.isEmpty()) {
            log.warn("DPoP validation failed: Missing header");
            return ValidationResult.failure("missing_header", "DPoP header is required.");
        }

        try {
            SignedJWT signedJWT = SignedJWT.parse(dpopHeader);
            JWSHeader header = signedJWT.getHeader();
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            // Validate Algorithm
            String alg = header.getAlgorithm().getName();
            if (alg == null || !Set.of("EdDSA", "PS256", "RS256", "ES256").contains(alg)) { // Added ES256 for NimbusDS
                log.warn("DPoP invalid alg: {}", alg);
                return ValidationResult.failure("invalid_alg", "Unsupported DPoP algorithm: " + alg);
            }

            if (!"dpop+jwt".equals(header.getType().toString())) {
                log.warn("DPoP invalid typ: {}", header.getType());
                return ValidationResult.failure("invalid_typ", "Invalid DPoP JWT type: " + header.getType());
            }

            Map<String, Object> jwk = header.getJWK().toJSONObject();

            // 3. Signature verification (using NimbusDS for better EdDSA/EC support)
            JWSVerifier verifier;
            try {
                if ("RS256".equals(alg) || "PS256".equals(alg)) { // PS256 also uses RSA
                    RSAPublicKey rsaPublicKey = (RSAPublicKey) com.nimbusds.jose.jwk.JWK.parse(jwk).toRSAKey().toRSAPublicKey();
                    verifier = new com.nimbusds.jose.crypto.RSASSAVerifier(rsaPublicKey);
                } else if ("ES256".equals(alg)) {
                    ECPublicKey ecPublicKey = (ECPublicKey) com.nimbusds.jose.jwk.JWK.parse(jwk).toECKey().toECPublicKey();
                    verifier = new com.nimbusds.jose.crypto.ECDSAVerifier(ecPublicKey);
                } else if ("EdDSA".equals(alg)) {
                    // Correct way to reconstruct Ed25519 from JWK using NimbusDS
                    com.nimbusds.jose.jwk.OctetKeyPair okp = com.nimbusds.jose.jwk.OctetKeyPair.parse(jwk);
                    verifier = new com.nimbusds.jose.crypto.Ed25519Verifier(okp.toPublicJWK());
                } else {
                    return ValidationResult.failure("invalid_alg", "Unsupported DPoP algorithm: " + alg);
                }
                
                if (!signedJWT.verify(verifier)) {
                    return ValidationResult.failure("invalid_proof", "DPoP signature verification failed");
                }
            } catch (Exception e) {
                log.warn("DPoP validation exception: {}", e.getMessage(), e);
                return ValidationResult.failure("invalid_proof", "Error reconstructing public key: " + e.getMessage());
            }

            String actualThumbprint = calculateJkt(jwk);

            // 2. Validate thumbprint matches expected device binding (if provided)
            if (expectedThumbprint != null && !expectedThumbprint.equals(actualThumbprint)) {
                log.warn("DPoP jkt mismatch: expected {}, got {}", expectedThumbprint, actualThumbprint);
                return ValidationResult.failure("jkt_mismatch", "DPoP key thumbprint does not match the active session binding.");
            }

            // 3. Validate 'htm' (method) and 'htu' (url)
            String method = claims.get("htm", String.class);
            String url = claims.get("htu", String.class);

            if (method == null || !method.equalsIgnoreCase(request.getMethod())) {
                log.warn("DPoP htm mismatch: expected {}, got {}", request.getMethod(), method);
                return ValidationResult.failure("htm_mismatch", "DPoP method mismatch: expected " + request.getMethod() + ", got " + method);
            }

            String requestUrl = request.getRequestURL().toString();
            String requestPath = request.getRequestURI();
            
            boolean urlMatch = false;
            if (url != null) {
                if (url.equals(requestUrl) || url.equals(requestPath)) {
                    urlMatch = true;
                } else if (url.startsWith("http")) {
                    try {
                        java.net.URI htuUri = new java.net.URI(url);
                        String htuPath = htuUri.getPath();
                        if (htuPath != null && htuPath.equals(requestPath)) {
                            urlMatch = true;
                        }
                    } catch (java.net.URISyntaxException e) {
                        log.warn("Invalid htu URL format: {}", url);
                    }
                } else if (url.startsWith("/") && requestPath.equals(url)) {
                    urlMatch = true;
                }
            }
            
            if (!urlMatch) {
                log.warn("DPoP htu mismatch: requestUrl={}, requestPath={}, htu={}", requestUrl, requestPath, url);
                return ValidationResult.failure("htu_mismatch", "DPoP URL mismatch. Expected: " + requestPath);
            }

            // 4. Freshness check (iat)
            long iatSeconds = claims.getIssuedAt().getTime() / 1000;
            if (Math.abs(System.currentTimeMillis() / 1000 - iatSeconds) > 120) {
                log.warn("DPoP iat skew too high: skew={}s", Math.abs(System.currentTimeMillis() / 1000 - iatSeconds));
                return ValidationResult.failure("iat_skew", "DPoP time skew too high. Please ensure your device clock is synchronized.");
            }

            return ValidationResult.success(actualThumbprint);
        } catch (Exception e) {
            log.warn("DPoP validation exception: {}", e.getMessage());
            return ValidationResult.failure("invalid_proof", "Failed to validate DPoP proof: " + e.getMessage());
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
        } else if ("OKP".equals(kty)) {
            required.put("crv", (String) jwk.get("crv"));
            required.put("x", (String) jwk.get("x"));
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
