package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.CreateBidRequest;
import mls.sho.dms.application.dto.inventory.CreateRFQRequest;
import mls.sho.dms.application.dto.inventory.RFQResponse;
import mls.sho.dms.application.dto.inventory.VendorBidRequest;
import mls.sho.dms.entity.inventory.ingredient.RawIngredient;
import mls.sho.dms.entity.inventory.procurement.RFQ;
import mls.sho.dms.entity.inventory.procurement.RfqStatus;
import java.util.List;
import java.util.UUID;

public interface RFQService {
    /**
     * Attempts to generate an RFQ for the given ingredient if it does not already have an open RFQ.
     * Only applies if autoReplenish is true.
     */
    RFQ generateRfqIfEligible(RawIngredient ingredient);

    /**
     * Manually creates an RFQ.
     */
    RFQResponse createRfq(CreateRFQRequest request);

    /**
     * Creates a multi-ingredient bid with invited suppliers.
     */
    void createBid(CreateBidRequest request);

    /**
     * Retrieves all RFQs with optional status filter.
     */
    List<RFQResponse> getAllRfqs(RfqStatus status);

    /**
     * Retrieves a single RFQ by ID.
     */
    RFQResponse getRfqById(UUID id);

    /**
     * Submits a bid against an RFQ.
     */
    void submitBid(UUID rfqId, VendorBidRequest request);

    /**
     * Cancels an RFQ if it is in a revokable state.
     */
    void cancelRfq(UUID rfqId);

    /**
     * Retrieves all bids for a given RFQ.
     */
    List<mls.sho.dms.application.dto.inventory.VendorBidResponse> getBidsForRfq(UUID rfqId);

    /**
     * Accepts a specific bid, closes the RFQ, and triggers PO generation.
     */
    void awardBid(UUID bidId, UUID staffId);
}
