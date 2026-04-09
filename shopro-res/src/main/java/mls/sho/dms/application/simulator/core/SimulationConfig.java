package mls.sho.dms.application.simulator.core;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.List;
import java.util.Map;

/**
 * Maps simulation-config.yml properties to a Spring-managed bean.
 */
@Configuration
@ConfigurationProperties(prefix = "simulation")
public class SimulationConfig {
    private Temporal temporal = new Temporal();
    private Labor labor = new Labor();
    private Demand demand = new Demand();
    private Operational operational = new Operational();
    private SupplyChain supplyChain = new SupplyChain();
    private FloorPlan floorPlan = new FloorPlan();

    public Temporal getTemporal() { return temporal; }
    public void setTemporal(Temporal temporal) { this.temporal = temporal; }

    public Labor getLabor() { return labor; }
    public void setLabor(Labor labor) { this.labor = labor; }

    public Demand getDemand() { return demand; }
    public void setDemand(Demand demand) { this.demand = demand; }

    public Operational getOperational() { return operational; }
    public void setOperational(Operational operational) { this.operational = operational; }

    public SupplyChain getSupplyChain() { return supplyChain; }
    public void setSupplyChain(SupplyChain supplyChain) { this.supplyChain = supplyChain; }

    public FloorPlan getFloorPlan() { return floorPlan; }
    public void setFloorPlan(FloorPlan floorPlan) { this.floorPlan = floorPlan; }

    public static class Temporal {
        private int daysToSimulate = 30;
        private String openingTime = "09:00";
        private String closingTime = "23:00";
        private double timeScale = 3600.0;

        public int getDaysToSimulate() { return daysToSimulate; }
        public void setDaysToSimulate(int daysToSimulate) { this.daysToSimulate = daysToSimulate; }
        public String getOpeningTime() { return openingTime; }
        public void setOpeningTime(String openingTime) { this.openingTime = openingTime; }
        public String getClosingTime() { return closingTime; }
        public void setClosingTime(String closingTime) { this.closingTime = closingTime; }
        public double getTimeScale() { return timeScale; }
        public void setTimeScale(double timeScale) { this.timeScale = timeScale; }
    }

    public static class Labor {
        private int staffCount = 6;
        private int chefCount = 4;
        private double hourlyPayRate = 15.0;
        private double overtimeMultiplier = 1.5;

        public int getStaffCount() { return staffCount; }
        public void setStaffCount(int staffCount) { this.staffCount = staffCount; }
        public int getChefCount() { return chefCount; }
        public void setChefCount(int chefCount) { this.chefCount = chefCount; }
        public double getHourlyPayRate() { return hourlyPayRate; }
        public void setHourlyPayRate(double hourlyPayRate) { this.hourlyPayRate = hourlyPayRate; }
        public double getOvertimeMultiplier() { return overtimeMultiplier; }
        public void setOvertimeMultiplier(double overtimeMultiplier) { this.overtimeMultiplier = overtimeMultiplier; }
    }

    public static class Demand {
        private double baseArrivalRate = 12.0;
        private int patienceLimitMin = 20;
        private Map<Integer, Double> groupSizeDist;
        private List<PeakPeriod> peakPeriods;

        public double getBaseArrivalRate() { return baseArrivalRate; }
        public void setBaseArrivalRate(double baseArrivalRate) { this.baseArrivalRate = baseArrivalRate; }
        public int getPatienceLimitMin() { return patienceLimitMin; }
        public void setPatienceLimitMin(int patienceLimitMin) { this.patienceLimitMin = patienceLimitMin; }
        public Map<Integer, Double> getGroupSizeDist() { return groupSizeDist; }
        public void setGroupSizeDist(Map<Integer, Double> groupSizeDist) { this.groupSizeDist = groupSizeDist; }
        public List<PeakPeriod> getPeakPeriods() { return peakPeriods; }
        public void setPeakPeriods(List<PeakPeriod> peakPeriods) { this.peakPeriods = peakPeriods; }
    }

    public static class PeakPeriod {
        private String start;
        private String end;
        private double multiplier;

        public String getStart() { return start; }
        public void setStart(String start) { this.start = start; }
        public String getEnd() { return end; }
        public void setEnd(String end) { this.end = end; }
        public double getMultiplier() { return multiplier; }
        public void setMultiplier(double multiplier) { this.multiplier = multiplier; }
    }

    public static class Operational {
        private int prepTimeBaseSec = 480;
        private double wasteProbability = 0.02;
        private int tableTurnoverBuffer = 10;

        public int getPrepTimeBaseSec() { return prepTimeBaseSec; }
        public void setPrepTimeBaseSec(int prepTimeBaseSec) { this.prepTimeBaseSec = prepTimeBaseSec; }
        public double getWasteProbability() { return wasteProbability; }
        public void setWasteProbability(double wasteProbability) { this.wasteProbability = wasteProbability; }
        public int getTableTurnoverBuffer() { return tableTurnoverBuffer; }
        public void setTableTurnoverBuffer(int tableTurnoverBuffer) { this.tableTurnoverBuffer = tableTurnoverBuffer; }
    }

    public static class SupplyChain {
        private double itemMissProbability = 0.05;
        private double quantityShortfallMax = 0.20;
        private int deliveryDelayMaxMin = 120;

        public double getItemMissProbability() { return itemMissProbability; }
        public void setItemMissProbability(double itemMissProbability) { this.itemMissProbability = itemMissProbability; }
        public double getQuantityShortfallMax() { return quantityShortfallMax; }
        public void setQuantityShortfallMax(double quantityShortfallMax) { this.quantityShortfallMax = quantityShortfallMax; }
        public int getDeliveryDelayMaxMin() { return deliveryDelayMaxMin; }
        public void setDeliveryDelayMaxMin(int deliveryDelayMaxMin) { this.deliveryDelayMaxMin = deliveryDelayMaxMin; }
    }

    public static class FloorPlan {
        private boolean tableSharing = false;
        private List<TableConfig> tables;

        public boolean isTableSharing() { return tableSharing; }
        public void setTableSharing(boolean tableSharing) { this.tableSharing = tableSharing; }
        public List<TableConfig> getTables() { return tables; }
        public void setTables(List<TableConfig> tables) { this.tables = tables; }
    }

    public static class TableConfig {
        private int capacity;
        private int count;

        public int getCapacity() { return capacity; }
        public void setCapacity(int capacity) { this.capacity = capacity; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }
}
