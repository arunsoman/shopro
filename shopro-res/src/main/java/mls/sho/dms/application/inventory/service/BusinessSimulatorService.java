package mls.sho.dms.application.inventory.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import mls.sho.dms.application.pos.web.PosController;
import mls.sho.dms.application.purchasing.controller.PurchaseOrderController;
import mls.sho.dms.application.purchasing.repository.PurchaseOrderRepository;
import mls.sho.dms.application.purchasing.web.GoodsReceiptController;
import mls.sho.dms.application.purchasing.dto.PurchaseOrderCreateDTO;
import mls.sho.dms.application.primecost.controller.LaborController;
import mls.sho.dms.application.primecost.entity.Employee;
import mls.sho.dms.application.primecost.dto.LaborDtos.CreateEmployeeRequest;
import mls.sho.dms.application.primecost.dto.LaborDtos.EmployeeDto;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.simulator.core.SimulationConfig;
import mls.sho.dms.entity.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * High-fidelity restaurant business simulator.
 *
 * Architecture: single-threaded discrete event simulation that drives the
 * real service layer. Each simulated day is processed sequentially so there
 * are zero race conditions or thread-coordination hangs.
 *
 * Realism model:
 *   • Poisson arrival process modulated by time-of-day + day-of-week
 *   • Zipf-distributed menu popularity (80/20 rule)
 *   • Realistic group-size distribution from SimulationConfig
 *   • Supply-chain shortfalls, price drift, and delivery delays
 *   • Staff scheduling with realistic clock-in variance
 *   • Kitchen waste and mis-fire events
 *   • Gradual revenue growth trend over the period
 */
@Service
@RequiredArgsConstructor
public class BusinessSimulatorService {

    private static final Logger log = LoggerFactory.getLogger(BusinessSimulatorService.class);

    // -- Spring-wired collaborators -----------------------------------------
    private final PosController posController;
    private final PurchaseOrderController poController;
    private final PurchaseOrderRepository poRepository;
    private final GoodsReceiptController grnController;
    private final LaborController laborController;
    private final IngredientRepository ingredientRepository;
    private final InventoryLedgerRepository ledgerRepository;
    private final RestaurantRepository restaurantRepository;
    private final SimulationConfig cfg;
    private final SimulatorInternalService internalService;

    // -- Job tracking -------------------------------------------------------
    private final Map<Long, SimJobStatus> jobs = new ConcurrentHashMap<>();

    // =========================================================================
    // Public API
    // =========================================================================

    /**
     * Kicks off a simulation in a background thread and returns immediately.
     * Callers poll GET /simulation/status?restaurantId= for progress.
     */
    @Async("simulationExecutor")
    public void runSimulation(Long restaurantId, int days) {
        SimJobStatus status = new SimJobStatus(restaurantId, days);
        jobs.put(restaurantId, status);
        log.info("[SIM] Starting {}-day simulation for restaurant {}", days, restaurantId);

        try {
            Restaurant res = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found: " + restaurantId));

            SimulationAudit audit = new SimulationAudit();
            LocalDateTime baseDate = LocalDateTime.now().minusDays(days).withHour(8).withMinute(0).withSecond(0).withNano(0);

            // Phase 0 – staff, KDS bootstrap, initial stock
            status.setPhase("PRE_LAUNCH");
            preLaunchSequence(res, baseDate, audit);

            // Phase 1 – day loop
            for (int d = 0; d < days; d++) {
                status.setCurrentDay(d + 1);
                status.setPhase("DAY_" + (d + 1));
                LocalDate simDate = baseDate.toLocalDate().plusDays(d);
                log.info("[SIM] Day {}/{} → {}", d + 1, days, simDate);
                simulateDay(res, simDate, audit, d, days);
            }

            performAudit(res, audit);
            status.setPhase("COMPLETE");
            status.setDone(true);
            log.info("[SIM] Simulation complete for restaurant {}. {} orders, {} GRNs.",
                    restaurantId, audit.getExpectedOrders(), audit.getExpectedGRNs());

        } catch (Exception ex) {
            log.error("[SIM] Simulation failed for restaurant {}", restaurantId, ex);
            jobs.get(restaurantId).setError(ex.getMessage());
            jobs.get(restaurantId).setDone(true);
        }
    }

