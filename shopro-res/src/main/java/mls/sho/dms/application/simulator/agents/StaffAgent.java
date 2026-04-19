package mls.sho.dms.application.simulator.agents;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.simulator.core.SimulationWorld;
import org.springframework.stereotype.Component;

/**
 * Server/Waiter agent - handles seating and service.
 * 
 * DISABLED FOR DTO REFACTORING - Python simulator handles all POS operations via REST API.
 */
@Component
@RequiredArgsConstructor
public class StaffAgent {

    private final SimulationWorld world;

    public void tick() {
        // DISABLED - Python simulator handles all operations via REST API
        // Internal Java simulator not used
    }
}
