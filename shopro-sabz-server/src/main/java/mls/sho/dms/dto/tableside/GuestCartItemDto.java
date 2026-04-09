package mls.sho.dms.dto.tableside;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record GuestCartItemDto(
    UUID id,
    UUID sessionId,
    String deviceFingerprint,
    UUID menuItemId,
    int quantity,
    List<Map<String, Object>> modifiers,
    String customNote
) {}
