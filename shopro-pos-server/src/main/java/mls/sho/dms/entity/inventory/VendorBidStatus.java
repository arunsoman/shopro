package mls.sho.dms.entity.inventory;

/**
 * Status of a Vendor's bid against an RFQ.
 */
public enum VendorBidStatus {
    SUBMITTED,
    OVER_CEILING,
    WON,
    LOST,
    REJECTED
}
