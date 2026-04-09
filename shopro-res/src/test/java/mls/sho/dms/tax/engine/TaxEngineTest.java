package mls.sho.dms.tax.engine;

import mls.sho.dms.tax.dto.request.TaxCalculationRequest;
import mls.sho.dms.tax.dto.request.TaxLineItemRequest;
import mls.sho.dms.tax.dto.response.TaxCalculationResponse;
import mls.sho.dms.tax.entity.Country;
import mls.sho.dms.tax.entity.TaxRule;
import mls.sho.dms.tax.entity.VenueCountryAssignment;
import mls.sho.dms.tax.engine.exception.AlcoholProhibitedException;
import mls.sho.dms.tax.repository.TaxRuleRepository;
import mls.sho.dms.tax.repository.VenueCountryAssignmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaxEngineTest {

    @Mock
    private TaxRuleRepository ruleRepository;

    @Mock
    private VenueCountryAssignmentRepository venueCountryAssignmentRepository;

    @InjectMocks
    private TaxEngine taxEngine;

    private UUID venueId;
    private VenueCountryAssignment assignment;
    private Country uk;
    private Country india;
    private Country saudi;

    @BeforeEach
    void setUp() {
        venueId = UUID.randomUUID();
        assignment = new VenueCountryAssignment();
        assignment.setVenueId(venueId);

        uk = new Country();
        uk.setIsoCode("GB");
        uk.setTaxModel("VAT_INCLUSIVE");
        uk.setTaxIncluded(true);

        india = new Country();
        india.setIsoCode("IN");
        india.setTaxModel("GST");
        india.setTaxIncluded(false);

        saudi = new Country();
        saudi.setIsoCode("SA");
        saudi.setTaxModel("VAT");
        saudi.setTaxIncluded(false);
    }

    @Test
    void calculate_UK_HotColdTakeaway() {
        assignment.setCountry(uk);
        when(venueCountryAssignmentRepository.findByVenueIdAndActiveTrue(venueId))
                .thenReturn(Optional.of(assignment));

        TaxRule standardVat = new TaxRule();
        standardVat.setId(UUID.randomUUID());
        standardVat.setRuleCode("UK_VAT_STANDARD");
        standardVat.setRuleName("UK VAT Standard");
        standardVat.setDefaultRate(new BigDecimal("0.20"));
        standardVat.setAppliesToHot(true);
        standardVat.setAppliesToTakeaway(true);
        standardVat.setSortOrder(1);

        TaxRule zeroVat = new TaxRule();
        zeroVat.setId(UUID.randomUUID());
        zeroVat.setRuleCode("UK_VAT_ZERO");
        zeroVat.setRuleName("UK VAT Zero");
        zeroVat.setDefaultRate(BigDecimal.ZERO);
        zeroVat.setAppliesToCold(true);
        zeroVat.setAppliesToTakeaway(true);
        zeroVat.setSortOrder(2);

        List<Object[]> multipleRulesResult = new ArrayList<>();
        multipleRulesResult.add(new Object[]{standardVat, null});
        multipleRulesResult.add(new Object[]{zeroVat, null});
        when(ruleRepository.findActiveRulesWithOverridesForVenue(venueId))
                .thenReturn(multipleRulesResult);

        TaxCalculationRequest req = new TaxCalculationRequest(
                UUID.randomUUID(),
                "TAKEAWAY",
                null,
                List.of(
                        new TaxLineItemRequest(UUID.randomUUID(), new BigDecimal("12.00"), 1, "HOT", "FOOD"), // £12 incl 20% VAT = £10 + £2
                        new TaxLineItemRequest(UUID.randomUUID(), new BigDecimal("5.00"), 1, "COLD", "FOOD")  // £5 incl 0% VAT = £5 + £0
                )
        );

        TaxCalculationResponse res = taxEngine.calculate(req, venueId);

        assertEquals(0, new BigDecimal("15.00").compareTo(res.subtotal()), 
            "Expected net subtotal 15.00 but got " + res.subtotal());
        assertEquals(0, new BigDecimal("2.00").compareTo(res.totalTax()), 
            "Expected total tax 2.00 but got " + res.totalTax());
        assertEquals(0, new BigDecimal("17.00").compareTo(res.finalTotal()), 
            "Expected final total 17.00 but got " + res.finalTotal());
    }

    @Test
    void calculate_India_GST_Split() {
        assignment.setCountry(india);
        when(venueCountryAssignmentRepository.findByVenueIdAndActiveTrue(venueId))
                .thenReturn(Optional.of(assignment));

        TaxRule gst5 = new TaxRule();
        gst5.setId(UUID.randomUUID());
        gst5.setRuleCode("IN_GST_5");
        gst5.setRuleName("India GST 5%");
        gst5.setDefaultRate(new BigDecimal("0.05"));
        gst5.setAppliesToDineIn(true);
        gst5.setSortOrder(1);

        List<Object[]> singleRuleResult = new ArrayList<>();
        singleRuleResult.add(new Object[]{gst5, null});
        when(ruleRepository.findActiveRulesWithOverridesForVenue(venueId))
                .thenReturn(singleRuleResult);

        TaxCalculationRequest req = new TaxCalculationRequest(
                UUID.randomUUID(),
                "DINE_IN",
                null,
                List.of(new TaxLineItemRequest(UUID.randomUUID(), new BigDecimal("100.00"), 1, "HOT", "FOOD"))
        );

        TaxCalculationResponse res = taxEngine.calculate(req, venueId);

        assertEquals(0, new BigDecimal("100.00").compareTo(res.subtotal()));
        assertEquals(0, new BigDecimal("5.00").compareTo(res.totalTax()));
        assertNotNull(res.items().get(0).gstSplit());
        assertEquals(0, new BigDecimal("2.50").compareTo(res.items().get(0).gstSplit().cgst()));
        assertEquals(0, new BigDecimal("2.50").compareTo(res.items().get(0).gstSplit().sgst()));
    }

    @Test
    void calculate_Saudi_AlcoholProhibition() {
        assignment.setCountry(saudi);
        when(venueCountryAssignmentRepository.findByVenueIdAndActiveTrue(venueId))
                .thenReturn(Optional.of(assignment));

        TaxCalculationRequest req = new TaxCalculationRequest(
                UUID.randomUUID(),
                "DINE_IN",
                null,
                List.of(new TaxLineItemRequest(UUID.randomUUID(), new BigDecimal("50.00"), 1, null, "ALCOHOL"))
        );

        assertThrows(AlcoholProhibitedException.class, () -> taxEngine.calculate(req, venueId));
    }
}
