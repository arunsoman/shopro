package mls.sho.dms.application.dto.inventory;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import mls.sho.dms.entity.inventory.vendor.SupplierRole;

public record InviteSupplierUserRequest(
    @NotBlank String fullName,
    @NotBlank @Email String email,
    String phoneNumber,
    SupplierRole role
) {}
