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
public class MenuEngineeringDto {
    private Long menuItemId;
    private String name;
    private Long unitsSold;
    private BigDecimal costPerUnit;
    private BigDecimal pricePerUnit;
    private BigDecimal marginPerUnit;
    private BigDecimal totalMargin;
    private Double salesMixPercentage;
    private Quadrant quadrant;

    public enum Quadrant {
        STAR,       // High Popularity, High Contribution Margin
        PLOWHORSE,  // High Popularity, Low Contribution Margin
        PUZZLE,     // Low Popularity, High Contribution Margin
        DOG         // Low Popularity, Low Contribution Margin
    }
}
