package mls.sho.dms.application.dto.floor;

import java.util.UUID;

public record SectionResponse(
    UUID id,
    String name,
    int tableCount
) {}