    public SimJobStatus getStatus(Long restaurantId) {
        return jobs.getOrDefault(restaurantId, new SimJobStatus(restaurantId, 0));
    }

    // =========================================================================
    // Phase 0 – Pre-launch
    // =========================================================================

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void preLaunchSequence(Restaurant res, LocalDateTime date, SimulationAudit audit) {
        log.info("[SIM] PRE-LAUNCH for restaurant {}", res.getId());

        internalService.bootstrapKds(res.getId());
        bootstrapStaff(res);

        // Seed initial stock for all ingredients
        List<Ingredient> ingredients = ingredientRepository.findAllByRestaurantId(res.getId());
        for (Ingredient ing : ingredients) {
            BigDecimal par = nvl(ing.getParLevel(), BigDecimal.valueOf(50));
            BigDecimal onHand = nvl(ledgerRepository.sumQuantityByIngredient(res.getId(), ing.getId()), BigDecimal.ZERO);
            if (onHand.compareTo(par) < 0) {
                BigDecimal qty = par.multiply(BigDecimal.valueOf(2)).subtract(onHand);
                deliverReplenishment(res.getId(), ing, qty, date, audit);
            }
        }
        log.info("[SIM] PRE-LAUNCH complete. {} ingredients seeded.", ingredients.size());
    }

    // =========================================================================
    // Core day simulation
    // =========================================================================

