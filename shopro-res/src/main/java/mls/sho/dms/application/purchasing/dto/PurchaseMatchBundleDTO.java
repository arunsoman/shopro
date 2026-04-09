package mls.sho.dms.application.purchasing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PurchaseMatchBundleDTO {
    private PurchaseOrderDTO purchaseOrder;
    private List<GoodsReceiptDTO> goodsReceipts;
    private List<PurchaseInvoiceDTO> invoices;
    private MatchSummary summary;

    @Data
    public static class MatchSummary {
        private BigDecimal totalOrdered;
        private BigDecimal totalReceived;
        private BigDecimal totalBilled;
        private BigDecimal totalVariance;
        private String matchStatus; // PERFECT, VARIANCE, LEAK
    }
}
