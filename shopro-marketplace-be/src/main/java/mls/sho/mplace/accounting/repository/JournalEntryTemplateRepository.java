package mls.sho.mplace.accounting.repository;

import mls.sho.mplace.accounting.aop.AccountingEventType;
import mls.sho.mplace.accounting.model.JournalEntryTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JournalEntryTemplateRepository
        extends JpaRepository<JournalEntryTemplate, Long> {

    @Query("""
        SELECT t FROM JournalEntryTemplate t
        WHERE t.eventType = :eventType
          AND t.isActive  = true
          AND (t.countryIsoCode IS NULL OR t.countryIsoCode = :country)
        ORDER BY t.countryIsoCode NULLS FIRST, t.lineOrder ASC
        """)
    List<JournalEntryTemplate> findByEventTypeAndCountryOrderByLineOrder(
        @Param("eventType") AccountingEventType eventType,
        @Param("country")   String country
    );
}
