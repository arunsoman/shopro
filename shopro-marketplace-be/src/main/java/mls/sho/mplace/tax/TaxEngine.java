package mls.sho.mplace.tax;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Placeholder for the actual Tax Engine logic.
 */
@Service
public class TaxEngine {

    public TaxResult calculateOnCommission(BigDecimal commission, String countryIsoCode, UUID venueId) {
        // Simple 16% VAT default if country is KE, etc.
        BigDecimal vatRate = "KE".equalsIgnoreCase(countryIsoCode) ? new BigDecimal("0.16") : BigDecimal.ZERO;
        
        return TaxResult.builder()
                .outputVat(commission.multiply(vatRate))
                .whtAmount(BigDecimal.ZERO)
                .primaryRuleCode(countryIsoCode + "_VAT_" + vatRate.multiply(new BigDecimal("100")).intValue())
                .build();
    }
}
