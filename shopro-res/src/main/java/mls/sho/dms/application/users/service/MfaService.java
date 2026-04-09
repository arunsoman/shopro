package mls.sho.dms.application.users.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.users.dto.AuthDtos.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@Slf4j
public class MfaService {
    
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();
    
    @Value("${mfa.encryption.key}")
    private String encryptionKey;
    
    /**
     * Generate new MFA secret for setup
     */
    public MfaSetupResult generateSecret(String username, String issuer) {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        
        String secret = key.getKey();
        String qrUrl = GoogleAuthenticatorQRGenerator.getOtpAuthURL(
            issuer, 
            username, 
            key
        );
        
        return MfaSetupResult.builder()
            .secret(encryptSecret(secret))  // Store encrypted
            .qrCodeUrl(qrUrl)
            .backupCodes(generateBackupCodes())
            .build();
    }
    
    /**
     * Verify TOTP code during login
     */
    public boolean verifyCode(String encryptedSecret, String code) {
        try {
            String secret = decryptSecret(encryptedSecret);
            return gAuth.authorize(secret, Integer.parseInt(code));
        } catch (Exception e) {
            log.error("MFA verification failed", e);
            return false;
        }
    }
    
    /**
     * Verify code during setup (to confirm user has configured authenticator)
     */
    public boolean verifySetupCode(String plainSecret, String code) {
        return gAuth.authorize(plainSecret, Integer.parseInt(code));
    }
    
    // ==================== ENCRYPTION UTILITIES ====================
    
    private String encryptSecret(String secret) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            SecretKeySpec key = new SecretKeySpec(
                encryptionKey.getBytes(StandardCharsets.UTF_8), 
                "AES"
            );
            cipher.init(Cipher.ENCRYPT_MODE, key);
            return Base64.getEncoder().encodeToString(cipher.doFinal(secret.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt MFA secret", e);
        }
    }
    
    private String decryptSecret(String encrypted) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            SecretKeySpec key = new SecretKeySpec(
                encryptionKey.getBytes(StandardCharsets.UTF_8), 
                "AES"
            );
            cipher.init(Cipher.DECRYPT_MODE, key);
            return new String(cipher.doFinal(Base64.getDecoder().decode(encrypted)));
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt MFA secret", e);
        }
    }
    
    private List<String> generateBackupCodes() {
        // Generate 10 single-use backup codes
        List<String> codes = new ArrayList<>();
        SecureRandom random = new SecureRandom();
        
        for (int i = 0; i < 10; i++) {
            byte[] bytes = new byte[4];
            random.nextBytes(bytes);
            String code = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(bytes)
                .toUpperCase()
                .substring(0, 8);
            codes.add(code);
        }
        
        return codes;
    }
}