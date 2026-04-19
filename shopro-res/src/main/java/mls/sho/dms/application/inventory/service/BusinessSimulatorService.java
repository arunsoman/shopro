package mls.sho.dms.application.inventory.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Stub BusinessSimulatorService - disabled for DTO refactoring.
 * Python simulator uses REST API directly.
 */
@Service
@RequiredArgsConstructor
public class BusinessSimulatorService {
    
    public static class SimulationAudit {
        public void incOrders() {}
        public void addSales(java.math.BigDecimal amount) {}
    }
    
    public static class SimJobStatus {
        public static SimJobStatus IDLE = new SimJobStatus();
    }
    
    @Data
    public static class SimulationAuditReport {
        private java.math.BigDecimal revenue = java.math.BigDecimal.ZERO;
        private int orders = 0;
        private java.math.BigDecimal primeCostPct = java.math.BigDecimal.ZERO;
        private java.math.BigDecimal laborCostPct = java.math.BigDecimal.ZERO;
        private int totalDepletions = 0;
        private int inventoryVarianceCount = 0;
        private int attendanceAlerts = 0;
        private long traceableCount = 0;
        private int menuItemsWithRecipes = 0;
        private int totalRecipes = 0;
        private int totalIngredients = 0;
        private int totalSuppliers = 0;
        private java.math.BigDecimal actualCost = java.math.BigDecimal.ZERO;
        private java.math.BigDecimal actualQtyDepleted = java.math.BigDecimal.ZERO;
        private java.math.BigDecimal actualSales = java.math.BigDecimal.ZERO;
    }
    
    // Stub methods for compilation
    public void preLaunchSequence(Restaurant res, LocalDateTime date, SimulationAudit audit) {}
    public void simulateDay(Restaurant res, LocalDate date, SimulationAudit audit) {}
    public void checkAndReplenish(Restaurant res, LocalDateTime time, SimulationAudit audit, java.util.Random rng) {}
    public void generateWasteEvent(Restaurant res, java.util.List<?> menu, double[] weights, LocalDateTime time, java.util.Random rng, SimulationAudit audit) {}
    public void runPreLaunchSequence(Restaurant res, LocalDateTime date, SimulationAudit audit) { preLaunchSequence(res, date, audit); }
    public void runSimulationForDay(Restaurant res, LocalDate date, SimulationAudit audit) { simulateDay(res, date, audit); }
    public void generateWaste(Restaurant res, java.util.List<?> menu, double[] weights, LocalDateTime time, java.util.Random rng, SimulationAudit audit) { generateWasteEvent(res, menu, weights, time, rng, audit); }
    public void replenish(Restaurant res, LocalDateTime time, SimulationAudit audit, java.util.Random rng) { checkAndReplenish(res, time, audit, rng); }
    public SimJobStatus getStatus(Long restaurantId) { return SimJobStatus.IDLE; }
    public void stopSimulation(Long restaurantId) {}
    public void startSimulation(Long restaurantId, int days, LocalDate startDate) {}
    public void runSimulation(Long restaurantId, int days) {}
    public boolean isSimulationRunning(Long restaurantId) { return false; }
    public SimulationAuditReport getAuditReport(Long restaurantId) { return new SimulationAuditReport(); }
}
