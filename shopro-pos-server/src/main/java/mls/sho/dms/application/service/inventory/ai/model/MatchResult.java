package mls.sho.dms.application.service.inventory.ai.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Data
public class MatchResult {
    private List<MatchPair> matchedPairs = new ArrayList<>();
    private List<AnomalyRecord> anomalies = new ArrayList<>();
    private String overallStatus;  // "APPROVED", "EXCEPTION", "FRAUD_RISK"
    private String processedAt = LocalDateTime.now()
            .format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm:ss"));

    // Financial summary
    private double poTotal;
    private double invoiceTotal;
    private double grnApprovedTotal;
    private double varianceAmount;

    // Cross-document reference check
    private boolean poRefMatchesInvoice;
    private boolean poRefMatchesGrn;
    private String poNumber;
    private String invoiceNumber;
    private String grnNumber;

    public void addMatchedPair(MatchPair p) {
        matchedPairs.add(p);
    }

    public long countByStatus(MatchStatus status) {
        return matchedPairs.stream()
                .filter(p -> p.getStatus() == status)
                .count();
    }
}
