package mls.sho.dms.application.controller.inventory;

import mls.sho.dms.application.service.inventory.ReceivingService;
import mls.sho.dms.application.service.inventory.dto.MatchInvoiceRequest;
import mls.sho.dms.application.service.inventory.dto.ReceiveGoodsRequest;
import mls.sho.dms.entity.inventory.GoodsReceiptNote;
import mls.sho.dms.entity.inventory.PurchaseOrder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/receiving")
public class ReceivingController {

    private final ReceivingService receivingService;

    public ReceivingController(ReceivingService receivingService) {
        this.receivingService = receivingService;
    }

    @PostMapping("/{poId}/grn")
    public ResponseEntity<GoodsReceiptNote> receiveGoods(
            @PathVariable UUID poId,
            @RequestBody ReceiveGoodsRequest request) {
        
        GoodsReceiptNote grn = receivingService.receiveGoods(
                poId,
                request.getReceiverId(),
                request.getReceivedQuantities(),
                request.getDeliveryNoteReference(),
                request.getNotes()
        );
        return ResponseEntity.ok(grn);
    }

    @PostMapping("/{poId}/invoice-match")
    public ResponseEntity<PurchaseOrder> processInvoiceAndMatch(
            @PathVariable UUID poId,
            @RequestBody MatchInvoiceRequest request) {
        
        PurchaseOrder matchedPo = receivingService.processInvoiceAndMatch(
                poId,
                request.getInvoiceNumber(),
                request.getInvoicedQuantities(),
                request.getInvoicedPrices(),
                request.getTotalAmount(),
                request.getTaxAmount()
        );
        return ResponseEntity.ok(matchedPo);
    }
}
