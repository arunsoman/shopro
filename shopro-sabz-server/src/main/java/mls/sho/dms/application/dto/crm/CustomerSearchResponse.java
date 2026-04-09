package mls.sho.dms.application.dto.crm;

import java.util.UUID;

public record CustomerSearchResponse(
    UUID id,
    String firstName,
    String lastName,
    String phoneNumber,
    String email,
    String tierName
) {}
