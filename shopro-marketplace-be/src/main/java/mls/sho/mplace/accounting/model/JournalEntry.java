package mls.sho.mplace.accounting.model;

import jakarta.persistence.*;
import lombok.*;
import mls.sho.mplace.accounting.aop.AccountingEventType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * A single line of a double-entry journal, persisted to the ledger.
 */
@Entity @Table(name = "journal_entries")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class JournalEntry {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String journalRef;          // e.g. "JNL-20250322-00041"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountingEventType eventType;

    @Column(nullable = false)
    private String ledgerAccountCode;

    @Column(nullable = false)
    private String ledgerAccountName;

    private BigDecimal debitAmount;
    private BigDecimal creditAmount;

    @Column(nullable = false)
    private String currency;

    private String countryIsoCode;
    private String taxCode;
    private UUID   entityId;
    private String entityType;
    private String entityReference;
    private UUID   venueId;
    private UUID   counterpartyId;
    private String counterpartyType;
    private String description;
    private String initiatedBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() { this.createdAt = Instant.now(); }
}
