package mls.sho.dms.application.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SupplierLoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}
