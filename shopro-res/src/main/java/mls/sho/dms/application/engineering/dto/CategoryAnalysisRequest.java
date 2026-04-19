package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request DTO for running category-specific menu engineering analysis.
 * Each category gets its own matrix calculation.
 * 
 * INPUT: POST /analyze/by-category
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAnalysisRequest {
    
    /**
     * List of quantities sold for each menu item.
     * Must match the order of menu items.
     */
    private List<Integer> quantitiesSold;
    
    /**
     * Optional: Popularity threshold factor (default 0.70).
     */
    private BigDecimal popularityFactor;
}
