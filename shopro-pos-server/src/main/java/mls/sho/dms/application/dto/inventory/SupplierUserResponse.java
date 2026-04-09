package mls.sho.dms.application.dto.inventory;

import mls.sho.dms.entity.inventory.vendor.SupplierRole;

import java.util.UUID;

public record SupplierUserResponse(
    UUID id,
    UUID supplierId,
    String fullName,
    String email,
    String phoneNumber,
    SupplierRole role,
    boolean active
) {}
