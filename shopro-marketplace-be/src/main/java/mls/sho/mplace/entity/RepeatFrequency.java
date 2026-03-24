package mls.sho.mplace.entity;

/**
 * Frequency for automated bid scheduling cycles.
 */
public enum RepeatFrequency {
    /**
     * No automated recurrence.
     */
    NONE,
    
    /**
     * 24-hour fulfillment cycle.
     */
    DAILY,
    
    /**
     * Weekly handshake.
     */
    WEEKLY,
    
    /**
     * Monthly contract refresh.
     */
    MONTHLY
}
