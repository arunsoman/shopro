package mls.sho.dms.application.purchasing.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.service.IngredientService;
import mls.sho.dms.application.purchasing.service.PurchaseInvoiceService;
import mls.sho.dms.application.purchasing.service.SupplierService;
import mls.sho.dms.application.purchasing.dto.PurchaseInvoiceDTO;
import mls.sho.dms.application.purchasing.dto.SupplierDTO;
import mls.sho.dms.application.purchasing.dto.WeeklySummaryDTO;
import mls.sho.dms.entity.PurchaseInvoice;
import mls.sho.dms.entity.PurchaseInvoiceLine;
import mls.sho.dms.entity.Supplier;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}")
@RequiredArgsConstructor
public class PurchasingController {

    private final SupplierService supplierService;
    private final PurchaseInvoiceService invoiceService;
    private final IngredientService ingredientService;
    private final mls.sho.dms.application.purchasing.service.PurchasingDashboardService dashboardService;

    // -- Invoices (ROOT LEVEL AS PER SPA REQUIREMENTS) ----------

    @GetMapping("/invoices")
    public List<PurchaseInvoiceDTO> getInvoices(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) PurchaseInvoice.InvoiceStatus status) {
        return invoiceService.getInvoices(restaurantId, status).stream()
                .map(invoiceService::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/invoices/{id}")
    public PurchaseInvoiceDTO getInvoice(@PathVariable Long restaurantId, @PathVariable Long id) {
        return invoiceService.toDTO(invoiceService.getInvoice(id));
    }

    @PostMapping("/invoices")
    public PurchaseInvoiceDTO createInvoice(@PathVariable Long restaurantId, @RequestBody PurchaseInvoice invoice) {
        invoice.setRestaurant(new mls.sho.dms.entity.Restaurant());
        invoice.getRestaurant().setId(restaurantId);
        return invoiceService.toDTO(invoiceService.createInvoice(invoice));
    }

    @PutMapping("/invoices/{id}")
    public PurchaseInvoiceDTO updateInvoice(@PathVariable Long restaurantId, @PathVariable Long id, @RequestBody PurchaseInvoice invoice) {
        return invoiceService.toDTO(invoiceService.updateInvoice(id, invoice));
    }

    @DeleteMapping("/invoices/{id}")
    public void deleteInvoice(@PathVariable Long restaurantId, @PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }

    @PostMapping("/invoices/{id}/lines")
    public void addLine(@PathVariable Long restaurantId, @PathVariable Long id, @RequestBody PurchaseInvoiceLine line) {
        invoiceService.addLine(id, line);
    }

    @PostMapping("/invoices/{id}/post")
    public void postInvoice(@PathVariable Long restaurantId, @PathVariable Long id) {
        invoiceService.postInvoice(id);
    }

    @PostMapping("/invoices/auto-generate")
    public PurchaseInvoiceDTO autoGenerate(@PathVariable Long restaurantId) {
        return invoiceService.toDTO(invoiceService.autoGenerateFromLowStock(restaurantId, ingredientService, supplierService));
    }

    @GetMapping("/summary/weekly")
    public WeeklySummaryDTO getWeeklySummary(
            @PathVariable Long restaurantId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return invoiceService.getWeeklySummary(restaurantId, weekStart);
    }

    @GetMapping("/dashboard")
    public mls.sho.dms.application.purchasing.dto.PurchasingDashboardDTO getDashboard(
            @PathVariable Long restaurantId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate date) {
        return dashboardService.getDashboardData(restaurantId, date);
    }

    // -- Additional invoice stub endpoints ----------

    @GetMapping("/invoices/summary/weekly")
    public WeeklySummaryDTO getWeeklyInvoiceSummary(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return invoiceService.getWeeklySummary(restaurantId, weekStart);
    }

    @GetMapping("/invoices/summary/supplier")
    public List<Map<String, Object>> getSupplierSummary(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return invoiceService.getSpendBySupplier(restaurantId, from, to);
    }

    @GetMapping("/invoices/summary/trend")
    public List<Map<String, Object>> getInvoiceTrend(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "8") int weeks) {
        return invoiceService.getCategoryTrend(restaurantId, category, weeks);
    }

    @GetMapping("/invoices/alerts/proof")
    public List<Map<String, Object>> getProofAlerts(@PathVariable Long restaurantId) {
        return invoiceService.getProofAlerts(restaurantId);
    }

    @PostMapping("/invoices/{id}/void")
    public PurchaseInvoiceDTO voidInvoice(
            @PathVariable Long restaurantId,
            @PathVariable Long id) {
        return invoiceService.toDTO(invoiceService.voidInvoice(id));
    }

    @PutMapping("/invoices/{invoiceId}/lines")
    public PurchaseInvoiceDTO updateInvoiceLines(
            @PathVariable Long restaurantId,
            @PathVariable Long invoiceId,
            @RequestBody PurchaseInvoiceLine body) {
        return invoiceService.toDTO(invoiceService.upsertLine(invoiceId, body));
    }

    @DeleteMapping("/invoices/{invoiceId}/lines/{lineId}")
    public ResponseEntity<Void> deleteInvoiceLine(
            @PathVariable Long restaurantId,
            @PathVariable Long invoiceId,
            @PathVariable Long lineId) {
        invoiceService.deleteLine(invoiceId, lineId);
        return ResponseEntity.noContent().build();
    }

}

