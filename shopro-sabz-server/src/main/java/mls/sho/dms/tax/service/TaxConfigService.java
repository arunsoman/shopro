package mls.sho.dms.tax.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.tax.entity.*;
import mls.sho.dms.tax.repository.*;
import mls.sho.dms.tax.engine.exception.RateOutOfBoundsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaxConfigService {

    private final CountryRepository countryRepository;
    private final TaxRuleRepository ruleRepository;
    private final VenueCountryAssignmentRepository assignmentRepository;
    private final VenueTaxConfigRepository overrideRepository;
    private final TaxAuditLogRepository auditLogRepository;

    public List<Country> getAllCountries() {
        return countryRepository.findAll();
    }

    public List<TaxRule> getRulesForCountry(String isoCode) {
        return ruleRepository.findByCountryIsoCodeAndActiveTrueOrderBySortOrderAsc(isoCode);
    }

    public VenueCountryAssignment getVenueAssignment(UUID venueId) {
        return assignmentRepository.findByVenueIdAndActiveTrue(venueId)
                .orElse(null);
    }

    @Transactional
    public void assignCountryToVenue(UUID venueId, String isoCode, UUID userId) {
        Country country = countryRepository.findByIsoCode(isoCode)
                .orElseThrow(() -> new RuntimeException("Country not found: " + isoCode));

        VenueCountryAssignment assignment = assignmentRepository.findByVenueId(venueId)
                .orElse(new VenueCountryAssignment());
        
        assignment.setVenueId(venueId);
        assignment.setCountry(country);
        assignment.setAssignedBy(userId);
        assignment.setActive(true);
        assignmentRepository.save(assignment);

        // Audit
        TaxAuditLog log = new TaxAuditLog();
        log.setVenueId(venueId);
        log.setAction("COUNTRY_ASSIGNED");
        log.setChangedBy(userId);
        log.setChangeReason("Assigned to jurisdiction: " + country.getName());
        auditLogRepository.save(log);
    }

    @Transactional
    public void setRateOverride(UUID venueId, UUID ruleId, BigDecimal newRate, String reason, UUID userId) {
        TaxRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Tax rule not found"));

        if (newRate.compareTo(rule.getMinAllowedRate()) < 0 || newRate.compareTo(rule.getMaxAllowedRate()) > 0) {
            throw new RateOutOfBoundsException("Override rate " + newRate + " is outside legal bounds [" + 
                rule.getMinAllowedRate() + " - " + rule.getMaxAllowedRate() + "]");
        }

        VenueTaxConfig override = overrideRepository.findByVenueIdAndTaxRuleIdAndActiveTrue(venueId, ruleId)
                .orElse(new VenueTaxConfig());

        BigDecimal oldRate = override.getOverrideRate();
        override.setVenueId(venueId);
        override.setTaxRule(rule);
        override.setOverrideRate(newRate);
        override.setOverrideReason(reason);
        override.setCreatedBy(userId);
        overrideRepository.save(override);

        // Audit
        TaxAuditLog audit = new TaxAuditLog();
        audit.setVenueId(venueId);
        audit.setTaxRule(rule);
        audit.setAction("OVERRIDE_SET");
        audit.setOldRate(oldRate);
        audit.setNewRate(newRate);
        audit.setChangedBy(userId);
        audit.setChangeReason(reason);
        auditLogRepository.save(audit);
    }
}
