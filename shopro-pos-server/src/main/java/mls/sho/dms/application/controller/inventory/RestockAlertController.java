package mls.sho.dms.application.controller.inventory;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.RestockAlertResponse;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrderStatus;
import mls.sho.dms.entity.inventory.procurement.RFQ;
import mls.sho.dms.entity.inventory.procurement.RfqStatus;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.RFQRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/inventory/alerts")
@RequiredArgsConstructor
public class RestockAlertController {

    private final PurchaseOrderRepository poRepository;
    private final RFQRepository rfqRepository;

    @GetMapping("/restock")
    public List<RestockAlertResponse> getRestockAlerts() {
        List<RestockAlertResponse> alerts = new ArrayList<>();

        // 1. Failed RFQs (No bids)
        List<RFQ> failedRfqs = rfqRepository.findByStatus(RfqStatus.FAILED);
        alerts.addAll(failedRfqs.stream().map(rfq -> RestockAlertResponse.builder()
                .id(rfq.getId().toString())
                .type("RFQ")
                .ingredientName(rfq.getIngredient().getName())
                .supplierName("Multiple (Bidding)")
                .status("FAILED")
                .createdAt(rfq.getCreatedAt())
                .stalledSince(rfq.getBidDeadline())
                .severity("MEDIUM")
                .actionRequired("Retry Bidding or Direct Source")
                .build()).collect(Collectors.toList()));

        // 2. Stalled POs (Sent but not acknowledged within 24h)
        Instant cutoff = Instant.now().minus(24, ChronoUnit.HOURS);
        List<PurchaseOrder> stalledPos = poRepository.findByStatusAndSentAtBefore(PurchaseOrderStatus.SENT, cutoff);
        alerts.addAll(stalledPos.stream().map(po -> RestockAlertResponse.builder()
                .id(po.getId().toString())
                .type("PO")
                .ingredientName(po.getLines().isEmpty() ? "Unknown" : po.getLines().get(0).getIngredient().getName())
                .supplierName(po.getSupplier() != null ? po.getSupplier().getCompanyName() : "Unknown")
                .status("SENT (STALLED)")
                .createdAt(po.getCreatedAt())
                .stalledSince(po.getSentAt())
                .severity("HIGH")
                .actionRequired("Contact Supplier / Manual Follow-up")
                .build()).collect(Collectors.toList()));

        return alerts;
    }
}
