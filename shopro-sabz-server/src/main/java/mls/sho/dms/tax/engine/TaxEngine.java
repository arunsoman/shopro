package mls.sho.dms.tax.engine;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.tax.dto.request.TaxCalculationRequest;
import mls.sho.dms.tax.dto.request.TaxLineItemRequest;
import mls.sho.dms.tax.dto.response.TaxBreakdownEntry;
import mls.sho.dms.tax.dto.response.TaxCalculationResponse;
import mls.sho.dms.tax.dto.response.TaxLineItemResult;
import mls.sho.dms.tax.entity.Country;
import mls.sho.dms.tax.entity.TaxRule;
import mls.sho.dms.tax.entity.VenueTaxConfig;
import mls.sho.dms.tax.engine.exception.*;
import mls.sho.dms.tax.repository.TaxRuleRepository;
import mls.sho.dms.tax.repository.VenueCountryAssignmentRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaxEngine {

    private final TaxRuleRepository ruleRepository;
    private final VenueCountryAssignmentRepository venueCountryAssignmentRepository;

    public TaxCalculationResponse calculate(TaxCalculationRequest request, UUID venueId) {
        Country country = venueCountryAssignmentRepository.findByVenueIdAndActiveTrue(venueId)
                .orElseThrow(() -> new VenueCountryNotSetException("Venue " + venueId + " has no assigned tax country"))
                .getCountry();

        List<Object[]> ruleData = ruleRepository.findActiveRulesWithOverridesForVenue(venueId);
        List<RuleWithOverride> activeRules = ruleData.stream()
                .map(d -> new RuleWithOverride((TaxRule) d[0], (VenueTaxConfig) d[1]))
                .toList();

        List<TaxLineItemResult> results = new ArrayList<>();
        for (TaxLineItemRequest item : request.items()) {
            results.add(calculateItemTax(item, activeRules, country, request.orderType()));
        }

        BigDecimal totalTax = results.stream()
                .map(TaxLineItemResult::totalTax)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal grossSubtotal = results.stream()
                .map(TaxLineItemResult::baseAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal netSubtotal = country.isTaxIncluded() ? grossSubtotal.subtract(totalTax) : grossSubtotal;

        // Service Charge Calculation (Simplified for now)
        BigDecimal serviceChargeTax = BigDecimal.ZERO;
        BigDecimal scAmount = request.serviceChargeAmount() != null ? request.serviceChargeAmount() : BigDecimal.ZERO;
        
        if (scAmount.compareTo(BigDecimal.ZERO) > 0) {
            // Find SC rule
            Optional<RuleWithOverride> scRule = activeRules.stream()
                    .filter(r -> r.rule().getRuleCode().contains("SERVICE_CHARGE"))
                    .findFirst();
            
            if (scRule.isPresent()) {
                BigDecimal rate = scRule.get().getEffectiveRate();
                serviceChargeTax = scAmount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
            }
        }

        Map<String, BigDecimal> summary = results.stream()
                .flatMap(r -> r.breakdowns().stream())
                .collect(Collectors.groupingBy(
                        TaxBreakdownEntry::ruleCode,
                        Collectors.reducing(BigDecimal.ZERO, TaxBreakdownEntry::amount, BigDecimal::add)
                ));

        return new TaxCalculationResponse(
                request.ticketId(),
                netSubtotal,
                totalTax,
                serviceChargeTax,
                netSubtotal.add(totalTax).add(scAmount).add(serviceChargeTax),
                results,
                summary
        );
    }

    private TaxLineItemResult calculateItemTax(TaxLineItemRequest item, List<RuleWithOverride> rules, Country country, String orderType) {
        // Saudi Alcohol Guard
        if ("SA".equals(country.getIsoCode()) && "ALCOHOL".equals(item.itemCategory())) {
            throw new AlcoholProhibitedException("Alcohol items are prohibited for Saudi Arabia venues.");
        }

        List<RuleWithOverride> applicableRules = rules.stream()
                .filter(r -> isRuleApplicable(r.rule(), item, orderType))
                .sorted(Comparator.comparingInt(r -> r.rule().getSortOrder()))
                .toList();

        BigDecimal baseAmount = item.unitPrice().multiply(BigDecimal.valueOf(item.quantity()));
        List<TaxBreakdownEntry> breakdowns = new ArrayList<>();
        BigDecimal itemTotalTax = BigDecimal.ZERO;

        Map<UUID, BigDecimal> ruleTaxResults = new HashMap<>();

        for (RuleWithOverride r : applicableRules) {
            BigDecimal rate = r.getEffectiveRate();
            BigDecimal tax;
            
            if (r.rule().isCascading() && r.rule().getCascadeOnRule() != null) {
                BigDecimal parentTax = ruleTaxResults.getOrDefault(r.rule().getCascadeOnRule().getId(), BigDecimal.ZERO);
                tax = (baseAmount.add(parentTax)).multiply(rate).setScale(2, RoundingMode.HALF_UP);
            } else if (country.isTaxIncluded()) {
                // Backward calculate tax from inclusive amount
                BigDecimal net = baseAmount.divide(BigDecimal.ONE.add(rate), 2, RoundingMode.HALF_UP);
                tax = baseAmount.subtract(net);
            } else {
                tax = baseAmount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
            }

            ruleTaxResults.put(r.rule().getId(), tax);
            itemTotalTax = itemTotalTax.add(tax);
            breakdowns.add(new TaxBreakdownEntry(r.rule().getRuleCode(), r.rule().getRuleName(), rate, tax));
        }

        TaxLineItemResult.GstSplit gstSplit = null;
        if ("IN".equals(country.getIsoCode()) && itemTotalTax.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal cgst = itemTotalTax.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            gstSplit = new TaxLineItemResult.GstSplit(cgst, itemTotalTax.subtract(cgst));
        }

        return new TaxLineItemResult(item.itemId(), baseAmount, itemTotalTax, breakdowns, gstSplit);
    }

    private boolean isRuleApplicable(TaxRule rule, TaxLineItemRequest item, String orderType) {
        // Order Type
        if ("DINE_IN".equals(orderType) && !rule.isAppliesToDineIn()) return false;
        if ("TAKEAWAY".equals(orderType) && !rule.isAppliesToTakeaway()) return false;
        
        // Temperature
        if (Boolean.TRUE.equals(rule.getAppliesToHot()) && !"HOT".equals(item.temperature())) return false;
        if (Boolean.TRUE.equals(rule.getAppliesToCold()) && !"COLD".equals(item.temperature())) return false;
        if (Boolean.FALSE.equals(rule.getAppliesToHot()) && "HOT".equals(item.temperature())) return false;
        if (Boolean.FALSE.equals(rule.getAppliesToCold()) && "COLD".equals(item.temperature())) return false;

        // Category
        if (rule.getItemCategory() != null && !rule.getItemCategory().equals(item.itemCategory())) return false;
        if (rule.isAppliesToAlcohol() && !"ALCOHOL".equals(item.itemCategory())) return false;

        // Price Thresholds
        if (rule.getPriceThresholdMin() != null && item.unitPrice().compareTo(rule.getPriceThresholdMin()) < 0) return false;
        if (rule.getPriceThresholdMax() != null && item.unitPrice().compareTo(rule.getPriceThresholdMax()) >= 0) return false;

        return true;
    }

    private record RuleWithOverride(TaxRule rule, VenueTaxConfig override) {
        public BigDecimal getEffectiveRate() {
            return (override != null) ? override.getOverrideRate() : rule.getDefaultRate();
        }
    }
}
