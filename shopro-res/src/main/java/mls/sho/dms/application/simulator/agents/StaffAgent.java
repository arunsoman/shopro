package mls.sho.dms.application.simulator.agents;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import mls.sho.dms.application.simulator.core.SimulationLogger;
import mls.sho.dms.application.simulator.core.SimulationWorld;
import mls.sho.dms.application.simulator.events.SimulationEvents;
import mls.sho.dms.entity.DiningTable;
import java.time.Duration;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Models the behavior of a Staff Member (Waiter/FOH):
 * Monitors for Guest Arrivals -> Assigns Tables -> Coordinates Service.
 */
public class StaffAgent extends BaseAgent {
    private static final Logger log = LoggerFactory.getLogger(StaffAgent.class);
    private final Queue<SimulationEvents.TableRequestEvent> seatingQueue = new ConcurrentLinkedQueue<>();
    private final Long employeeId;
    private java.time.LocalDateTime shiftStartTime;

    public StaffAgent(long id, SimulationWorld world, Long employeeId) {
        super(id, world);
        this.employeeId = employeeId;
        
        // Subscribe to guest table requests
        world.getEventBus().subscribe(event -> {
            if (event instanceof SimulationEvents.TableRequestEvent request) {
                seatingQueue.add(request);
            }
        });
    }

    @Override
    public void run() {
        java.time.LocalDateTime clockInTime = world.getClock().get().getCurrentTime();
        java.time.LocalDate shiftDay = clockInTime.toLocalDate();

        // Digital Clock-In
        world.runAsManager(() -> {
            world.getLaborController().clockIn(
                world.getRestaurant().getId(),
                employeeId,
                clockInTime
            );
        });

        logEvent(SimulationLogger.EVENT_START, "Staff Agent " + agentId + " (Emp: " + employeeId + ") clocked in.");

        while (running) {
            SimulationEvents.TableRequestEvent request = seatingQueue.poll();
            if (request != null) {
                trySeating(request);
            } else {
                waitFor(Duration.ofMinutes(1));
            }

            // End-of-shift: stop once past 23:00 on the shift's calendar day
            java.time.LocalDateTime now = world.getClock().get().getCurrentTime();
            if (!now.toLocalDate().isEqual(shiftDay) || now.getHour() >= 23) {
                break;
            }
        }
        
        // Digital Clock-Out
        java.time.LocalDateTime clockOutTime = world.getClock().get().getCurrentTime();
        world.runAsManager(() -> {
            world.getLaborController().clockOut(
                world.getRestaurant().getId(), 
                employeeId, 
                clockOutTime
            );
        });
        
        logEvent(SimulationLogger.EVENT_FINISH, "Staff Agent " + agentId + " clocked out.");
    }

    private void trySeating(SimulationEvents.TableRequestEvent request) {
        List<DiningTable> tables = world.getPosController().getTables(world.getRestaurant().getId());
        
        DiningTable bestTable = tables.stream()
                .filter(t -> t.getStatus() == DiningTable.TableStatus.AVAILABLE)
                .filter(t -> t.getCapacity() >= request.getGroupSize())
                .sorted((a, b) -> a.getCapacity().compareTo(b.getCapacity()))
                .findFirst()
                .orElse(null);

        if (bestTable != null) {
            logEvent(SimulationLogger.EVENT_ACTION, "Seating Group (" + request.getGroupSize() + ") at Table " + bestTable.getTableNumber());
            world.getEventBus().post(new SimulationEvents.TableAssignedEvent(
                request.getRequestId(), 
                request.getCustomerId(), 
                bestTable
            ));
        } else {
            seatingQueue.add(request);
            waitFor(Duration.ofMinutes(2));
        }
    }

    @Override
    protected byte getAgentType() {
        return SimulationLogger.AGENT_STAFF;
    }
}
