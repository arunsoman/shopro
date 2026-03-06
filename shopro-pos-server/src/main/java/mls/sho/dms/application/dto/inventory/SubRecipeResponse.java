package mls.sho.dms.application.dto.inventory;

import java.math.BigDecimal;
import java.util.UUID;

public record SubRecipeResponse(
    UUID id,
    String name,
    BigDecimal yieldQuantity,
    String unitOfMeasure,
    BigDecimal costPerUnit
) {}
