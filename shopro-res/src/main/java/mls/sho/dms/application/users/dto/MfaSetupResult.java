package mls.sho.dms.application.users.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MfaSetupResult {
    private String secret;        // Encrypted secret to store in DB
    private String qrCodeUrl;     // URL for QR code generation
    private List<String> backupCodes;  // Single-use backup codes
}