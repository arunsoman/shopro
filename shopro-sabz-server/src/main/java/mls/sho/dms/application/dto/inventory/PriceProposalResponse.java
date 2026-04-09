package mls.sho.dms.application.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mls.sho.dms.entity.inventory.VendorPriceProposalStatus;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceProposalResponse {
    private UUID id;
    private UUID supplierId;
    private String supplierName;
    private UUID ingredientId;
    private String ingredientName;
    private String unitOfMeasure;
    private Double proposedPrice;
    private Double currentPrice;
    private String notes;
    private VendorPriceProposalStatus status;
    private Instant createdAt;
    private UUID generatedPoId;
    private String generatedPoStatus;
}