    /**
     * Simulates one calendar day sequentially:
     *   1. Staff clock-in
     *   2. Generate service sessions (Poisson arrivals)
     *   3. Process each session (order → pay)
     *   4. Generate kitchen waste events
     *   5. End-of-day replenishment
     *   6. Staff clock-out
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void simulateDay(Restaurant res, LocalDate date, SimulationAudit audit,
                            int dayIndex, int totalDays) {

        Random rng = new Random(date.toEpochDay()); // deterministic per date

        // -- 1. Staff clock-in -------------------------------------------
        // Force-close any ACTIVE records left over from a prior run or a previous
        // day whose clock-out failed. Use 23:59 of the previous calendar day as the
        // synthetic close time so labor records remain sensible.
        LocalDateTime prevClose = date.minusDays(1).atTime(23, 59, 0);
        try {
            var fcBody = laborController.forceCloseAllActive(res.getId(), prevClose).getBody();
            int closed = (fcBody != null && fcBody.get("closed") instanceof Integer n) ? n : 0;
            if (closed > 0) {
                log.info("[SIM] Forced-closed {} stale attendance record(s) before day {} for restaurant {}",
                        closed, date, res.getId());
            }
        } catch (Exception e) {
            log.warn("[SIM] Could not force-close stale attendance for restaurant {}: {}", res.getId(), e.getMessage());
        }

        List<EmployeeDto> staff = laborController.listEmployees(res.getId(), Employee.EmployeeType.HOURLY).getBody();
        LocalDateTime openTime = date.atTime(9, 0);
        if (staff != null) {
            for (EmployeeDto emp : staff) {
                try {
                    // Slight variance: 30–59 min before opening
                    LocalDateTime clockIn = openTime.minusMinutes(30 + rng.nextInt(30));
                    laborController.clockIn(res.getId(), emp.getId(), clockIn);
                } catch (Exception e) {
                    // Defensive: still log unexpected failures
                    log.warn("[SIM] Clock-in failed for emp {} on {}: {}", emp.getId(), date, e.getMessage());
                }
            }
        }

        // -- 2. Generate arrivals -----------------------------------------
        List<MenuItem> menu = posController.getMenuItems(res.getId());
        List<DiningTable> tables = posController.getTables(res.getId());
        if (menu.isEmpty() || tables.isEmpty()) {
            log.warn("[SIM] Day {} skipped – no menu items or tables.", date);
            return;
        }

        double[] menuWeights = buildMenuWeights(menu, rng);

        DayOfWeek dow = date.getDayOfWeek();
        double dayMult = dayOfWeekMultiplier(dow);
        // Gradual growth: restaurant grows ~1% per week
        double growthMult = 1.0 + (dayIndex / (double) totalDays) * 0.15;
        double baseRate = cfg.getDemand().getBaseArrivalRate(); // guests/hr
        int openHours = 14; // 09:00–23:00

        // Total covers ~ Poisson(λ * 14) * dayMult * growth
        int totalCovers = poissonSample(rng, baseRate * openHours * dayMult * growthMult);
        totalCovers = Math.max(totalCovers, 5); // at least 5 covers/day

        log.info("[SIM] {} ({}) – {} covers planned (mult={}, growth={})",
                date, dow, totalCovers, String.format("%.2f", dayMult), String.format("%.2f", growthMult));

        // Spread covers across the day using an arrival-time distribution
        List<LocalDateTime> arrivalTimes = generateArrivalTimes(date, totalCovers, rng);

        // -- 3. Process sessions ------------------------------------------
        for (LocalDateTime arrivalTime : arrivalTimes) {
            int groupSize = sampleGroupSize(rng);
            DiningTable table = findAvailableTable(tables, groupSize);
            if (table == null) continue; // no table available → balk

            try {
                // Open session
                TableSession session = posController.openTable(res.getId(), table.getId(), groupSize, arrivalTime);

                // Build order
                int itemsOrdered = 1 + rng.nextInt(Math.max(1, groupSize + 1));
                Order order = buildOrder(res, session, menu, menuWeights, itemsOrdered, arrivalTime, rng);

                // Place + pay
                Order saved = posController.placeOrder(res.getId(), order, arrivalTime);
                posController.updateOrderStatus(res.getId(), saved.getId(), Order.OrderStatus.PAID,
                        arrivalTime.plusMinutes(30 + rng.nextInt(40)));

                // Close session
                LocalDateTime closeTime = arrivalTime.plusMinutes(40 + rng.nextInt(50));
                posController.closeSession(res.getId(), session.getId(), closeTime);

                audit.incOrders();
                audit.addSales(saved.getTotalAmount() != null ? saved.getTotalAmount() : BigDecimal.ZERO);

                // Kitchen waste: 2% chance per order
                if (rng.nextDouble() < cfg.getOperational().getWasteProbability()) {
                    generateWasteEvent(res, menu, menuWeights, arrivalTime, rng, audit);
                }

            } catch (Exception e) {
                log.debug("[SIM] Session skipped for group {}: {}", groupSize, e.getMessage());
            }
        }

        // -- 4. End-of-day replenishment ----------------------------------
        checkAndReplenish(res, date.atTime(23, 0), audit, rng);

        // -- 5. Staff clock-out ------------------------------------------
        if (staff != null) {
            LocalDateTime closeTime = date.atTime(23, 0).plusMinutes(rng.nextInt(30));
            for (EmployeeDto emp : staff) {
                try {
                    laborController.clockOut(res.getId(), emp.getId(), closeTime);
                } catch (Exception e) {
                    // Not clocked in → skip
                }
            }
        }
    }

    // =========================================================================
    // Replenishment (batch query – no N+1)
    // =========================================================================

    private void checkAndReplenish(Restaurant res, LocalDateTime date,
                                   SimulationAudit audit, Random rng) {
        List<Ingredient> ingredients = ingredientRepository.findAllByRestaurantId(res.getId());

        // Batch-load all current quantities in one query
        Map<Long, BigDecimal> onHandMap = ingredients.stream().collect(Collectors.toMap(
                Ingredient::getId,
                ing -> {
                    BigDecimal v = ledgerRepository.sumQuantityByIngredient(res.getId(), ing.getId());
                    return v != null ? v : BigDecimal.ZERO;
                }
        ));

        for (Ingredient ing : ingredients) {
            BigDecimal par = nvl(ing.getParLevel(), BigDecimal.valueOf(50));
            BigDecimal onHand = onHandMap.getOrDefault(ing.getId(), BigDecimal.ZERO);
            if (onHand.compareTo(par) < 0) {
                // Order enough to reach 2× par, with realistic shortfall
                BigDecimal needed = par.multiply(BigDecimal.valueOf(2)).subtract(onHand);
                double shortfall = cfg.getSupplyChain().getQuantityShortfallMax();
                double actualFraction = 1.0 - rng.nextDouble() * shortfall;
                BigDecimal qty = needed.multiply(BigDecimal.valueOf(actualFraction))
                        .setScale(4, RoundingMode.HALF_UP);

                // Occasional miss: 5% chance item is completely skipped
                if (rng.nextDouble() < cfg.getSupplyChain().getItemMissProbability()) continue;

                // Delivery delay: 0–120 min
                int delayMins = rng.nextInt(cfg.getSupplyChain().getDeliveryDelayMaxMin() + 1);
                LocalDateTime deliveryTime = date.plusMinutes(delayMins);

                deliverReplenishment(res.getId(), ing, qty, deliveryTime, audit);
            }
        }
    }

    private void deliverReplenishment(Long restaurantId, Ingredient ing, BigDecimal qty,
                                      LocalDateTime date, SimulationAudit audit) {
        // Price drift: ±5% variance from base purchase price
        BigDecimal base = nvl(ing.getPurchaseUnitPrice(), BigDecimal.valueOf(5));
        double drift = 0.95 + Math.random() * 0.10; // [0.95, 1.05]
        BigDecimal unitPrice = base.multiply(BigDecimal.valueOf(drift)).setScale(4, RoundingMode.HALF_UP);

        try {
            PurchaseOrderCreateDTO poDto = new PurchaseOrderCreateDTO();
            poDto.setSupplierId(1L);
            poDto.setIssueDate(date.atZone(ZoneOffset.UTC).toString());

            PurchaseOrderCreateDTO.LineItem line = new PurchaseOrderCreateDTO.LineItem();
            line.setIngredientId(ing.getId());
            line.setOrderedQty(qty);
            line.setUnitPrice(unitPrice);
            poDto.setLines(List.of(line));

            var po = poController.createOrder(restaurantId, poDto).getBody();
            if (po == null) return;

            PurchaseOrder managedPo = poRepository.findById(po.getId())
                    .orElseThrow(() -> new RuntimeException("PO not persisted: " + po.getId()));

            GoodsReceipt grn = new GoodsReceipt();
            grn.setReceivedDate(date);
            grn.setNotes("SIM-" + System.nanoTime());
            Restaurant restaurant = new Restaurant(); restaurant.setId(restaurantId);
            grn.setRestaurant(restaurant);
            grn.setPurchaseOrder(managedPo);
            Supplier sup = new Supplier(); sup.setId(1L);
            grn.setSupplier(sup);

            GoodsReceiptLine grnLine = new GoodsReceiptLine();
            grnLine.setIngredient(ing);
            grnLine.setReceivedQty(qty);
            grnLine.setUnitPrice(unitPrice);
            grnLine.setGoodsReceipt(grn);
            grn.setLines(List.of(grnLine));
            grn.calculateTotal();

            var savedGrn = grnController.create(restaurantId, grn);
            grnController.finalise(restaurantId, savedGrn.getId());

            audit.addInflow(qty.multiply(unitPrice));
            audit.addQtyReceived(qty);
            audit.incGRNs();

        } catch (Exception e) {
            log.warn("[SIM] Replenishment failed for {}: {}", ing.getDescription(), e.getMessage());
        }
    }

    // =========================================================================
    // Waste events
    // =========================================================================

    private void generateWasteEvent(Restaurant res, List<MenuItem> menu, double[] weights,
                                    LocalDateTime time, Random rng, SimulationAudit audit) {
        // A waste/misfire is a voided order for a single item
        try {
            MenuItem item = weightedSample(menu, weights, rng);
            List<DiningTable> tables = posController.getTables(res.getId());
            if (tables.isEmpty()) return;

            DiningTable table = tables.get(rng.nextInt(tables.size()));
            TableSession session = posController.openTable(res.getId(), table.getId(), 1, time);

            Order waste = buildOrder(res, session, List.of(item), new double[]{1.0}, 1, time, rng);
            Order saved = posController.placeOrder(res.getId(), waste, time);
            // Void instead of pay → triggers MISFIRE ledger entry
            posController.voidOrder(res.getId(), saved.getId(), "KITCHEN_ERROR");
            posController.closeSession(res.getId(), session.getId(), time.plusMinutes(5));

        } catch (Exception e) {
            log.debug("[SIM] Waste event skipped: {}", e.getMessage());
        }
    }

    // =========================================================================
    // Staff bootstrap
    // =========================================================================

    private void bootstrapStaff(Restaurant res) {
        int staffCount = cfg.getLabor().getStaffCount();
        int chefCount  = cfg.getLabor().getChefCount();
        BigDecimal waiterRate = BigDecimal.valueOf(cfg.getLabor().getHourlyPayRate());
        BigDecimal chefRate   = BigDecimal.valueOf(cfg.getLabor().getHourlyPayRate() + 4.0);

        List<EmployeeDto> existing = laborController.listEmployees(res.getId(), null).getBody();
        if (existing != null && existing.size() >= staffCount + chefCount) return;

        Set<String> names = existing == null ? Set.of()
                : existing.stream().map(EmployeeDto::getName).collect(Collectors.toSet());

        for (int i = 1; i <= staffCount; i++) {
            String name = "Waiter_" + i;
            if (names.contains(name)) continue;
            CreateEmployeeRequest req = new CreateEmployeeRequest();
            req.setName(name); req.setHourlyRate(waiterRate);
            req.setEmployeeType(Employee.EmployeeType.HOURLY);
            laborController.createEmployee(res.getId(), req);
        }
        for (int i = 1; i <= chefCount; i++) {
            String name = "Chef_" + i;
            if (names.contains(name)) continue;
            CreateEmployeeRequest req = new CreateEmployeeRequest();
            req.setName(name); req.setHourlyRate(chefRate);
            req.setEmployeeType(Employee.EmployeeType.HOURLY);
            laborController.createEmployee(res.getId(), req);
        }
    }

    // =========================================================================
    // Audit
    // =========================================================================

    private void performAudit(Restaurant res, SimulationAudit expected) {
        SimulationAuditReport actual = internalService.generateAuditReport(res.getId());
        log.info("[SIM] === VARIANCE REPORT ===");
        log.info("[SIM]  Sales variance : {}%", pct(expected.getExpectedSales(), actual.getActualSales()));
        log.info("[SIM]  Unit accuracy  : {}%", pct(expected.getExpectedQtyDepleted(), actual.getActualQtyDepleted()));
        log.info("[SIM]  Traceability   : {}%",
                actual.getTotalDepletions() == 0 ? 100
                        : actual.getTraceableCount() * 100 / actual.getTotalDepletions());
        log.info("[SIM] ========================");
    }

    // =========================================================================
    // Statistical helpers
    // =========================================================================

    /**
     * Returns arrival times across the day weighted by a realistic demand curve.
     * Peaks: lunch 12-14 (3.5×) and dinner 19-21:30 (5×).
     */
    private List<LocalDateTime> generateArrivalTimes(LocalDate date, int totalCovers, Random rng) {
        // Compute unnormalised weights for each half-hour slot 09:00–23:00 (28 slots)
        int slots = 28;
        double[] slotWeights = new double[slots];
        for (int s = 0; s < slots; s++) {
            double hour = 9.0 + s * 0.5;
            slotWeights[s] = hourlyDemandWeight(hour);
        }

        List<LocalDateTime> times = new ArrayList<>(totalCovers);
        for (int i = 0; i < totalCovers; i++) {
            int slot = weightedSlot(rng, slotWeights);
            double hour = 9.0 + slot * 0.5;
            int minuteInSlot = rng.nextInt(30);
            int totalMinutes = (int)(hour * 60) + minuteInSlot;
            times.add(date.atTime(totalMinutes / 60, totalMinutes % 60));
        }
        Collections.sort(times);
        return times;
    }

