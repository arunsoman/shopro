package mls.sho.dms.dto.tableside;

import java.util.UUID;

public record TablesideSessionDto(
    UUID id,
    UUID tableId,
    UUID qrToken,
    String status
) {}
