package mls.sho.dms.tax.repository;

import mls.sho.dms.tax.entity.TaxRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TaxRuleRepository extends JpaRepository<TaxRule, java.util.UUID> {
    List<TaxRule> findByCountryIsoCodeAndActiveTrueOrderBySortOrderAsc(String isoCode);

    @Query("""
        SELECT r, c FROM TaxRule r
        LEFT JOIN VenueTaxConfig c ON c.taxRule.id = r.id AND c.venueId = :venueId AND c.active = true
        WHERE r.country.id = (
            SELECT vca.country.id FROM VenueCountryAssignment vca
            WHERE vca.venueId = :venueId AND vca.active = true
        )
        AND r.active = true
        ORDER BY r.sortOrder ASC
        """)
    List<Object[]> findActiveRulesWithOverridesForVenue(@Param("venueId") UUID venueId);

    java.util.Optional<TaxRule> findByRuleCode(String ruleCode);
}
