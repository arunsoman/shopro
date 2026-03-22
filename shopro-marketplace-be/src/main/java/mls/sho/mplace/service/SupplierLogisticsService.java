package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.entity.SubOrder;
import mls.sho.mplace.repository.SubOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierLogisticsService {

    private final SubOrderRepository subOrderRepository;

    public record DeliveryTracking(String id, String orderId, String vehicle, String driver, String status, String eta) {}

    public List<DeliveryTracking> getActiveDeliveries(MarketplaceSupplier supplier) {
        List<SubOrder> orders = subOrderRepository.findAllBySupplier_Id(supplier.getSupplierId());
        
        return orders.stream()
                .filter(o -> o.getStatus() == SubOrder.SubOrderStatus.SHIPPED || o.getStatus() == SubOrder.SubOrderStatus.PREPARING)
                .map(o -> new DeliveryTracking(
                        "TRK-" + o.getId(),
                        "SO-" + o.getId(),
                        "MH-01-AX-9021", // Mock for now
                        supplier.getFullName(),
                        o.getStatus() == SubOrder.SubOrderStatus.SHIPPED ? "ON_ROUTE" : "DISPATCHED",
                        "20:00"
                ))
                .collect(Collectors.toList());
    }

    public List<Map<String, String>> getVehicles(MarketplaceSupplier supplier) {
        // Mock data for fleet management
        return List.of(
            Map.of("id", "V-1", "plate", "MH-01-AX-9021", "type", "Refrigerated Truck", "status", "BUSY"),
            Map.of("id", "V-2", "plate", "MH-04-BB-1122", "type", "Box Van", "status", "AVAILABLE")
        );
    }
}
