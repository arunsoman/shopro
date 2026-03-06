package mls.sho.dms.entity.analytics;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.staff.StaffMember;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Records the result of an End-of-Day close, including the cash reconciliation and Z-report location.
 * One record per business day. Write-once — never updated after generation.
 *
 * Unique constraint on close_date: prevents duplicate EOD records per day.
 */
@Entity
@Table(
    name = "eod_record",
    indexes = {
        @Index(name = "uq_eod_close_date", columnList = "close_date", unique = true),
        @Index(name = "idx_eod_closed_by", columnList = "closed_by_id")
    }
)
public class EODRecord extends BaseEntity {

    @Column(name = "close_date", nullable = false)
    private LocalDate closeDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "closed_by_id", nullable = false)
    private StaffMember closedBy;

    /** Cash float placed in the drawer at the start of the day. */
    @Column(name = "opening_float", nullable = false, precision = 10, scale = 2)
    private BigDecimal openingFloat;

    /** Cash float confirmed for the next day. */
    @Column(name = "closing_float", nullable = false, precision = 10, scale = 2)
    private BigDecimal closingFloat;

    /** Physical cash counted by the Manager during the EOD process. */
    @Column(name = "counted_cash", nullable = false, precision = 10, scale = 2)
    private BigDecimal countedCash;

    /**
     * Variance = countedCash − (openingFloat + cashSalesDuringDay).
     * Positive = overage, Negative = shortage.
     */
    @Column(name = "cash_variance", nullable = false, precision = 10, scale = 2)
    private BigDecimal cashVariance;

    /** Path or URL to the generated Z-report PDF file. */
    @Column(name = "z_report_path", length = 1024)
    private String zReportPath;

    @Column(name = "gross_sales", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossSales;

    @Column(name = "net_sales", nullable = false, precision = 12, scale = 2)
    private BigDecimal netSales;

    @Column(name = "total_tax_collected", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalTaxCollected;

    @Column(name = "total_tips", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalTips;

    @Column(name = "total_voids", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalVoids;

    @Column(name = "total_discounts", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalDiscounts;

    public LocalDate getCloseDate() { return closeDate; }
    public void setCloseDate(LocalDate closeDate) { this.closeDate = closeDate; }
    public StaffMember getClosedBy() { return closedBy; }
    public void setClosedBy(StaffMember closedBy) { this.closedBy = closedBy; }
    public BigDecimal getOpeningFloat() { return openingFloat; }
    public void setOpeningFloat(BigDecimal openingFloat) { this.openingFloat = openingFloat; }
    public BigDecimal getClosingFloat() { return closingFloat; }
    public void setClosingFloat(BigDecimal closingFloat) { this.closingFloat = closingFloat; }
    public BigDecimal getCountedCash() { return countedCash; }
    public void setCountedCash(BigDecimal countedCash) { this.countedCash = countedCash; }
    public BigDecimal getCashVariance() { return cashVariance; }
    public void setCashVariance(BigDecimal cashVariance) { this.cashVariance = cashVariance; }
    public String getZReportPath() { return zReportPath; }
    public void setZReportPath(String zReportPath) { this.zReportPath = zReportPath; }
    public BigDecimal getGrossSales() { return grossSales; }
    public void setGrossSales(BigDecimal grossSales) { this.grossSales = grossSales; }
    public BigDecimal getNetSales() { return netSales; }
    public void setNetSales(BigDecimal netSales) { this.netSales = netSales; }
    public BigDecimal getTotalTaxCollected() { return totalTaxCollected; }
    public void setTotalTaxCollected(BigDecimal totalTaxCollected) { this.totalTaxCollected = totalTaxCollected; }
    public BigDecimal getTotalTips() { return totalTips; }
    public void setTotalTips(BigDecimal totalTips) { this.totalTips = totalTips; }
    public BigDecimal getTotalVoids() { return totalVoids; }
    public void setTotalVoids(BigDecimal totalVoids) { this.totalVoids = totalVoids; }
    public BigDecimal getTotalDiscounts() { return totalDiscounts; }
    public void setTotalDiscounts(BigDecimal totalDiscounts) { this.totalDiscounts = totalDiscounts; }
}