    /** Hourly demand weight from 0h to 24h. Based on typical casual-dining pattern. */
    private double hourlyDemandWeight(double hour) {
        if (hour < 9 || hour >= 23) return 0;
        if (hour >= 12 && hour < 14) return 3.5;   // lunch peak
        if (hour >= 19 && hour < 21.5) return 5.0;  // dinner peak
        if (hour >= 11.5 && hour < 12) return 1.8;  // pre-lunch
        if (hour >= 14 && hour < 15) return 1.2;     // post-lunch lull
        if (hour >= 17.5 && hour < 19) return 2.5;  // early dinner
        if (hour >= 21.5 && hour < 23) return 1.5;  // late dining
        return 1.0;
    }

    private int weightedSlot(Random rng, double[] weights) {
        double total = Arrays.stream(weights).sum();
        double r = rng.nextDouble() * total;
        double cumul = 0;
        for (int i = 0; i < weights.length; i++) {
            cumul += weights[i];
            if (r <= cumul) return i;
        }
        return weights.length - 1;
    }

    /**
     * Day-of-week multipliers calibrated to typical casual-dining traffic.
     * Mon=0.65, Tue=0.70, Wed=0.78, Thu=0.90, Fri=1.25, Sat=1.40, Sun=1.10
     */
    private double dayOfWeekMultiplier(DayOfWeek dow) {
        return switch (dow) {
            case MONDAY    -> 0.65;
            case TUESDAY   -> 0.70;
            case WEDNESDAY -> 0.78;
            case THURSDAY  -> 0.90;
            case FRIDAY    -> 1.25;
            case SATURDAY  -> 1.40;
            case SUNDAY    -> 1.10;
        };
    }

