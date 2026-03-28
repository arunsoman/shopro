package mls.sho.dms.entity.finance;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * A balanced accounting entry (Double-Entry).
 */
@Entity
@Table(name = "finance_journal_entry")
public class JournalEntry extends BaseEntity {

    @Column(name = "entry_date", nullable = false)
    private Instant entryDate;

    @Column(name = "description", length = 500)
    private String description;

    /** Reference ID for tracing: Order UUID, PO UUID, etc. */
    @Column(name = "reference_id")
    private UUID referenceId;

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JournalLine> lines = new ArrayList<>();

    public void addLine(JournalLine line) {
        lines.add(line);
        line.setJournalEntry(this);
    }

    public Instant getEntryDate() { return entryDate; }
    public void setEntryDate(Instant d) { this.entryDate = d; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public UUID getReferenceId() { return referenceId; }
    public void setReferenceId(UUID id) { this.referenceId = id; }
    public List<JournalLine> getLines() { return lines; }
    public void setLines(List<JournalLine> lines) { this.lines = lines; }
}
