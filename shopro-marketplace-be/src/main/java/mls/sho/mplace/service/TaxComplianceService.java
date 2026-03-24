package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Service dedicated to handling tax reporting and compliance events
 * that spawn automated journal entries via the Accounting Engine.
 */
@Service
@RequiredArgsConstructor
public class TaxComplianceService {

    /**
     * Triggered when filing monthly VAT returned.
     */
    @Transactional
    @mls.sho.mplace.accounting.aop.AccountingEvent(
        type = mls.sho.mplace.accounting.aop.AccountingEventType.VAT_RETURN_FILED,
        amountExpression = "#netVatRemitted",
        countryExpression = "#countryIsoCode"
    )
    public Object fileMonthlyVatReturn(String countryIsoCode, int year, int month, BigDecimal netVatRemitted, BigDecimal grossAmount) {
        // TODO: Implement logic to mark VAT returns as filed in the database
        // E.g., save a TaxFilingRecord entity
        // 1. Return the saved record so the aspect can read #result properties
        return new Object();
    }

    /**
     * Triggered when a restaurant provides proof they deducted Withholding Tax (WHT).
     */
    @Transactional
    @mls.sho.mplace.accounting.aop.AccountingEvent(
        type = mls.sho.mplace.accounting.aop.AccountingEventType.WHT_CERTIFICATE_RECEIVED,
        amountExpression = "#whtAmount"
    )
    public Object recordWhtCertificate(UUID restaurantId, String certificateNumber, BigDecimal whtAmount) {
        // TODO: Save the WHT certificate details to the DB
        // 1. Validate certificate
        // 2. Save WhtCertificate entity
        // 3. Return the saved record for the aspect
        return new Object();
    }

    /**
     * Triggered when you remit Withholding Tax (deducted from suppliers) to the tax authority.
     */
    @Transactional
    @mls.sho.mplace.accounting.aop.AccountingEvent(
        type = mls.sho.mplace.accounting.aop.AccountingEventType.WHT_REMITTED_TO_SUPPLIER,
        amountExpression = "#whtAmount"
    )
    public Object remitSupplierWht(UUID supplierId, BigDecimal whtAmount) {
        // TODO: Record that WHT withheld from a supplier has been paid to the tax authority
        return new Object();
    }
}
