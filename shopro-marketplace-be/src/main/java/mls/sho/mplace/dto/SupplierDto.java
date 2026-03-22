package mls.sho.mplace.dto;

import java.util.UUID;

public record SupplierDto(
    UUID id,
    String email,
    String fullName,
    String supplierName,
    String verificationStatus
) {}
