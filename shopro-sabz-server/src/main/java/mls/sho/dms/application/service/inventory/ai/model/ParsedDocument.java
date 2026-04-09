package mls.sho.dms.application.service.inventory.ai.model;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * Holds all structured data extracted from one PDF document after OCR + parsing.
 */
@Data
public class ParsedDocument {
    private DocumentType type;
    private String documentId;       // PO number / Invoice number / GRN number
    private String supplierName;
    private String buyerName;
    private String documentDate;
    private String referencePoNumber; // present on invoice & GRN
    private double subtotal;
    private double taxAmount;
    private double grandTotal;
    private String rawOcrText;        // full OCR output (for debugging)

    private List<LineItem> lineItems = new ArrayList<>();

    public void addLineItem(LineItem item) {
        this.lineItems.add(item);
    }
}
