package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.mplace.entity.*;
import mls.sho.mplace.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.transaction.support.TransactionTemplate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * midMind Multi-Route Engine
 * Automates PO splitting, vendor selection, and invisible middleman markup logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MidMindService {

    private final PurchaseOrderRepository poRepository;
    private final OrderItemRepository orderItemRepository;
    private final SubOrderRepository subOrderRepository;
    private final SupplyListRepository supplyListRepository;
    private final SupplierRepository supplierRepository;
    private final ProcurementPolicyRepository policyRepository;
    private final SystemSettingRepository settingRepository;
    private final FinanceService financeService;
    private final POActivityRepository activityRepository;
    private final TransactionTemplate transactionTemplate;

    private static final String ENGINE_STATUS_KEY = "midmind_engine_status";
    private static final BigDecimal DEFAULT_MARKUP = new BigDecimal("1.10"); // 10% markup

    public enum EngineStatus {
        RUNNING, STOPPED
    }

    public EngineStatus getStatus() {
        return settingRepository.findByKey(ENGINE_STATUS_KEY)
                .map(s -> EngineStatus.valueOf(s.getValue()))
                .orElse(EngineStatus.RUNNING);
    }

    private void updateEngineStatus(EngineStatus status) {
        updateSetting(ENGINE_STATUS_KEY, status.name());
        log.info("midMind: Engine status updated to {}.", status);
    }

    public void startEngine() {
        updateEngineStatus(EngineStatus.RUNNING);
    }

    public void stopEngine() {
        updateEngineStatus(EngineStatus.STOPPED);
    }

    public String getSetting(String key) {
        return settingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse("false");
    }

    public void updateSetting(String key, String value) {
        SystemSetting setting = settingRepository.findByKey(key)
                .orElse(new SystemSetting(key, value));
        setting.setValue(value);
        settingRepository.save(setting);
    }

    @Transactional
    public void routePurchaseOrder(UUID poId) {
        if (getStatus() == EngineStatus.STOPPED) {
            log.warn("midMind: Engine is STOPPED. Mapping for PO {} suspended.", poId);
            return;
        }

        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found: " + poId));

        if (po.getRoutingStatus() == PurchaseOrder.RoutingStatus.COMPLETED) {
            log.warn("midMind: PO {} already routed. Skipping.", poId);
            return;
        }

        po.setRoutingStatus(PurchaseOrder.RoutingStatus.PENDING_ROUTING);
        poRepository.saveAndFlush(po);
        recordActivity(po, "Queued for Routing", "Batch consolidation in progress", false, true);
        log.info("midMind: PO {} queued for batch consolidation.", poId);
    }

    public void routePendingOrders() {
        if (getStatus() == EngineStatus.STOPPED) {
            log.warn("midMind: Batch routing triggered but engine is STOPPED.");
            return;
        }

        List<PurchaseOrder> pendingPOs = poRepository.findAllByRoutingStatus(PurchaseOrder.RoutingStatus.PENDING_ROUTING);
        if (pendingPOs.isEmpty()) {
            log.info("midMind: No pending orders for consolidation.");
            return;
        }

        log.info("midMind: Starting optimized batch routing for {} orders.", pendingPOs.size());

        // 1. Bulk Fetch Supply Lists to avoid N+1
        Set<Integer> foodIds = new HashSet<>();
        pendingPOs.forEach(po -> po.getItems().forEach(item -> foodIds.add(item.getInventoryItem().getFood().getId())));

        List<SupplyList> allSupply = supplyListRepository.findAllByFoodIdIn(foodIds);
        Map<Integer, List<SupplyList>> supplyMap = allSupply.stream()
                .filter(SupplyList::getIsAvailable)
                .peek(s -> {
                    if (s.getPrice() == null) {
                        log.warn("midMind: NULL price received for Food ID {} from Supplier {}. Ignoring this offer.", 
                            s.getFoodId(), s.getSupplierId());
                    }
                })
                .filter(s -> s.getPrice() != null)
                .collect(java.util.stream.Collectors.groupingBy(SupplyList::getFoodId));

        // 2. Aggregate Demand & Calculate WAPP across the ENTIRE BATCH
        Map<Integer, BigDecimal> totalDemandMap = new HashMap<>();
        pendingPOs.forEach(po -> po.getItems().forEach(item -> {
            Integer fid = item.getInventoryItem().getFood().getId();
            BigDecimal current = totalDemandMap.getOrDefault(fid, BigDecimal.ZERO);
            totalDemandMap.put(fid, current.add(item.getQuantity()));
        }));

        Map<Integer, BigDecimal> foodIdToPriceBasis = new HashMap<>();
        boolean wappEnabled = "true".equalsIgnoreCase(getSetting("wapp_enabled"));

        for (Map.Entry<Integer, BigDecimal> demand : totalDemandMap.entrySet()) {
            if (wappEnabled) {
                foodIdToPriceBasis.put(demand.getKey(), calculateBatchWapp(demand.getKey(), demand.getValue(), supplyMap));
            } else {
                foodIdToPriceBasis.put(demand.getKey(), getCheapestPrice(demand.getKey(), supplyMap));
            }
        }

        // 3. Process each PO using optimized price basis
        Map<UUID, List<OrderItem>> globalAssignments = new HashMap<>();
        for (PurchaseOrder po : pendingPOs) {
            try {
                transactionTemplate.executeWithoutResult(status -> {
                    processSinglePO(po, foodIdToPriceBasis, supplyMap, globalAssignments);
                });
            } catch (Exception e) {
                log.error("midMind: Failed to route PO: {}. Isolating failure.", po.getId(), e);
                try {
                    transactionTemplate.executeWithoutResult(status -> {
                        updatePORoutingStatus(po, PurchaseOrder.RoutingStatus.FAILED);
                    });
                } catch (Exception nested) {
                    log.error("midMind: Fatal error marking PO {} as FAILED", po.getId(), nested);
                }
            }
        }

        log.info("midMind: Batch routing complete. Optimized across {} items.", globalAssignments.size());
    }

    private BigDecimal calculateBatchWapp(Integer foodId, BigDecimal totalNeeded, Map<Integer, List<SupplyList>> supplyMap) {
        List<SupplyList> available = new ArrayList<>(supplyMap.getOrDefault(foodId, Collections.emptyList()));
        available.removeIf(s -> s.getPrice() == null);
        available.sort(Comparator.comparing(SupplyList::getPrice));

        BigDecimal remaining = totalNeeded;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal fulfilled = BigDecimal.ZERO;
        List<String> auditTrail = new ArrayList<>();

        for (SupplyList supply : available) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal availableQty = BigDecimal.valueOf(supply.getStockQty() != null ? supply.getStockQty() : 0.0);
            BigDecimal take = remaining.min(availableQty);
            
            totalCost = totalCost.add(supply.getPrice().multiply(take));
            remaining = remaining.subtract(take);
            fulfilled = fulfilled.add(take);

            auditTrail.add(String.format("Supplier: %s, Price: %s, Qty: %s", supply.getSupplierId(), supply.getPrice(), take));

            if (take.compareTo(availableQty) == 0 && remaining.compareTo(BigDecimal.ZERO) > 0) {
                log.info("midMind: [STOCK DEPLETED] Supplier {} ran out of Food ID {}. Spilling over.", 
                    supply.getSupplierId(), foodId);
            }
        }

        BigDecimal wapp = fulfilled.compareTo(BigDecimal.ZERO) > 0 
            ? totalCost.divide(fulfilled, 4, RoundingMode.HALF_UP) 
            : BigDecimal.ZERO;

        if (auditTrail.size() > 1 && fulfilled.compareTo(BigDecimal.ZERO) > 0) {
            log.info("midMind: [WAPP ENGAGED] Food ID: {} | Total Demand: {} | WAPP: {} | Sources: {}", 
                foodId, totalNeeded, wapp, String.join(" | ", auditTrail));
        }

        return wapp;
    }

    private BigDecimal getCheapestPrice(Integer foodId, Map<Integer, List<SupplyList>> supplyMap) {
        return supplyMap.getOrDefault(foodId, Collections.emptyList()).stream()
                .filter(s -> s.getPrice() != null)
                .min(Comparator.comparing(SupplyList::getPrice))
                .map(SupplyList::getPrice)
                .orElse(BigDecimal.ZERO);
    }

    public void processSinglePO(PurchaseOrder po, Map<Integer, BigDecimal> foodIdToPriceBasis, Map<Integer, List<SupplyList>> supplyMap, Map<UUID, List<OrderItem>> globalAssignments) {
        po.setRoutingStatus(PurchaseOrder.RoutingStatus.IN_PROGRESS);
        poRepository.save(po);

        Map<UUID, List<OrderItem>> supplierToItems = new HashMap<>();

        for (OrderItem item : po.getItems()) {
            Integer foodId = item.getInventoryItem().getFood().getId();
            BigDecimal priceBasis = foodIdToPriceBasis.getOrDefault(foodId, BigDecimal.ZERO);
            
            if (priceBasis.compareTo(BigDecimal.ZERO) > 0) {
                item.setVendorPriceAtOrder(priceBasis);
                item.setMarkupAmount(calculateMarkup(priceBasis, item.getPriceAtOrder()));
                
                if (item.getMarkupAmount().compareTo(BigDecimal.ZERO) < 0) {
                    log.warn("midMind: NEGATIVE MARKUP for PO {} item {}. Basis: {}, CustomerPrice: {}", 
                        po.getId(), item.getItemName(), priceBasis, item.getPriceAtOrder());
                }

                // Supplier assignment
                supplyMap.getOrDefault(foodId, Collections.emptyList()).stream()
                    .findFirst()
                    .ifPresent(s -> {
                        supplierToItems.computeIfAbsent(s.getSupplierId(), k -> new ArrayList<>()).add(item);
                        globalAssignments.computeIfAbsent(s.getSupplierId(), k -> new ArrayList<>()).add(item);
                    });
            } else {
                log.warn("midMind: No stock/price available for {} in PO {}", item.getItemName(), po.getId());
            }
        }

        for (Map.Entry<UUID, List<OrderItem>> entry : supplierToItems.entrySet()) {
            createSubOrder(po, entry.getKey(), entry.getValue());
        }

        po.setRoutingStatus(PurchaseOrder.RoutingStatus.ROUTED);
        po.setStatus(PurchaseOrder.POStatus.SPLIT_COMPLETE);
        recordActivity(po, "Order Routed", "Order optimized and routed to chosen vendors", true, false);
        poRepository.saveAndFlush(po);
    }

    private void recordActivity(PurchaseOrder po, String status, String description, boolean completed, boolean isInternal) {
        POActivity activity = new POActivity();
        activity.setPurchaseOrder(po);
        activity.setStatus(status.toUpperCase());
        activity.setDescription(description);
        activity.setActivityDate(java.time.LocalDateTime.now());
        activity.setCompleted(completed);
        activity.setInternal(isInternal);
        activityRepository.save(activity);
        po.getActivities().add(activity);
        
        if (!isInternal) {
            po.setDisplayStatus(status.toUpperCase());
        }
    }

    private void updatePORoutingStatus(PurchaseOrder po, PurchaseOrder.RoutingStatus status) {
        po.setRoutingStatus(status);
        poRepository.save(po);
    }

    private BigDecimal calculateMarkup(BigDecimal vendorPrice, BigDecimal restaurantPrice) {
        if (restaurantPrice != null && vendorPrice != null) {
            return restaurantPrice.subtract(vendorPrice).max(BigDecimal.ZERO);
        }
        return BigDecimal.ZERO;
    }

    private void createSubOrder(PurchaseOrder po, UUID supplierId, List<OrderItem> items) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found: " + supplierId));

        SubOrder so = new SubOrder();
        so.setPurchaseOrder(po);
        so.setSupplier(supplier);
        so.setStatus(SubOrder.SubOrderStatus.ACK_PENDING);
        so.setAssignmentMode(SubOrder.AssignmentMode.DIRECT);
        so.setRoutingStrategy("MIDMIND_AUTO_BATCH_WAPP");
        
        BigDecimal totalVendorAmount = BigDecimal.ZERO;
        BigDecimal totalMarkup = BigDecimal.ZERO;

        for (OrderItem item : items) {
            item.setSubOrder(so);
            so.getItems().add(item); // Bidirectional sync
            BigDecimal itemVendorTotal = item.getVendorPriceAtOrder().multiply(item.getQuantity());
            totalVendorAmount = totalVendorAmount.add(itemVendorTotal);
            totalMarkup = totalMarkup.add(item.getMarkupAmount().multiply(item.getQuantity()));
        }

        so.setTotalAmount(totalVendorAmount);
        so.setMarkupAmount(totalMarkup);
        
        subOrderRepository.saveAndFlush(so);
        orderItemRepository.saveAllAndFlush(items);
    }

    @Transactional
    public void consolidateInvoices(UUID poId) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found: " + poId));

        List<SubOrder> subOrders = subOrderRepository.findAllByPurchaseOrder_Id(poId);
        boolean allReady = subOrders.stream().allMatch(so -> 
            so.getStatus() == SubOrder.SubOrderStatus.DELIVERED || 
            so.getStatus() == SubOrder.SubOrderStatus.PAID
        );

        if (!allReady) return;

        BigDecimal totalMarkup = subOrders.stream()
                .map(SubOrder::getMarkupAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        financeService.recordRestaurantReceivable(po, totalMarkup);
    }
}
