package mls.sho.dms.application.dto.crm;

import mls.sho.dms.entity.crm.DiscountType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PromoCodeResponse(
        UUID id,
        String code,
        String description,
        DiscountType discountType,
        BigDecimal discountValue,
        Integer maxUses,
        int currentUses,
        OffsetDateTime validFrom,
        OffsetDateTime validUntil,
        boolean isActive,
        UUID segmentId
) {}
