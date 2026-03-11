package mls.sho.dms.application.service.inventory;

import mls.sho.dms.entity.inventory.PurchaseOrder;
import java.util.UUID;

/**
 * Service for generating Purchase Orders from various source entities.
 */
public interface POGeneratorService {

    /**
     * Creates a DRAFT PO from an awarded VendorBid.
     */
    PurchaseOrder createFromBid(UUID bidId, UUID staffId);

    /**
     * Creates a DRAFT PO from an accepted VendorPriceProposal.
     */
    PurchaseOrder createFromProposal(UUID proposalId, UUID staffId);
}