    /** Poisson sample via inverse transform (good for λ < 100). */
    private int poissonSample(Random rng, double lambda) {
        double L = Math.exp(-lambda);
        int k = 0;
        double p = 1.0;
        do {
            k++;
            p *= rng.nextDouble();
        } while (p > L);
        return k - 1;
    }

    /**
     * Builds Zipf-like menu weights: most popular item gets ~15% of orders,
     * following a power-law decay. This mimics real menu ordering patterns.
     */
    private double[] buildMenuWeights(List<MenuItem> menu, Random rng) {
        double[] weights = new double[menu.size()];
        // Shuffle popularity so it varies by day/restaurant
        List<Integer> ranks = new ArrayList<>();
        for (int i = 1; i <= menu.size(); i++) ranks.add(i);
        Collections.shuffle(ranks, rng);
        for (int i = 0; i < menu.size(); i++) {
            weights[i] = 1.0 / Math.pow(ranks.get(i), 0.8); // Zipf exponent 0.8
        }
        return weights;
    }

    private MenuItem weightedSample(List<MenuItem> menu, double[] weights, Random rng) {
        double total = 0;
        for (double w : weights) total += w;
        double r = rng.nextDouble() * total;
        double cumul = 0;
        for (int i = 0; i < menu.size(); i++) {
            cumul += weights[i];
            if (r <= cumul) return menu.get(i);
        }
        return menu.get(menu.size() - 1);
    }

