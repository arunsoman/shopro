package mls.sho.dms.application.dto.finance;

import java.math.BigDecimal;
import java.util.UUID;

public record AccountResponse(
    UUID id,
    String code,
    String name,
    String accountType,
    String description,
    BigDecimal balance
) {}
