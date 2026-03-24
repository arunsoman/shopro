package mls.sho.mplace.controller;

import mls.sho.mplace.config.MarketplaceUser;
import mls.sho.mplace.entity.FinancialTransaction;
import mls.sho.mplace.entity.Invoice;
import mls.sho.mplace.entity.SubOrder;
import mls.sho.mplace.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/supplier/finance")
@RequiredArgsConstructor
public class SupplierFinanceController {

    private final FinanceService financeService;

    public record TransactionDTO(String id, String date, String description, double amount, String status) {}
    public record InvoiceDTO(String id, String poId, String date, double amount, String status) {}
    public record FulfilledPODTO(String id, String restaurant, String date, double amount) {}

    @GetMapping("/stats")
    public FinanceService.SupplierFinanceStats getStats(@AuthenticationPrincipal MarketplaceUser user) {
        return financeService.getSupplierStats(user.getSupplierId());
    }

    @GetMapping("/transactions")
    public List<TransactionDTO> getTransactions(@AuthenticationPrincipal MarketplaceUser user) {
        return financeService.getAllTransactionsBySupplier(user.getSupplierId()).stream()
                .map(t -> new TransactionDTO(
                        t.getId().toString(),
                        t.getCreatedAt().toString(),
                        t.getDescription(),
                        t.getAmount().doubleValue(),
                        t.getStatus().name()
                )).toList();
    }

    @GetMapping("/pos/fulfilled")
    public List<FulfilledPODTO> getFulfilledPOs(@AuthenticationPrincipal MarketplaceUser user) {
        return financeService.getFulfilledSubOrders(user.getSupplierId()).stream()
                .map(s -> new FulfilledPODTO(
                        s.getId().toString(),
                        s.getPurchaseOrder().getRestaurant().getName(),
                        s.getActualDeliveryDate() != null ? s.getActualDeliveryDate().toString() : "N/A",
                        s.getTotalAmount().doubleValue()
                )).toList();
    }

    @GetMapping("/invoices")
    public List<InvoiceDTO> getInvoices(@AuthenticationPrincipal MarketplaceUser user) {
        return financeService.getSupplierInvoices(user.getSupplierId()).stream()
                .map(i -> new InvoiceDTO(
                        i.getId().toString(),
                        i.getSubOrder().getId().toString(),
                        i.getIssueDate().toString(),
                        i.getAmount().doubleValue(),
                        i.getStatus().name()
                )).toList();
    }

    @PostMapping("/invoices")
    public InvoiceDTO createInvoice(@RequestBody InvoiceRequest request, @AuthenticationPrincipal MarketplaceUser user) {
        // We could also verify that the subOrder belongs to this supplier
        Invoice invoice = financeService.createInvoice(UUID.fromString(request.subOrderId()), request.invoiceNumber());
        return new InvoiceDTO(
                invoice.getId().toString(),
                invoice.getSubOrder().getId().toString(),
                invoice.getIssueDate().toString(),
                invoice.getAmount().doubleValue(),
                invoice.getStatus().name()
        );
    }

    @GetMapping("/settlements")
    public List<TransactionDTO> getSettlements(@AuthenticationPrincipal MarketplaceUser user) {
        return financeService.getSupplierSettlements(user.getSupplierId()).stream()
                .map(t -> new TransactionDTO(
                        t.getId().toString(),
                        t.getCreatedAt().toString(),
                        "Settlement for SubOrder: " + (t.getSubOrder() != null ? t.getSubOrder().getId() : "N/A"),
                        t.getAmount().doubleValue(),
                        t.getStatus().name()
                )).toList();
    }

    public record InvoiceRequest(String subOrderId, String invoiceNumber) {}
}
