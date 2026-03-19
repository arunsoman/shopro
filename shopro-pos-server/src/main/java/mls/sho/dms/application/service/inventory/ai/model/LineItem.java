package mls.sho.dms.application.service.inventory.ai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents one line item extracted from a document.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LineItem {
    private String description;
    private String unit;
    private double quantity;
    private double unitPrice;
    private double totalAmount;
    private int lineNumber;   // original line order in document

    /** Normalised description for fuzzy matching (lowercase, trimmed, no special chars) */
    public String getNormalizedDescription() {
        return description == null ? "" :
               description.toLowerCase()
                          .replaceAll("[^a-z0-9 ]", " ")
                          .replaceAll("\\s+", " ")
                          .trim();
    }
}
