package mls.sho.dms.application.service.inventory.ai.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyRecord {
    private String itemDescription;
    private double anomalyScore;       // 0–1; >0.6 = suspicious, >0.8 = high risk
    private String anomalyType;        // e.g. "PRICE_SPIKE", "QTY_MISMATCH", "PHANTOM_ITEM"
    private String detail;

    public String getSeverity() {
        if (anomalyScore >= 0.80) return "HIGH";
        if (anomalyScore >= 0.60) return "MEDIUM";
        return "LOW";
    }
}
