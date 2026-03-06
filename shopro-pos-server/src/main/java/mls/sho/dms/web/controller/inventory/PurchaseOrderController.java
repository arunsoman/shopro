package mls.sho.dms.web.controller.inventory;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.PurchaseOrderResponse;
import mls.sho.dms.application.service.inventory.POService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Orders", description = "Procurement management")
public class PurchaseOrderController {

    private final POService poService;

    @GetMapping
    public List<PurchaseOrderResponse> findAll() {
        return poService.findAll();
    }
}
