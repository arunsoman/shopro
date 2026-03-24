package mls.sho.mplace.accounting.aop;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Enriched context passed to the AccountingEngine for journal generation.
 */
@Data @Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountingEventContext {
    private AccountingEventType eventType;
    private String              countryIsoCode;
    private UUID                venueId;
    private UUID                entityId;        // PO id, invoice id, payment id, etc.
    private String              entityType;      // "PurchaseOrder", "SupplierInvoice", etc.
    private String              entityReference; // human-readable ref number
    private BigDecimal          grossAmount;     // total value incl. pass-through
    private BigDecimal          commissionAmount;// your 14% cut
    private BigDecimal          supplierCost;    // gross − commission
    private BigDecimal          taxAmount;       // VAT / WHT computed by TaxEngine
    private BigDecimal          whtAmount;       // withholding tax specifically
    private String              taxCode;         // e.g. "KE_VAT_16", "NG_VAT_7_5"
    private UUID                counterpartyId;  // restaurant or supplier id
    private String              counterpartyType;// "RESTAURANT" | "SUPPLIER"
    private Instant             eventTime;
    private String              initiatedBy;     // user login
}
