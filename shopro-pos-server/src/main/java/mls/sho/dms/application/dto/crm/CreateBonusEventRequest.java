package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import mls.sho.dms.entity.crm.BonusPointEventScope;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CreateBonusEventRequest(
    @NotBlank(message = "Event name is required")
    String name,

    @NotNull(message = "Multiplier is required")
    @DecimalMin(value = "1.0", message = "Multiplier must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Multiplier cannot exceed 5.0")
    BigDecimal multiplier,

    @NotNull(message = "Scope is required")
    BonusPointEventScope scope,

    UUID scopeReferenceId,

    @NotNull(message = "Start time is required")
    Instant startsAt,

    @NotNull(message = "End time is required")
    Instant endsAt
) {}
