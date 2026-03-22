package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.DashboardMetricsDto;
import mls.sho.mplace.entity.PurchaseOrder;
import mls.sho.mplace.repository.PurchaseOrderRepository;
import mls.sho.mplace.repository.RestaurantRepository;
import mls.sho.mplace.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PurchaseOrderRepository poRepository;
    private final RestaurantRepository restaurantRepository;
    private final SupplierRepository supplierRepository;

    public DashboardMetricsDto getGlobalMetrics() {
        List<PurchaseOrder> orders = poRepository.findAll();
        BigDecimal totalVolume = orders.stream()
                .map(PurchaseOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardMetricsDto(
                "$" + totalVolume.toPlainString(),
                restaurantRepository.count(),
                supplierRepository.count(),
                0, // Placeholder
                "Optimal" // Placeholder
        );
    }
}
