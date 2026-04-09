package mls.sho.dms.application.simulator.events;

import mls.sho.dms.entity.DiningTable;
import mls.sho.dms.entity.Order;
import java.util.UUID;

/**
 * Events for inter-agent communication in the simulator.
 */
public class SimulationEvents {

    /**
     * Triggered when a guest group arrives and needs a table.
     */
    public static class TableRequestEvent {
        private final long customerId;
        private final int groupSize;
        private final String requestId;

        public TableRequestEvent(long customerId, int groupSize) {
            this.customerId = customerId;
            this.groupSize = groupSize;
            this.requestId = UUID.randomUUID().toString();
        }

        public long getCustomerId() { return customerId; }
        public int getGroupSize() { return groupSize; }
        public String getRequestId() { return requestId; }
    }

    /**
     * Triggered by a StaffAgent when a table is found and assigned to a customer.
     */
    public static class TableAssignedEvent {
        private final String requestId;
        private final long customerId;
        private final DiningTable table;

        public TableAssignedEvent(String requestId, long customerId, DiningTable table) {
            this.requestId = requestId;
            this.customerId = customerId;
            this.table = table;
        }

        public String getRequestId() { return requestId; }
        public long getCustomerId() { return customerId; }
        public DiningTable getTable() { return table; }
    }

    /**
     * Triggered when a new order is placed in the POS.
     */
    public static class OrderPlacedEvent {
        private final Order order;

        public OrderPlacedEvent(Order order) {
            this.order = order;
        }

        public Order getOrder() { return order; }
    }

    /**
     * Triggered by a KitchenAgent when an order is ready for service.
     */
    public static class OrderReadyEvent {
        private final Order order;

        public OrderReadyEvent(Order order) {
            this.order = order;
        }

        public Order getOrder() { return order; }
    }

    /**
     * Triggered when a customer is ready for the bill.
     */
    public static class BillRequestedEvent {
        private final long customerId;
        private final Long sessionId;

        public BillRequestedEvent(long customerId, Long sessionId) {
            this.customerId = customerId;
            this.sessionId = sessionId;
        }

        public long getCustomerId() { return customerId; }
        public Long getSessionId() { return sessionId; }
    }
}
