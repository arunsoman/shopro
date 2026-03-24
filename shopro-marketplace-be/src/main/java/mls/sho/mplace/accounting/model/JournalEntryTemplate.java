package mls.sho.mplace.accounting.model;

import jakarta.persistence.*;
import lombok.*;
import mls.sho.mplace.accounting.aop.AccountingEventType;

/**
 * DB-driven template for generating journal entries based on business events.
 */
@Entity @Table(name = "journal_entry_templates")
@Data @NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntryTemplate {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountingEventType eventType;

    private String countryIsoCode;   // null = applies to all countries

    @Column(nullable = false)
    private Integer lineOrder;       // 1,2,3... per event type

    @Column(nullable = false)
    private String ledgerAccountCode; // e.g. "1100-AR", "2100-AP", "4000-COMMISSION"

    @Column(nullable = false)
    private String ledgerAccountName;

    // SpEL expressions evaluated against AccountingEventContext
    private String debitExpression;  // null if this line is a credit
    private String creditExpression; // null if this line is a debit

    private String description;      // e.g. "AR raised on restaurant PO"
    
    @Builder.Default
    private boolean isActive = true;
}
