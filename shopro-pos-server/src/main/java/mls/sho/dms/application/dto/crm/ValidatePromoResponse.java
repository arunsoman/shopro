package mls.sho.dms.application.dto.crm;

import mls.sho.dms.entity.crm.DiscountType;

import java.math.BigDecimal;

public record ValidatePromoResponse(
        boolean isValid,
        String message,
        DiscountType discountType,
        BigDecimal discountValue
) {}
