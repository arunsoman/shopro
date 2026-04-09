package mls.sho.dms.common.enums;

/**
 * Defines the granularity at which a variant is assigned to a subject.
 */
public enum RandomizationUnit {
    /** Individual guest identity (sticky across visits) */
    GUEST,
    
    /** Specific table session (volatile per visit) */
    SESSION,
    
    /** Time windows (e.g. 4-hour shifts) to prevent contamination */
    TIME_BLOCK
}
