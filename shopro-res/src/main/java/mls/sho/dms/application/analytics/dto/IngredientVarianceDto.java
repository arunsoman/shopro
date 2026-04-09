package mls.sho.dms.application.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientVarianceDto {
    private Long ingredientId;
    private String ingredientName;
    private BigDecimal theoreticalUsage;
    private BigDecimal actualUsage;
    private BigDecimal varianceQuantity;
    private Double variancePercentage;
    private BigDecimal costImpact;
}
