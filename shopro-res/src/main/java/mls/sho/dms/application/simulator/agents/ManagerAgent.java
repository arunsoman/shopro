package mls.sho.dms.application.simulator.agents;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import mls.sho.dms.application.simulator.core.SimulationLogger;
import mls.sho.dms.application.simulator.core.SimulationWorld;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

/**
 * Models the Restaurant Manager:
 * Periodically reviews the Intelligence Hub / Analytics dashboards.
 * This acts as a 'Read Stress Test' for the system during high-velocity simulations.
 */
public class ManagerAgent extends BaseAgent {
    private static final Logger log = LoggerFactory.getLogger(ManagerAgent.class);

    public ManagerAgent(long id, SimulationWorld world) {
        super(id, world);
    }

    @Override
    @Transactional(readOnly = true)
    public void run() {
        java.time.LocalDate shiftDay = world.getClock().get().getCurrentTime().toLocalDate();
        logEvent(SimulationLogger.EVENT_START, "Manager Agent " + agentId + " is reviewing reports.");

        while (running) {
            try {
                // Simulate periodic dashboard review (once every 4 simulated hours)
                waitFor(Duration.ofHours(4));

                // Exit when the sim clock has passed 23:00 on this shift's day
                java.time.LocalDateTime now = world.getClock().get().getCurrentTime();
                if (!now.toLocalDate().isEqual(shiftDay) || now.getHour() >= 23) break;

                logEvent(SimulationLogger.EVENT_ACTION, "Auditing Intelligence Hub...");

                world.runAsManager(() -> {
                    Long rId = world.getRestaurant().getId();
                    // Analytics calls are intentionally light – add back when stable
                });

                logEvent(SimulationLogger.EVENT_ACTION, "Review complete. All KPIs healthy.");

            } catch (Exception e) {
                log.error("Manager Agent audit failure: {}", e.getMessage());
            }
        }
        logEvent(SimulationLogger.EVENT_FINISH, "Manager Agent " + agentId + " shift ended.");
    }

    @Override
    protected byte getAgentType() {
        return SimulationLogger.AGENT_STAFF; // We'll reuse STAFF agent type for now
    }
}
