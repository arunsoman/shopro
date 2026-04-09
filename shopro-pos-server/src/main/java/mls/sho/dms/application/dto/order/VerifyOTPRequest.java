package mls.sho.dms.application.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Request DTO for OTP verification by staff.
 */
public record VerifyOTPRequest(
    @NotBlank
    @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be 6 digits")
    String otp,
    
    @NotBlank
    String staffId,
    
    String terminalId
) {}
