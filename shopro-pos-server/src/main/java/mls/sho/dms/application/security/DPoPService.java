package mls.sho.dms.application.security;

import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.ECDSAVerifier;
import com.nimbusds.jose.crypto.Ed25519Verifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.OctetKeyPair;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.HttpServletRequest;
import mls.sho.dms.entity.staff.DeviceBinding;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.staff.DeviceBindingRepository;
import mls.sho.dms.repository.staff.StaffRepository;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.security.Security;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.Map;

@Service
public class DPoPService {
 
    static {
        if (java.security.Security.getProvider(org.bouncycastle.jce.provider.BouncyCastleProvider.PROVIDER_NAME) == null) {
            java.security.Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
        }
    }
 
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

            Map<String, Object> jwkMap = header.getJWK().toJSONObject();
            com.nimbusds.jose.jwk.JWK jwk = com.nimbusds.jose.jwk.JWK.parse(jwkMap);
            String actualThumbprint = jwk.computeThumbprint().toString();

            // 3. Signature verification (using NimbusDS specialized verifiers)
            JWSVerifier verifier;
            try {
                if (jwk instanceof com.nimbusds.jose.jwk.RSAKey) {
                    verifier = new com.nimbusds.jose.crypto.RSASSAVerifier((com.nimbusds.jose.jwk.RSAKey) jwk);
                } else if (jwk instanceof com.nimbusds.jose.jwk.ECKey) {
                    verifier = new com.nimbusds.jose.crypto.ECDSAVerifier((com.nimbusds.jose.jwk.ECKey) jwk);
                } else if (jwk instanceof com.nimbusds.jose.jwk.OctetKeyPair) {
                    verifier = new com.nimbusds.jose.crypto.Ed25519Verifier((com.nimbusds.jose.jwk.OctetKeyPair) jwk);
                } else {
                    return ValidationResult.failure("invalid_alg", "Unsupported DPoP key type: " + jwk.getKeyType());
                }
                
                // Explicitly use BouncyCastle if registered (fixes SUN EdDSA "y value is too large" bug)
                java.security.Provider bc = java.security.Security.getProvider(org.bouncycastle.jce.provider.BouncyCastleProvider.PROVIDER_NAME);
                if (bc != null) {
                    verifier.getJCAContext().setProvider(bc);
                }
                
                if (!signedJWT.verify(verifier)) {
                    return ValidationResult.failure("invalid_proof", "DPoP signature verification failed");
                }
            } catch (Exception e) {
                log.warn("DPoP signature verification exception: {}", e.getMessage(), e);
                return ValidationResult.failure("invalid_proof", "Error verifying DPoP signature: " + e.getMessage());
            }

            // 2. Validate thumbprint matches expected device binding (if provided)
            if (expectedThumbprint != null && !expectedThumbprint.equals(actualThumbprint)) {
                log.warn("DPoP jkt mismatch: expected {}, got {}", expectedThumbprint, actualThumbprint);
                return ValidationResult.failure("jkt_mismatch", "DPoP key thumbprint mismatch.");
            }

            // 3. Validate 'htm' (method) and 'htu' (url)
            String method = claims.getStringClaim("htm");
            String url = claims.getStringClaim("htu");
 
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
            java.util.Date iat = claims.getIssueTime();
            if (iat == null) {
                log.warn("DPoP iat missing");
                return ValidationResult.failure("iat_missing", "DPoP iat claim is missing.");
            }
            
            long iatSeconds = iat.getTime() / 1000;
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
     * Calculates the SHA-256 thumbprint (JKT) of a JWK for DPoP verification.
     */
    public String calculateJkt(Map<String, Object> jwkMap) {
        try {
            com.nimbusds.jose.jwk.JWK jwk = com.nimbusds.jose.jwk.JWK.parse(jwkMap);
            return jwk.computeThumbprint().toString();
        } catch (Exception e) {
            log.error("Failed to calculate JWK thumbprint: {}", e.getMessage());
            throw new RuntimeException("Thumbprint calculation failed", e);
        }
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