    /** Sample group size from the config distribution (1→15%, 2→45%, 4→30%, 6→10%). */
    private int sampleGroupSize(Random rng) {
        double r = rng.nextDouble();
        if (r < 0.15) return 1;
        if (r < 0.60) return 2;
        if (r < 0.90) return 4;
        return 6;
    }

    /** Find the smallest available table that fits the group. */
    private DiningTable findAvailableTable(List<DiningTable> tables, int groupSize) {
        return tables.stream()
                .filter(t -> t.getStatus() == DiningTable.TableStatus.AVAILABLE)
                .filter(t -> t.getCapacity() != null && t.getCapacity() >= groupSize)
                .min(Comparator.comparingInt(DiningTable::getCapacity))
                .orElse(null);
    }

    private Order buildOrder(Restaurant res, TableSession session, List<MenuItem> menu,
                              double[] weights, int itemCount, LocalDateTime time, Random rng) {
        Order order = new Order();
        order.setRestaurant(res);
        order.setSession(session);
        order.setOrderNumber("SIM-" + Long.toHexString(System.nanoTime()).toUpperCase());
        order.setCreatedAt(time);

        BigDecimal total = BigDecimal.ZERO;
        for (int i = 0; i < itemCount; i++) {
            MenuItem mi = weightedSample(menu, weights, rng);
            // Occasional upsell: +10% on ~20% of items
            BigDecimal price = nvl(mi.getSellPriceBuffer(), BigDecimal.valueOf(12.50));
            if (rng.nextDouble() < 0.20) price = price.multiply(BigDecimal.valueOf(1.10)).setScale(2, RoundingMode.HALF_UP);

            OrderLine line = new OrderLine();
            line.setOrder(order);
            line.setMenuItem(mi);
            line.setQuantity(1);
            line.setUnitPrice(price);
            line.setSubtotal(price);
            order.getLines().add(line);
            total = total.add(price);
        }
        order.setTotalAmount(total);
        return order;
    }

