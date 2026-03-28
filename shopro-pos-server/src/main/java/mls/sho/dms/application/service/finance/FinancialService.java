package mls.sho.dms.application.service.finance;

import mls.sho.dms.application.dto.finance.AccountResponse;
import mls.sho.dms.application.dto.finance.JournalEntryResponse;
import mls.sho.dms.application.dto.finance.PnLResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface FinancialService {
    
    /** Post a manual or automated journal entry. */
    JournalEntryResponse postEntry(Instant date, String description, UUID referenceId, List<LineRequest> lines);

    /** Simplified posting for common events (Sale, Purchase). */
    void recordSale(UUID orderId, BigDecimal amount, BigDecimal tax);
    void recordPurchase(UUID poId, BigDecimal amount, BigDecimal tax);
    void recordCOGS(UUID orderId, BigDecimal cost);

    /** Reporting. */
    List<AccountResponse> getAllAccounts();
    List<JournalEntryResponse> getLedger(Instant from, Instant to);
    PnLResponse getPnL(Instant from, Instant to);

    record LineRequest(String accountCode, BigDecimal debit, BigDecimal credit) {}
}
