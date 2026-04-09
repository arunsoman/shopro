package mls.sho.dms.application.service.inventory.dto;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public class MatchInvoiceRequest {
    private String invoiceNumber;
    private Map<UUID, BigDecimal> invoicedQuantities; // Ingredient ID -> Quantity
    private Map<UUID, BigDecimal> invoicedPrices;     // Ingredient ID -> Price
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public Map<UUID, BigDecimal> getInvoicedQuantities() { return invoicedQuantities; }
    public void setInvoicedQuantities(Map<UUID, BigDecimal> invoicedQuantities) { this.invoicedQuantities = invoicedQuantities; }
    public Map<UUID, BigDecimal> getInvoicedPrices() { return invoicedPrices; }
    public void setInvoicedPrices(Map<UUID, BigDecimal> invoicedPrices) { this.invoicedPrices = invoicedPrices; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
}
