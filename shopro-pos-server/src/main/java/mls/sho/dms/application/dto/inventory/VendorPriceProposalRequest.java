package mls.sho.dms.application.dto.inventory;

import lombok.Data;
import java.util.UUID;

@Data
public class VendorPriceProposalRequest {
    private UUID supplierId;
    private UUID ingredientId;
    private Double proposedPrice;
    private String notes;
}
