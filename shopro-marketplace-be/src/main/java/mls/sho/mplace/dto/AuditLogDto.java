package mls.sho.mplace.dto;

import java.util.UUID;

public record AuditLogDto(
    UUID id,
    String action,
    String user,
    String target,
    String severity,
    String time
) {}
