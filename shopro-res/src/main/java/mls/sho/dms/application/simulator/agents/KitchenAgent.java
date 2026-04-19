package mls.sho.dms.application.simulator.agents;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import mls.sho.dms.application.simulator.core.SimulationLogger;
import mls.sho.dms.application.simulator.core.SimulationWorld;
import mls.sho.dms.application.simulator.events.SimulationEvents;
import mls.sho.dms.entity.Order;
import mls.sho.dms.entity.OrderLine;
import java.time.Duration;
import java.util.List;
import java.util.Random;
import mls.sho.dms.application.kds.dto.KdsDtos.*;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.UUID;

/**
 * Models the Kitchen Staff:
 * Listens for new orders -> Simulates preparation -> Depletes inventory -> Marks ready.
 */
public class KitchenAgent extends BaseAgent {
    private static final Logger log = LoggerFactory.getLogger(KitchenAgent.class);
    private final Random random = new Random();
    private final Long stationId;
    private final Long deviceId;
    private final UUID staffId;
    private java.time.LocalDateTime shiftStartTime;

    public KitchenAgent(long id, SimulationWorld world, Long stationId, Long deviceId, UUID staffId) {
        super(id, world);
        this.stationId = stationId;
        this.deviceId = deviceId;
        this.staffId = staffId;
    }

    @Override
    public void run() {
        java.time.LocalDateTime clockInTime = world.getClock().get().getCurrentTime();
        java.time.LocalDate shiftDay = clockInTime.toLocalDate();

        // Digital Clock-In
        world.runAsManager(() -> {
            world.getLaborController().clockIn(
                world.getRestaurant().getId(),
                staffId,
                clockInTime
            );
        });

        logEvent(SimulationLogger.EVENT_START, "Kitchen Agent " + agentId + " (Staff: " + staffId + ") at station " + stationId + " clocked in.");

        while (running) {
            try {
                // Periodically poll the KDS Station Queue via Controller
                world.runAsKdsDevice(stationId, "SIM_CHEF_" + agentId, () -> {
                    var response = world.getStationKdsController().getQueue(
                        world.getRestaurant().getId(),
                        stationId,
                        new mls.sho.dms.application.kds.security.KdsDevicePrincipal(deviceId, "SIM_DEVICE")
                    );

                    StationQueuePageDto page = response.getBody();
                    if (page != null && page.getTickets() != null) {
                        for (StationTicketDto ticket : page.getTickets()) {
                            processTicket(ticket);
                        }
                    }
                });

                waitFor(Duration.ofMinutes(1));

                // End-of-shift: stop once the sim clock has passed 23:00 on the shift's calendar day
                java.time.LocalDateTime now = world.getClock().get().getCurrentTime();
                if (!now.toLocalDate().isEqual(shiftDay) || now.getHour() >= 23) {
                    break;
                }
            } catch (Exception e) {
                log.error("Kitchen agent error: {}", e.getMessage());
                waitFor(Duration.ofMinutes(5));
            }
        }

        // Digital Clock-Out
        java.time.LocalDateTime clockOutTime = world.getClock().get().getCurrentTime();
        world.runAsManager(() -> {
            world.getLaborController().clockOut(
                world.getRestaurant().getId(), 
                staffId, 
                clockOutTime
            );
        });

        logEvent(SimulationLogger.EVENT_FINISH, "Kitchen Agent " + agentId + " clocked out.");
    }

    private void processTicket(StationTicketDto ticket) {
        for (StationTicketItemDto item : ticket.getItems()) {
            if ("NEW".equals(item.getStatus())) {
                // Mark item as STARTED (API Call)
                world.runAsKdsDevice(stationId, "SIM_CHEF", () -> {
                    world.getStationKdsController().startItem(
                        world.getRestaurant().getId(), 
                        stationId, 
                        item.getId(), 
                        new mls.sho.dms.application.kds.security.KdsDevicePrincipal(deviceId, "SIM_DEVICE")
                    );
                });
                logEvent(SimulationLogger.EVENT_ACTION, "Cooking " + item.getName() + " (Ticket: " + ticket.getTicketNumber() + ")");
                
                // Simulate high-fidelity prep time
                Integer prepTime = item.getPrepTimeMinutes();
                if (prepTime == null) {
                    prepTime = world.getConfig().getOperational().getPrepTimeBaseSec() / 60;
                }
                waitFor(Duration.ofMinutes(prepTime));

                // Mark item as BUMPED (API Call)
                world.runAsKdsDevice(stationId, "SIM_CHEF", () -> {
                    world.getStationKdsController().bumpItem(
                        world.getRestaurant().getId(), 
                        stationId, 
                        item.getId(), 
                        new mls.sho.dms.application.kds.security.KdsDevicePrincipal(deviceId, "SIM_DEVICE")
                    );
                });
                logEvent(SimulationLogger.EVENT_ACTION, "Bumped " + item.getName());
            }
        }
    }

    @Override
    protected byte getAgentType() {
        return SimulationLogger.AGENT_KITCHEN;
    }
}
