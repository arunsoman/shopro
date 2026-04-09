package mls.sho.dms.entity.analytics;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * A pre-aggregated daily sales snapshot for fast analytics dashboard queries.
 * This avoids expensive real-time aggregation over the ORDER_TICKET and PAYMENT tables.
 *
 * PostgreSQL strategy:
 *   - PARTITIONED BY RANGE (snapshot_date) with yearly child tables.
 *     DDL: CREATE TABLE daily_sales_snapshot PARTITION BY RANGE (snapshot_date);
 *   - Unique constraint on snapshot_date: exactly one snapshot per business day.
 *   - BRIN index on snapshot_date (monotonically increasing).
 *
 * Populated by a background job at EOD close or on a scheduled interval.
 */
@Entity
@Table(
    name = "daily_sales_snapshot",
    indexes = {
        @Index(name = "uq_snapshot_date",      columnList = "snapshot_date", unique = true),
        @Index(name = "idx_snapshot_date_brin", columnList = "snapshot_date") // BRIN in DDL
    }
)
public class DailySalesSnapshot extends BaseEntity {

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "gross_sales",   nullable = false, precision = 12, scale = 2)
    private BigDecimal grossSales = BigDecimal.ZERO;

    @Column(name = "net_sales",     nullable = false, precision = 12, scale = 2)
    private BigDecimal netSales = BigDecimal.ZERO;

    @Column(name = "total_discounts", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalDiscounts = BigDecimal.ZERO;

    @Column(name = "total_voids",     nullable = false, precision = 10, scale = 2)
    private BigDecimal totalVoids = BigDecimal.ZERO;

    @Column(name = "total_tax",       nullable = false, precision = 10, scale = 2)
    private BigDecimal totalTax = BigDecimal.ZERO;

    @Column(name = "total_tips",      nullable = false, precision = 10, scale = 2)
    private BigDecimal totalTips = BigDecimal.ZERO;

    @Column(name = "cash_total",      nullable = false, precision = 10, scale = 2)
    private BigDecimal cashTotal = BigDecimal.ZERO;

    @Column(name = "card_total",      nullable = false, precision = 10, scale = 2)
    private BigDecimal cardTotal = BigDecimal.ZERO;

    @Column(name = "apple_pay_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal applePayTotal = BigDecimal.ZERO;

    @Column(name = "google_pay_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal googlePayTotal = BigDecimal.ZERO;

    @Column(name = "gift_card_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal giftCardTotal = BigDecimal.ZERO;

    @Column(name = "cover_count",     nullable = false)
    private int coverCount;

    @Column(name = "ticket_count",    nullable = false)
    private int ticketCount;

    public LocalDate getSnapshotDate() { return snapshotDate; }
    public void setSnapshotDate(LocalDate d) { this.snapshotDate = d; }
    public BigDecimal getGrossSales() { return grossSales; }
    public void setGrossSales(BigDecimal v) { this.grossSales = v; }
    public BigDecimal getNetSales() { return netSales; }
    public void setNetSales(BigDecimal v) { this.netSales = v; }
    public BigDecimal getTotalDiscounts() { return totalDiscounts; }
    public void setTotalDiscounts(BigDecimal v) { this.totalDiscounts = v; }
    public BigDecimal getTotalVoids() { return totalVoids; }
    public void setTotalVoids(BigDecimal v) { this.totalVoids = v; }
    public BigDecimal getTotalTax() { return totalTax; }
    public void setTotalTax(BigDecimal v) { this.totalTax = v; }
    public BigDecimal getTotalTips() { return totalTips; }
    public void setTotalTips(BigDecimal v) { this.totalTips = v; }
    public BigDecimal getCashTotal() { return cashTotal; }
    public void setCashTotal(BigDecimal v) { this.cashTotal = v; }
    public BigDecimal getCardTotal() { return cardTotal; }
    public void setCardTotal(BigDecimal v) { this.cardTotal = v; }
    public BigDecimal getApplePayTotal() { return applePayTotal; }
    public void setApplePayTotal(BigDecimal v) { this.applePayTotal = v; }
    public BigDecimal getGooglePayTotal() { return googlePayTotal; }
    public void setGooglePayTotal(BigDecimal v) { this.googlePayTotal = v; }
    public BigDecimal getGiftCardTotal() { return giftCardTotal; }
    public void setGiftCardTotal(BigDecimal v) { this.giftCardTotal = v; }
    public int getCoverCount() { return coverCount; }
    public void setCoverCount(int v) { this.coverCount = v; }
    public int getTicketCount() { return ticketCount; }
    public void setTicketCount(int v) { this.ticketCount = v; }
}
