package mls.sho.mplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FoodOfferDto {
    private UUID supplierId;
    private String supplierName;
    private Double trustScore;
    private Double fulfillmentRate;
    private BigDecimal price;
    private Double stockQty;
}
