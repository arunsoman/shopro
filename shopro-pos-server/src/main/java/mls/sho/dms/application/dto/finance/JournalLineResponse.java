package mls.sho.dms.application.dto.finance;

import java.math.BigDecimal;
import java.util.UUID;

public record JournalLineResponse(
    UUID id,
    UUID accountId,
    String accountName,
    String accountCode,
    BigDecimal debitAmount,
    BigDecimal creditAmount
) {}
