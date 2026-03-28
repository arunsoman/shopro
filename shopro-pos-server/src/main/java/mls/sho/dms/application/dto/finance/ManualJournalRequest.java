package mls.sho.dms.application.dto.finance;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ManualJournalRequest(
    String description,
    Instant entryDate,
    List<JournalLineRequest> lines
) {
    public record JournalLineRequest(
        String accountCode,
        BigDecimal debit,
        BigDecimal credit
    ) {}
}
