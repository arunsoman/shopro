package mls.sho.dms.application.simulator.agents;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import mls.sho.dms.application.simulator.core.SimulationLogger;
import mls.sho.dms.application.simulator.core.SimulationWorld;
import mls.sho.dms.application.simulator.events.SimulationEvents;
import mls.sho.dms.entity.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Models the lifecycle of a dining group:
 * Arrive -> Request Table -> Wait -> Seat -> Order -> Eat -> Pay -> Leave.
 */
public class CustomerAgent extends BaseAgent {
    private static final Logger log = LoggerFactory.getLogger(CustomerAgent.class);
    private final int groupSize;
    private final Random random = new Random();
    private final AtomicReference<DiningTable> assignedTable = new AtomicReference<>();
    private TableSession session;

    public CustomerAgent(long id, SimulationWorld world, int groupSize) {
        super(id, world);
        this.groupSize = groupSize;

        // Listen for table assignment from StaffAgents
        world.getEventBus().subscribe(event -> {
            if (event instanceof SimulationEvents.TableAssignedEvent assigned && assigned.getCustomerId() == agentId) {
                assignedTable.set(assigned.getTable());
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public void run() {
        logEvent(SimulationLogger.EVENT_START, "Arrived (Group: " + groupSize + ")");

        // 1. Request Table via the simulation event bus
        world.getEventBus().post(new SimulationEvents.TableRequestEvent(agentId, groupSize));
        
        // 2. Wait for Seating (with stochastic patience)
        // Use the sim clock directly for comparison to avoid epoch-millis arithmetic bugs.
        LocalDateTime waitStart = world.getClock().get().getCurrentTime();
        int patienceMins = 15 + random.nextInt(20);

        while (assignedTable.get() == null && running) {
            waitFor(Duration.ofMinutes(1));
            LocalDateTime now = world.getClock().get().getCurrentTime();
            long waitedMins = ChronoUnit.MINUTES.between(waitStart, now);
            if (waitedMins >= patienceMins || now.getHour() >= 22) {
                logEvent(SimulationLogger.EVENT_FINISH, "Balked (waited " + waitedMins + "m, limit " + patienceMins + "m)");
                return;
            }
        }

        if (!running) return;
        
        try {
            // 3. Seated & Start POS Session (API Call)
            DiningTable table = assignedTable.get();
            LocalDateTime currentTime = world.getClock().get().getCurrentTime();
            this.session = world.getPosController().openTable(world.getRestaurant().getId(), table.getId(), groupSize, currentTime);
            logEvent(SimulationLogger.EVENT_ACTION, "Seated at " + table.getTableNumber());

            // 4. Browsing Menu & Ordering
            waitFor(Duration.ofMinutes(2 + random.nextInt(6)));
            placeOrder();

            // 5. Eating Time (Stochastic duration)
            waitFor(Duration.ofMinutes(30 + random.nextInt(45)));

            // 6. Request Bill & Complete Session (API Call)
            world.getPosController().closeSession(world.getRestaurant().getId(), session.getId(), world.getClock().get().getCurrentTime());
            logEvent(SimulationLogger.EVENT_FINISH, "Settled bill. Table cleared.");

        } catch (Exception e) {
            log.error("Simulation error for Agent {}: {}", agentId, e.getMessage());
            logEvent(SimulationLogger.EVENT_FINISH, "Terminated due to error: " + e.getMessage());
        }
    }

    private void placeOrder() {
        List<MenuItem> menu = world.getHydratedMenu();
        if (menu.isEmpty()) {
            logEvent(SimulationLogger.EVENT_ACTION, "No menu items available to order.");
            return;
        }

        Order order = new Order();
        order.setRestaurant(world.getRestaurant());
        order.setSession(session);
        order.setOrderNumber("SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCreatedAt(world.getClock().get().getCurrentTime());
        
        // Select random items based on group size
        int itemsToOrder = 1 + random.nextInt(groupSize + 2);
        for (int i = 0; i < itemsToOrder; i++) {
            MenuItem mi = menu.get(random.nextInt(menu.size()));
            OrderLine line = new OrderLine();
            line.setOrder(order);
            line.setMenuItem(mi);
            line.setQuantity(1);
            line.setUnitPrice(mi.getSellPriceBuffer() != null ? mi.getSellPriceBuffer() : new java.math.BigDecimal("12.50"));
            line.setSubtotal(line.getUnitPrice());
            order.getLines().add(line);
        }
        
        try {
            Order savedOrder = world.getPosController().placeOrder(world.getRestaurant().getId(), order, order.getCreatedAt());
            logEvent(SimulationLogger.EVENT_ACTION, "Ordered " + itemsToOrder + " items (Order: " + order.getOrderNumber() + ")");
            
            // Notify the Kitchen that an order has been placed
            world.getEventBus().post(new SimulationEvents.OrderPlacedEvent(savedOrder));
            
            // Finalize Order (Simulation checkout via API)
            world.getPosController().updateOrderStatus(world.getRestaurant().getId(), savedOrder.getId(), Order.OrderStatus.PAID, order.getCreatedAt());
            
        } catch (Exception e) {
            log.error("Failed to place order: {}", e.getMessage());
        }
    }

    @Override
    protected byte getAgentType() {
        return SimulationLogger.AGENT_CUSTOMER;
    }
}
