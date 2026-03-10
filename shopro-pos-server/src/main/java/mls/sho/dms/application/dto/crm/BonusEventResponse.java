package mls.sho.dms.application.dto.crm;

import mls.sho.dms.entity.crm.BonusPointEventScope;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BonusEventResponse(
    UUID id,
    String name,
    BigDecimal multiplier,
    BonusPointEventScope scope,
    UUID scopeReferenceId,
    Instant startsAt,
    Instant endsAt,
    boolean isActive
) {}
