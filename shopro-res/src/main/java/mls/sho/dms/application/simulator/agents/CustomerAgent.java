package mls.sho.dms.application.simulator.agents;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.simulator.core.SimulationWorld;
import mls.sho.dms.entity.DiningTable;
import mls.sho.dms.entity.Order;
import mls.sho.dms.entity.TableSession;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Random;

/**
 * Customer agent - handles dining experience.
 * 
 * DISABLED FOR DTO REFACTORING - Python simulator handles all POS operations via REST API.
 */
@Component
@RequiredArgsConstructor
public class CustomerAgent {

    private final SimulationWorld world;
    private final Random random = new Random();
    private TableSession session;

    public void tick() {
        // DISABLED - Python simulator handles all operations via REST API
        // Internal Java simulator not used
    }

    public void arrive(DiningTable table, LocalDateTime currentTime) {
        // DISABLED - DTO refactoring - Python simulator uses REST API
        // this.session = world.getPosController().openTable(...);
        // logEvent(...)
        // waitFor(...)
        // Order order = buildOrder(...)
        // Order savedOrder = world.getPosController().placeOrder(...)
        // world.getPosController().updateOrderStatus(...)
        // world.getPosController().closeSession(...)
    }
}
