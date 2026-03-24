package mls.sho.mplace.entity;

/**
 * OP-08 — Operational Mode for Bid Orcherstration
 */
public enum OperationMode {
    /**
     * Fully autonomous fulfillment signal propagation.
     */
    AUTOMATIC,
    
    /**
     * Proposed award requires Operator handshake.
     */
    SEMI_AUTOMATIC,
    
    /**
     * Full-control orchestration of all nodes.
     */
    MANUAL
}
