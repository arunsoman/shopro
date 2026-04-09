package mls.sho.dms.application.simulator.core;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Virtual Clock for the simulation.
 * Allows time to be accelerated relative to real-world time.
 */
public class SimulationClock {
    private LocalDateTime currentTime;
    private final LocalDateTime startTime;
    private final double timeMultiplier;
    private final long realStartTime;

    public SimulationClock(LocalDateTime startTime, double timeMultiplier) {
        this.startTime = startTime;
        this.currentTime = startTime;
        this.timeMultiplier = timeMultiplier;
        this.realStartTime = System.currentTimeMillis();
    }

    /**
     * Updates the current virtual time based on a fixed step or simply preserves 
     * manual advancements. Pure Wall-Clock calculation is removed to avoid drift 
     * during high-concurrency simulation pauses.
     */
    public void tick() {
        // No-op: rely on explicit advance() to keep simulation deterministic
    }

    /**
     * Advances the clock with a specific virtual duration.
     */
    public void advance(Duration virtualDuration) {
        this.currentTime = this.currentTime.plus(virtualDuration);
    }

    public LocalDateTime getCurrentTime() {
        return currentTime;
    }
    
    public double getTimeMultiplier() {
        return timeMultiplier;
    }
}
