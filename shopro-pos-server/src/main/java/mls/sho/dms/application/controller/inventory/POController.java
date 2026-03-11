package mls.sho.dms.application.controller.inventory;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.PurchaseOrderResponse;
import mls.sho.dms.application.dto.inventory.POStatusHistoryResponse;
import mls.sho.dms.application.service.inventory.POService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pos")
@RequiredArgsConstructor
public class POController {

    private final POService poService;
    private final mls.sho.dms.application.service.inventory.ReceivingService receivingService;

    @GetMapping
    public List<PurchaseOrderResponse> getAllPOs() {
        return poService.findAll();
    }

    @GetMapping("/{id}/history")
    public List<POStatusHistoryResponse> getPOHistory(@PathVariable UUID id) {
        return poService.getStatusHistory(id);
    }

    @PostMapping("/{id}/submit")
    @ResponseStatus(HttpStatus.OK)
    public void submitForApproval(@PathVariable UUID id) {
        poService.submitForApproval(id);
    }

    @PostMapping("/{id}/approve")
    @ResponseStatus(HttpStatus.OK)
    public void approveOrder(@PathVariable UUID id, @RequestParam UUID approverId) {
        poService.approveOrder(id, approverId);
    }

    @PostMapping("/{id}/reject")
    @ResponseStatus(HttpStatus.OK)
    public void rejectOrder(@PathVariable UUID id, @RequestParam UUID approverId, @RequestParam String reason) {
        poService.rejectOrder(id, approverId, reason);
    }

    @PostMapping("/{id}/send")
    @ResponseStatus(HttpStatus.OK)
    public void sendOrder(@PathVariable UUID id, @RequestParam UUID staffId) {
        poService.sendOrder(id, staffId);
    }

    @PostMapping("/{id}/receive")
    @ResponseStatus(HttpStatus.OK)
    public void receiveGoods(@PathVariable UUID id, @RequestBody mls.sho.dms.application.dto.inventory.ReceiveGoodsRequest request) {
        receivingService.receiveGoods(
            id, 
            request.getReceiverId(), 
            request.getReceivedQuantities(), 
            request.getDeliveryNoteReference(), 
            request.getNotes()
        );
    }

    @PostMapping("/{id}/match-invoice")
    @ResponseStatus(HttpStatus.OK)
    public void matchInvoice(@PathVariable UUID id, @RequestBody mls.sho.dms.application.dto.inventory.MatchInvoiceRequest request) {
        receivingService.processInvoiceAndMatch(
            id,
            request.getInvoiceNumber(),
            request.getInvoicedQuantities(),
            request.getInvoicedPrices(),
            request.getTotalAmount(),
            request.getTaxAmount()
        );
    }
}
