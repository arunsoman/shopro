package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import mls.sho.dms.application.inventory.repository.*;
import mls.sho.dms.application.pos.repository.*;
import mls.sho.dms.application.purchasing.repository.*;
import mls.sho.dms.application.kds.repository.*;
import mls.sho.dms.application.primecost.repository.EmployeeRepository;
import mls.sho.dms.application.kds.entity.Outlet;
import mls.sho.dms.application.kds.entity.KdsStation;
import mls.sho.dms.application.kds.entity.KdsDevice;
import mls.sho.dms.entity.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Privileged internal service for simulation lifecycle actions.
 * This class IS ALLOWED to use repositories for Reset/Audit/Bootstrap.
 */
@Service
@RequiredArgsConstructor
public class SimulatorInternalService {

    private static final Logger log = LoggerFactory.getLogger(SimulatorInternalService.class);

    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;
    private final OrderLineRepository orderLineRepository;
    private final TableSessionRepository sessionRepository;
    private final InventoryLedgerRepository ledgerRepository;
    private final InventoryActiveLotRepository lotRepository;
    private final InventoryWasteRepository wasteRepository;
    private final PurchaseOrderRepository poRepository;
    private final PurchaseOrderLineRepository poLineRepository;
    private final GoodsReceiptRepository grnRepository;
    
    private final OutletRepository kdsOutletRepository;
    private final KdsStationRepository kdsStationRepository;
    private final KdsDeviceRepository kdsDeviceRepository;
    private final KdsTicketRepository kdsTicketRepository;
    private final IngredientRepository ingredientRepository;

    @Transactional
    public void cleanup(Long restaurantId) {
        log.info("Purging historical records for restaurant: {}", restaurantId);
        wasteRepository.deleteByLedgerRestaurantId(restaurantId);
        ledgerRepository.deleteByRestaurantId(restaurantId);
        lotRepository.deleteByRestaurantId(restaurantId);
        orderLineRepository.deleteByOrderSessionTableRestaurantId(restaurantId);
        orderRepository.deleteByRestaurantId(restaurantId);
        sessionRepository.deleteByRestaurantId(restaurantId);
        grnRepository.deleteByRestaurantId(restaurantId);
        poLineRepository.deleteByPurchaseOrderRestaurantId(restaurantId);
        poRepository.deleteByRestaurantId(restaurantId);
        kdsTicketRepository.deleteAll();
        ingredientRepository.zeroOutStockByRestaurantId(restaurantId);
    }

    @Transactional(readOnly = true)
    public BusinessSimulatorService.SimulationAuditReport generateAuditReport(Long restaurantId) {
        LocalDateTime start = LocalDateTime.now().minusDays(31);
        LocalDateTime end = LocalDateTime.now().plusDays(1);

        BigDecimal actualSales = orderRepository.sumTotalSalesBetween(restaurantId, start, end);
        if (actualSales == null) actualSales = BigDecimal.ZERO;
        
        List<InventoryIngredientLedger> depletions = ledgerRepository.findAllByRestaurantIdAndDateAndTypes(restaurantId, start, end, 
                List.of(mls.sho.dms.common.enums.StockMovementType.DEPLETION));
        
        BigDecimal actualCost = depletions.stream().map(InventoryIngredientLedger::getTotalValue).reduce(BigDecimal.ZERO, BigDecimal::add).abs();
        BigDecimal actualQtyDepleted = depletions.stream().map(InventoryIngredientLedger::getQuantity).reduce(BigDecimal.ZERO, BigDecimal::add).abs();
        long traceableCount = depletions.stream().filter(d -> d.getGrnId() != null).count();

        BusinessSimulatorService.SimulationAuditReport report = new BusinessSimulatorService.SimulationAuditReport();
        report.setActualSales(actualSales);
        report.setActualCost(actualCost);
        report.setActualQtyDepleted(actualQtyDepleted);
        report.setTraceableCount(traceableCount);
        report.setTotalDepletions(depletions.size());
        
        return report;
    }

    @Transactional
    public void bootstrapKds(Long restaurantId) {
        Restaurant res = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Outlet outlet = kdsOutletRepository.findFirstByRestaurantId(res.getId())
                .orElseGet(() -> {
                    var o = new Outlet();
                    o.setRestaurantId(res.getId());
                    o.setName("Main Kitchen");
                    o.setSlug("main-" + res.getId());
                    o.setTimezone("UTC");
                    return kdsOutletRepository.save(o);
                });

        KdsStation station = kdsStationRepository.findFirstByOutletId(outlet.getId())
                .orElseGet(() -> {
                    var s = new KdsStation();
                    s.setOutlet(outlet);
                    s.setName("Grill Station");
                    s.setStationType(KdsStation.StationType.PREP);
                    return kdsStationRepository.save(s);
                });

        kdsDeviceRepository.findAll().stream()
                .filter(d -> d.getStation().getId().equals(station.getId()))
                .findFirst()
                .orElseGet(() -> {
                    var d = new KdsDevice();
                    d.setStation(station);
                    d.setName("SimDevice-1");
                    d.setDeviceType(KdsDevice.DeviceType.TABLET);
                    return kdsDeviceRepository.save(d);
                });
    }
}
