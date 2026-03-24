package mls.sho.mplace.accounting.aop;

/**
 * Enum for all business events that trigger financial journal entries.
 */
public enum AccountingEventType {

    // Restaurant → You
    PO_RECEIVED,            // Restaurant PO accepted: raise AR + pass-through liability
    INVOICE_SENT,           // You invoice restaurant: recognise commission revenue + output VAT
    PAYMENT_RECEIVED,       // Restaurant pays: clear AR, split to supplier payable + your cash

    // You → Supplier
    SUPPLIER_PO_RAISED,     // You raise PO to supplier: no accounting entry yet (commitment only)
    SUPPLIER_INVOICE_BOOKED,// Supplier invoices you: post AP + input VAT
    SUPPLIER_PAID,          // You pay supplier: clear AP, reduce cash

    // Tax events
    VAT_RETURN_FILED,       // Monthly: net output−input, remit or claim refund
    WHT_DEDUCTED,           // Restaurant deducts WHT from your commission payment
    WHT_CERTIFICATE_RECEIVED,// WHT cert received: post as tax credit receivable
    WHT_REMITTED_TO_SUPPLIER,// You deduct WHT from supplier, remit to authority

    // Commission
    COMMISSION_EARNED,      // Explicit recognition event (used when PO lifecycle completes)
    BAD_DEBT_PROVISIONED,   // Restaurant AR overdue: raise bad debt provision
}
