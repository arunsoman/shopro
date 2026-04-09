package mls.sho.dms.application.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestockAlertResponse {
    private String id; // PO ID or RFQ ID
    private String type; // "PO" or "RFQ"
    private String ingredientName;
    private String supplierName;
    private String status;
    private Instant createdAt;
    private Instant stalledSince;
    private String severity; // "HIGH" (stalled PO), "MEDIUM" (failed RFQ)
    private String actionRequired;
}
