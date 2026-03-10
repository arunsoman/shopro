package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import mls.sho.dms.entity.crm.DiscountType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CreatePromoCodeRequest(
        @NotBlank(message = "Promo code is required")
        String code,
        String description,
        @NotNull(message = "Discount type is required")
        DiscountType discountType,
        @NotNull(message = "Discount value is required")
        @Positive(message = "Discount value must be positive")
        BigDecimal discountValue,
        Integer maxUses,
        OffsetDateTime validFrom,
        OffsetDateTime validUntil,
        UUID segmentId
) {}
