package mls.sho.dms.application.simulator.core;

import lombok.extern.slf4j.Slf4j;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * A simple synchronous event bus for inter-agent communication during simulation.
 * This ensures that when a Customer requests a table, any available Waiter can respond.
 */
@Slf4j
public class SimulationEventBus {
    private final List<Consumer<Object>> subscribers = new CopyOnWriteArrayList<>();

    /**
     * Registers a listener for events.
     * @param handler The consumer to handle incoming events.
     */
    public void subscribe(Consumer<Object> handler) {
        subscribers.add(handler);
    }

    /**
     * Removes all subscribers. Call at the start of each simulated day to
     * prevent subscriber accumulation across days (memory leak / slowdown).
     */
    public void clear() {
        subscribers.clear();
    }

    /**
     * Synchronously broadcasts an event to all subscribers.
     * @param event The event object.
     */
    public void post(Object event) {
        subscribers.forEach(handler -> {
            try {
                handler.accept(event);
            } catch (Exception e) {
                log.error("Error handling simulation event: {}", e.getMessage(), e);
            }
        });
    }
}
