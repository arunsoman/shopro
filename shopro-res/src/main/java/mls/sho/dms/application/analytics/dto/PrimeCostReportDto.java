package mls.sho.dms.application.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrimeCostReportDto {
    private LocalDate date;
    private BigDecimal revenue;
    private BigDecimal cogs; // Cost of Goods Sold
    private BigDecimal laborCost;
    private BigDecimal primeCost; // COGS + Labor
    private Double primeCostPercentage; // Prime Cost as % of Revenue
}
