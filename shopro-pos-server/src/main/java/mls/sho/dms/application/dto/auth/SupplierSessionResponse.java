package mls.sho.dms.application.dto.auth;

import java.util.UUID;

public record SupplierSessionResponse(
    UUID userId,
    UUID supplierId,
    String supplierName,
    String fullName,
    String role
) {}
