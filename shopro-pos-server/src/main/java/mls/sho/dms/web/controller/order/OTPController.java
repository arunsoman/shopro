package mls.sho.dms.web.controller.order;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.order.OTPResponse;
import mls.sho.dms.application.dto.order.VerifyOTPRequest;
import mls.sho.dms.application.service.order.OTPService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders/{id:[0-9a-fA-F-]{36}}/otp")
@RequiredArgsConstructor
@Tag(name = "Order OTP Management", description = "Endpoints for generating and verifying Order OTPs")
@Slf4j
public class OTPController {

    private final OTPService otpService;

    @GetMapping("/status")
    public OTPResponse getOTPStatus(@PathVariable UUID id) {
        log.debug("Fetching OTP status for order: {}", id);
        return otpService.getOTPStatus(id);
    }

    @PostMapping("/resend")
    @ResponseStatus(HttpStatus.OK)
    public String resendOTP(@PathVariable UUID id) {
        log.info("Received OTP resend request for order: {}", id);
        // Returns the plain OTP for development/testing visibility 
        // In production, this would only return OK and send via SMS/Email
        return otpService.resendOTP(id);
    }

    @PostMapping(value = "/verify", consumes = MediaType.APPLICATION_JSON_VALUE)
    public boolean verifyOTP(
        @PathVariable UUID id,
        @Valid @RequestBody VerifyOTPRequest request
    ) {
        log.info("Received OTP verification request for order: {} by staff: {}", id, request.staffId());
        return otpService.verifyOTP(id, request.otp(), request.staffId(), request.terminalId());
    }
}
