package mls.sho.dms.application.simulator.agents;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import mls.sho.dms.application.simulator.core.SimulationLogger;
import mls.sho.dms.application.simulator.core.SimulationWorld;
import java.time.Duration;

/**
 * Base class for all high-fidelity simulation agents. 
 * Designed to run in Java 21 Virtual Threads.
 */
public abstract class BaseAgent implements Runnable {
    protected static final Logger log = LoggerFactory.getLogger(BaseAgent.class);
    protected final long agentId;
    protected final SimulationWorld world;
    protected volatile boolean running = true;

    public BaseAgent(long agentId, SimulationWorld world) {
        this.agentId = agentId;
        this.world = world;
    }

    /**
     * Suspends the agent's virtual thread to simulate the passage of time.
     * The duration is scaled by the world's timeMultiplier.
     */
    protected void waitFor(Duration virtualDuration) {
        try {
            long realMillis = (long) (virtualDuration.toMillis() / world.getTimeMultiplier());
            if (realMillis > 0) {
                Thread.sleep(realMillis);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Records an activity for this agent in the binary simulation log.
     */
    protected void logEvent(byte eventType, String message) {
        world.log(getAgentType(), agentId, eventType, message);
    }

    protected abstract byte getAgentType();

    public void stop() {
        this.running = false;
        logEvent(SimulationLogger.EVENT_FINISH, "Agent stopped.");
    }
}
