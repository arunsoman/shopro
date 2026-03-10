package mls.sho.dms.application.dto.crm;

import java.math.BigDecimal;

public record RedeemPointsResponse(
    boolean success,
    int pointsRedeemed,
    BigDecimal redemptionValue,
    int remainingBalance
) {}