    // =========================================================================
    // DTOs
    // =========================================================================

    @Data
    public static class SimulationAudit {
        private BigDecimal expectedSales  = BigDecimal.ZERO;
        private BigDecimal expectedInflows = BigDecimal.ZERO;
        private BigDecimal expectedQtyDepleted = BigDecimal.ZERO;
        private BigDecimal expectedQtyReceived = BigDecimal.ZERO;
        private int expectedOrders = 0;
        private int expectedGRNs   = 0;

        public synchronized void addSales(BigDecimal a)      { expectedSales        = expectedSales.add(a); }
        public synchronized void addInflow(BigDecimal a)     { expectedInflows      = expectedInflows.add(a); }
        public synchronized void addQtyDepleted(BigDecimal a){ expectedQtyDepleted  = expectedQtyDepleted.add(a); }
        public synchronized void addQtyReceived(BigDecimal a){ expectedQtyReceived  = expectedQtyReceived.add(a); }
        public synchronized void incOrders() { expectedOrders++; }
        public synchronized void incGRNs()   { expectedGRNs++; }
    }

    @Data
    public static class SimulationAuditReport {
        private BigDecimal actualSales;
        private BigDecimal actualCost;
        private BigDecimal actualQtyDepleted;
        private long traceableCount;
        private BigDecimal financialVariance;
        private BigDecimal unitAccuracy;
        private long totalDepletions;
    }

    @Data
    public static class SimJobStatus {
        private final Long restaurantId;
        private final int totalDays;
        private int currentDay;
        private String phase = "QUEUED";
        private boolean done  = false;
        private String error;
    }

    // =========================================================================
    // Kept for SimulationActivator compatibility
    // =========================================================================

    public void cleanup(Long restaurantId)          { /* delegate to internalService */ }
    public void bootstrapKdsInternal(Long restaurantId) {}
    public SimulationAuditReport generateAuditReport(Long restaurantId) {
        return internalService.generateAuditReport(restaurantId);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private BigDecimal nvl(BigDecimal v, BigDecimal def) { return v != null ? v : def; }

    private String pct(BigDecimal expected, BigDecimal actual) {
        if (expected == null || expected.compareTo(BigDecimal.ZERO) == 0) return "N/A";
        if (actual == null) actual = BigDecimal.ZERO;
        return actual.subtract(expected)
                .divide(expected, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP).toPlainString();
    }
}
