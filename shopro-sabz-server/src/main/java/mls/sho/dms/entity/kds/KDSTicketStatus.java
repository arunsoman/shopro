package mls.sho.dms.entity.kds;

/** NEW → COOKING → READY → BUMPED (fully done at station). DELAYED is a UI-computed state from timer age. */
public enum KDSTicketStatus {
    NEW, COOKING, READY, BUMPED
}
