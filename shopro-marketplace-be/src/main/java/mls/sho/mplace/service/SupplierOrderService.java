package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.entity.SubOrder;
import mls.sho.mplace.repository.SubOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierOrderService {

    private final SubOrderRepository subOrderRepository;

    public List<SubOrder> getOrdersForSupplier(MarketplaceSupplier supplier) {
        return subOrderRepository.findAllBySupplier_Id(supplier.getSupplierId());
    }

    @Transactional
    public void updateStatus(java.util.UUID id, SubOrder.SubOrderStatus status, MarketplaceSupplier supplier) {
        SubOrder order = subOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getSupplier().getId().equals(supplier.getSupplierId())) {
            throw new RuntimeException("Unauthorized: This order does not belong to your organization.");
        }

        order.setStatus(status);
        subOrderRepository.save(order);
    }
}
