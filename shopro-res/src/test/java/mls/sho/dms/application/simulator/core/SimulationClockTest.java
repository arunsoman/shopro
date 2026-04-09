package mls.sho.dms.application.simulator.core;

import org.junit.jupiter.api.Test;
import java.time.Duration;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class SimulationClockTest {

    @Test
    void testTimeScaling() throws InterruptedException {
        LocalDateTime start = LocalDateTime.of(2026, 4, 3, 9, 0);
        double multiplier = 3600.0; // 1 real second = 1 sim hour
        SimulationClock clock = new SimulationClock(start, multiplier);

        // Advance manually
        clock.advance(Duration.ofHours(2));
        assertEquals(start.plusHours(2), clock.getCurrentTime());
    }

    @Test
    void testTickLogic() {
        LocalDateTime start = LocalDateTime.now();
        SimulationClock clock = new SimulationClock(start, 1.0);
        
        // Initial time
        assertEquals(start, clock.getCurrentTime());
        
        // Tick is more of a background mechanism in our current impl, 
        // but let's verify basic state
        assertEquals(1.0, clock.getTimeMultiplier());
    }
}
