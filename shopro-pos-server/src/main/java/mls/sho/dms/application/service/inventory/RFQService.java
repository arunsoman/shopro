package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.CreateRFQRequest;
import mls.sho.dms.application.dto.inventory.RFQResponse;
import mls.sho.dms.application.dto.inventory.VendorBidRequest;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.entity.inventory.RFQ;
import mls.sho.dms.entity.inventory.RfqStatus;
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
}
