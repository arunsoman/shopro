package mls.sho.dms.application.purchasing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.repository.GoodsReceiptRepository;
import mls.sho.dms.application.purchasing.repository.PurchaseInvoiceLineRepository;
import mls.sho.dms.application.purchasing.repository.PurchaseInvoiceRepository;
import mls.sho.dms.common.util.ConversionFunctions;
import mls.sho.dms.application.inventory.service.IngredientService;
import mls.sho.dms.common.enums.InventoryCategory;
import mls.sho.dms.common.enums.PurchaseCategory;
import mls.sho.dms.application.purchasing.dto.PurchaseInvoiceDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseInvoiceLineDTO;
import mls.sho.dms.application.purchasing.dto.WeeklySummaryDTO;
import mls.sho.dms.entity.Ingredient;
import mls.sho.dms.entity.PurchaseInvoice;
import mls.sho.dms.entity.PurchaseInvoiceLine;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.Supplier;
import mls.sho.dms.entity.GoodsReceipt;
import mls.sho.dms.entity.GoodsReceiptLine;
import java.math.RoundingMode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseInvoiceService {

    public PurchaseInvoiceDTO toDTO(PurchaseInvoice entity) {
        PurchaseInvoiceDTO dto = new PurchaseInvoiceDTO();
        dto.setId(entity.getId());
        if (entity.getSupplier() != null) {
            dto.setSupplierId(entity.getSupplier().getId());
            dto.setSupplierName(entity.getSupplier().getName());
        }
        dto.setInvoiceDate(entity.getInvoiceDate());
        dto.setInvoiceNumber(entity.getInvoiceNumber());
        dto.setInvoiceAmount(entity.getInvoiceAmount());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        if (entity.getLines() != null) {
            dto.setLines(entity.getLines().stream()
                    .map(this::toLineDTO)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private PurchaseInvoiceLineDTO toLineDTO(PurchaseInvoiceLine entity) {
        PurchaseInvoiceLineDTO dto = new PurchaseInvoiceLineDTO();
        dto.setId(entity.getId());
        dto.setPurchaseCategory(entity.getPurchaseCategory());
        dto.setAmount(entity.getAmount());
        return dto;
    }


    private final PurchaseInvoiceRepository invoiceRepository;
    private final PurchaseInvoiceLineRepository lineRepository;
    private final GoodsReceiptRepository grnRepository;

    @Transactional(readOnly = true)
    public List<PurchaseInvoice> getInvoices(Long restaurantId, PurchaseInvoice.InvoiceStatus status) {
        if (status != null) {
            return invoiceRepository.findAllByRestaurantIdAndStatus(restaurantId, status);
        }
        return invoiceRepository.findAllByRestaurantId(restaurantId);
    }

    @Transactional(readOnly = true)
    public PurchaseInvoice getInvoice(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    @Transactional
    public PurchaseInvoice createInvoice(PurchaseInvoice invoice) {
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public PurchaseInvoice updateInvoice(Long id, PurchaseInvoice updated) {
        PurchaseInvoice invoice = getInvoice(id);
        invoice.setInvoiceDate(updated.getInvoiceDate());
        invoice.setInvoiceNumber(updated.getInvoiceNumber());
        invoice.setInvoiceAmount(updated.getInvoiceAmount());
        if (updated.getSupplier() != null) invoice.setSupplier(updated.getSupplier());
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    @Transactional
    public void addLine(Long invoiceId, PurchaseInvoiceLine line) {
        PurchaseInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        line.setInvoice(invoice);
        lineRepository.save(line);
    }

    @Transactional
    public void postInvoice(Long invoiceId) {
        PurchaseInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        validateInvoiceBalanced(invoice);

        invoice.setStatus(PurchaseInvoice.InvoiceStatus.POSTED);
        invoiceRepository.save(invoice);

        // TODO: Publish InvoicePostedEvent
    }

    @Transactional
    public PurchaseInvoice createDraftFromGRN(Long grnId) {
        GoodsReceipt grn = grnRepository.findById(grnId)
                .orElseThrow(() -> new RuntimeException("GRN not found"));

        PurchaseInvoice invoice = new PurchaseInvoice();
        invoice.setRestaurant(grn.getRestaurant());
        invoice.setSupplier(grn.getSupplier());
        invoice.setGoodsReceipt(grn);
        invoice.setInvoiceDate(grn.getReceivedDate().toLocalDate());
        invoice.setInvoiceNumber("GRN-REF-" + grn.getId());
        invoice.setInvoiceAmount(grn.getTotalAmount());
        invoice.setStatus(PurchaseInvoice.InvoiceStatus.DRAFT);

        final PurchaseInvoice saved = invoiceRepository.save(invoice);

        // Group GRN lines by PurchaseCategory
        Map<PurchaseCategory, BigDecimal> categoryTotals = grn.getLines().stream()
                .collect(Collectors.groupingBy(
                        line -> mapCategory(line.getIngredient().getCategory()),
                        Collectors.mapping(
                                line -> line.getReceivedQty().multiply(line.getUnitPrice()),
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));

        List<PurchaseInvoiceLine> lines = categoryTotals.entrySet().stream()
                .map(e -> {
                    PurchaseInvoiceLine line = new PurchaseInvoiceLine();
                    line.setInvoice(saved);
                    line.setPurchaseCategory(e.getKey());
                    line.setAmount(e.getValue());
                    return line;
                }).collect(Collectors.toList());

        lineRepository.saveAll(lines);
        saved.setLines(lines);
        return saved;
    }

    @Transactional
    public PurchaseInvoice autoGenerateFromLowStock(
            Long restaurantId, 
            IngredientService ingredientService, 
            SupplierService supplierService) {
        
        List<Ingredient> lowStockItems = ingredientService.getLowStockIngredients(restaurantId);
        if (lowStockItems.isEmpty()) {
            throw new RuntimeException("No low stock items found to replenish.");
        }

        // Group shortfall total cost by PurchaseCategory
        // Mapping InventoryCategory -> PurchaseCategory
        Map<PurchaseCategory, BigDecimal> categoryShortfalls = lowStockItems.stream()
                .collect(Collectors.groupingBy(
                        ing -> mapCategory(ing.getCategory()),
                        Collectors.mapping(
                                ing -> {
                                    BigDecimal shortfall = ing.getParLevel().subtract(ing.getOnHand());
                                    if (shortfall.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
                                    return shortfall.multiply(ing.getPurchaseUnitPrice());
                                },
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));

        // Get a target supplier
        Supplier supplier = supplierService.getSuppliers(restaurantId).stream()
                .findFirst()
                .orElseGet(() -> {
                    Supplier res = new Supplier();
                    res.setName("Replenishment Supplier");
                    res.setContactName("Auto-System");
                    res.setRestaurant(new Restaurant());
                    res.getRestaurant().setId(restaurantId);
                    return supplierService.saveSupplier(res);
                });

        // Create Invoice Header
        PurchaseInvoice invoice = new PurchaseInvoice();
        invoice.setRestaurant(new Restaurant());
        invoice.getRestaurant().setId(restaurantId);
        invoice.setSupplier(supplier);
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setInvoiceNumber("AUTO-" + System.currentTimeMillis() / 100000);
        invoice.setStatus(PurchaseInvoice.InvoiceStatus.DRAFT);
        
        BigDecimal totalAmount = categoryShortfalls.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setInvoiceAmount(totalAmount);
        
        final PurchaseInvoice saved = invoiceRepository.save(invoice);

        // Create Lines
        List<PurchaseInvoiceLine> lines = categoryShortfalls.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) > 0)
                .map(e -> {
                    PurchaseInvoiceLine line = new PurchaseInvoiceLine();
                    line.setInvoice(saved);
                    line.setPurchaseCategory(e.getKey());
                    line.setAmount(e.getValue());
                    return line;
                }).collect(Collectors.toList());

        lineRepository.saveAll(lines);
        return saved;
    }

    private PurchaseCategory mapCategory(InventoryCategory invCat) {
        if (invCat == null) return PurchaseCategory.FOOD;
        return switch (invCat) {
            case MEAT, SEAFOOD, POULTRY, PRODUCE, DAIRY, BAKERY, GROCERY_DRY_GOODS, DRY_GOODS -> PurchaseCategory.FOOD;
            case DRINKS, BEVERAGES -> PurchaseCategory.SOFT_BEVERAGE;
            case LIQUOR -> PurchaseCategory.LIQUOR;
            case BOTTLE_BEER -> PurchaseCategory.BOTTLE_BEER;
            case DRAFT_BEER, BEER -> PurchaseCategory.DRAFT_BEER;
            case WINE -> PurchaseCategory.WINE;
            case BAR_CONSUMABLES -> PurchaseCategory.SUPPLIES;
            default -> PurchaseCategory.MERCHANDISE;
        };
    }

    @Transactional(readOnly = true)
    public java.util.Optional<PurchaseInvoice> findByGoodsReceiptId(Long grnId) {
        return invoiceRepository.findByGoodsReceiptId(grnId);
    }

    @Transactional(readOnly = true)
    public WeeklySummaryDTO getWeeklySummary(Long restaurantId, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<PurchaseInvoice> invoices = invoiceRepository.findAllByRestaurantIdAndInvoiceDateBetween(restaurantId, weekStart, weekEnd);

        BigDecimal grandTotal = invoices.stream()
                .map(PurchaseInvoice::getInvoiceAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<PurchaseCategory, BigDecimal> totalsByCategory = invoices.stream()
                .flatMap(i -> i.getLines().stream())
                .collect(Collectors.groupingBy(
                        PurchaseInvoiceLine::getPurchaseCategory,
                        Collectors.reducing(BigDecimal.ZERO, PurchaseInvoiceLine::getAmount, BigDecimal::add)
                ));

        List<WeeklySummaryDTO.CategoryBreakdownDTO> breakdown = totalsByCategory.entrySet().stream()
                .map(e -> {
                    double pct = grandTotal.compareTo(BigDecimal.ZERO) > 0 
                        ? e.getValue().divide(grandTotal, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue()
                        : 0;
                    return WeeklySummaryDTO.CategoryBreakdownDTO.builder()
                            .purchaseCategory(e.getKey())
                            .amount(e.getValue())
                            .percentage(pct)
                            .build();
                })
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList());

        return WeeklySummaryDTO.builder()
                .grandTotal(grandTotal)
                .categoryBreakdown(breakdown)
                .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSpendBySupplier(Long restaurantId, LocalDate from, LocalDate to) {
        List<PurchaseInvoice> invoices = invoiceRepository.findAllByRestaurantIdAndInvoiceDateBetween(restaurantId, from, to);
        return invoices.stream()
            .collect(Collectors.groupingBy(
                inv -> inv.getSupplier() != null ? inv.getSupplier().getName() : "Unknown",
                Collectors.reducing(BigDecimal.ZERO, PurchaseInvoice::getInvoiceAmount, BigDecimal::add)
            ))
            .entrySet().stream()
            .map(e -> Map.of("supplierName", (Object) e.getKey(), "totalSpend", (Object) e.getValue()))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCategoryTrend(Long restaurantId, String category, int weeks) {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate weekStart = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        for (int i = weeks - 1; i >= 0; i--) {
            LocalDate ws = weekStart.minusWeeks(i);
            LocalDate we = ws.plusDays(6);
            List<PurchaseInvoice> invoices = invoiceRepository.findAllByRestaurantIdAndInvoiceDateBetween(restaurantId, ws, we);
            BigDecimal total = invoices.stream().map(PurchaseInvoice::getInvoiceAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(Map.of("weekStart", (Object) ws.toString(), "totalSpend", (Object) total));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getProofAlerts(Long restaurantId) {
        LocalDate threshold = LocalDate.now().minusDays(7);
        return invoiceRepository.findAllByRestaurantId(restaurantId).stream()
            .filter(inv -> inv.getStatus() == PurchaseInvoice.InvoiceStatus.DRAFT
                        && inv.getInvoiceDate() != null
                        && inv.getInvoiceDate().isBefore(threshold))
            .map(inv -> Map.of(
                "invoiceId", (Object) inv.getId(),
                "supplierName", (Object) (inv.getSupplier() != null ? inv.getSupplier().getName() : "Unknown"),
                "invoiceDate", (Object) inv.getInvoiceDate().toString(),
                "amount", (Object) inv.getInvoiceAmount(),
                "alertType", (Object) "STALE_DRAFT"
            ))
            .collect(Collectors.toList());
    }

    @Transactional
    public PurchaseInvoice voidInvoice(Long id) {
        PurchaseInvoice invoice = getInvoice(id);
        if (invoice.getStatus() == PurchaseInvoice.InvoiceStatus.POSTED) {
            throw new RuntimeException("Cannot void a posted invoice");
        }
        invoice.setStatus(PurchaseInvoice.InvoiceStatus.VOID);
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public PurchaseInvoice upsertLine(Long invoiceId, PurchaseInvoiceLine newLine) {
        PurchaseInvoice invoice = getInvoice(invoiceId);
        newLine.setInvoice(invoice);
        if (invoice.getLines() == null) invoice.setLines(new ArrayList<>());
        if (newLine.getId() != null) {
            invoice.getLines().removeIf(l -> l.getId().equals(newLine.getId()));
        }
        lineRepository.save(newLine);
        invoice.setInvoiceAmount(invoice.getLines().stream()
            .map(PurchaseInvoiceLine::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add).add(newLine.getAmount()));
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public void deleteLine(Long invoiceId, Long lineId) {
        PurchaseInvoice invoice = getInvoice(invoiceId);
        lineRepository.deleteById(lineId);
        invoice.setLines(lineRepository.findAllByInvoiceId(invoiceId));
        BigDecimal newTotal = invoice.getLines().stream()
            .map(PurchaseInvoiceLine::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setInvoiceAmount(newTotal);
        invoiceRepository.save(invoice);
    }

    private void validateInvoiceBalanced(PurchaseInvoice invoice) {
        BigDecimal sum = invoice.getLines().stream()
                .map(PurchaseInvoiceLine::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal diff = invoice.getInvoiceAmount().subtract(sum);

        if (diff.compareTo(BigDecimal.ZERO) != 0) {
            throw new RuntimeException("Invoice is not balanced. Variance: " + diff);
        }
    }
}
