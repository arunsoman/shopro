package mls.sho.dms.application.purchasing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.repository.GoodsReceiptRepository;
import mls.sho.dms.application.purchasing.repository.PurchaseInvoiceRepository;
import mls.sho.dms.application.inventory.service.IngredientService;
import mls.sho.dms.application.inventory.service.InventoryIntelligenceService;
import mls.sho.dms.common.enums.InventoryCategory;
import mls.sho.dms.common.enums.PurchaseCategory;
import mls.sho.dms.application.purchasing.dto.PurchaseInvoiceDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseOrderLineDTO;
import mls.sho.dms.application.purchasing.dto.WeeklySummaryDTO;
import mls.sho.dms.application.inventory.entity.Ingredient;
import mls.sho.dms.application.purchasing.entity.PurchaseInvoice;
import mls.sho.dms.application.purchasing.entity.PurchaseOrderLine;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.application.purchasing.entity.Supplier;
import mls.sho.dms.application.purchasing.entity.GoodsReceipt;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
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
        if (entity.getGoodsReceipt() != null) {
            dto.setGoodsReceiptId(entity.getGoodsReceipt().getId());
        }
        dto.setInvoiceDate(entity.getInvoiceDate());
        dto.setInvoiceNumber(entity.getInvoiceNumber());
        dto.setInvoiceAmount(entity.getInvoiceAmount());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Map lines from PO/GRN
        dto.setLines(entity.getLines().stream()
                .map(this::toLineDTO)
                .collect(Collectors.toList()));
        
        return dto;
    }

    private PurchaseOrderLineDTO toLineDTO(PurchaseOrderLine entity) {
        PurchaseOrderLineDTO dto = new PurchaseOrderLineDTO();
        dto.setId(entity.getId());
        dto.setIngredientId(entity.getIngredient().getId());
        dto.setIngredientDescription(entity.getIngredient().getDescription());
        dto.setOrderedQty(entity.getOrderedQty());
        dto.setReceivedQty(entity.getReceivedQty());
        dto.setUnitPrice(entity.getUnitPrice());
        return dto;
    }


    private final PurchaseInvoiceRepository invoiceRepository;
    private final GoodsReceiptRepository grnRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryIntelligenceService intelligenceService;

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
    public void postInvoice(Long invoiceId) {
        PurchaseInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        validateInvoiceBalanced(invoice);

        invoice.setStatus(PurchaseInvoice.InvoiceStatus.POSTED);
        invoiceRepository.save(invoice);

        // Update ingredient cost basis from invoice lines
        updateIngredientCostBasis(invoice);
    }

    /**
     * Updates ingredient cost basis after invoice is posted.
     * This ensures real-time inventory valuation uses current purchase prices.
     */
    private void updateIngredientCostBasis(PurchaseInvoice invoice) {
        if (invoice.getGoodsReceipt() == null) return;
        
        List<PurchaseOrderLine> lines = invoice.getGoodsReceipt().getLines();
        if (lines == null) return;
        
        for (PurchaseOrderLine line : lines) {
            Ingredient ingredient = line.getIngredient();
            if (ingredient != null && line.getUnitPrice() != null) {
                // Update the last purchase price for cost basis tracking
                ingredient.setPurchaseUnitPrice(line.getUnitPrice());
                ingredientRepository.save(ingredient);
                
                // Record price-only update — quantity=ZERO so balance is not inflated again.
                // The GRN already posted the stock; invoice posting only confirms the cost basis.
                intelligenceService.recordCostBasisUpdate(
                    invoice.getRestaurant(),
                    ingredient,
                    line.getUnitPrice(),
                    BigDecimal.ZERO,
                    invoice.getId()
                );
            }
        }
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

        return invoiceRepository.save(invoice);
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
                                    BigDecimal parLevel = ing.getParLevel();
                                    BigDecimal onHand = ing.getOnHand();
                                    BigDecimal price = ing.getPurchaseUnitPrice();
                                    if (parLevel == null || onHand == null || price == null) return BigDecimal.ZERO;
                                    BigDecimal shortfall = parLevel.subtract(onHand);
                                    if (shortfall.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
                                    return shortfall.multiply(price);
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
        
        return invoiceRepository.save(invoice);
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
    public List<PurchaseInvoice> findByGoodsReceiptIdIn(List<Long> grnIds) {
        if (grnIds == null || grnIds.isEmpty()) return new ArrayList<>();
        return invoiceRepository.findByGoodsReceiptIdIn(grnIds);
    }

    @Transactional(readOnly = true)
    public WeeklySummaryDTO getWeeklySummary(Long restaurantId, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<PurchaseInvoice> invoices = invoiceRepository.findAllByRestaurantIdAndInvoiceDateBetween(restaurantId, weekStart, weekEnd);

        BigDecimal grandTotal = invoices.stream()
                .map(PurchaseInvoice::getInvoiceAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group totals by category from PO lines (via GRN)
        Map<PurchaseCategory, BigDecimal> totalsByCategory = invoices.stream()
                .flatMap(i -> i.getLines().stream())
                .collect(Collectors.groupingBy(
                        line -> mapCategory(line.getIngredient().getCategory()),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                line -> {
                                    BigDecimal qty = line.getReceivedQty() != null ? line.getReceivedQty() : BigDecimal.ZERO;
                                    BigDecimal price = line.getUnitPrice() != null ? line.getUnitPrice() : BigDecimal.ZERO;
                                    return qty.multiply(price);
                                },
                                BigDecimal::add
                        )
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

    private void validateInvoiceBalanced(PurchaseInvoice invoice) {
        // Invoices without a GRN (e.g. auto-generated drafts) have no lines to validate against.
        if (invoice.getGoodsReceipt() == null) return;

        BigDecimal sum = invoice.getLines().stream()
                .map(line -> {
                    BigDecimal qty = line.getReceivedQty() != null ? line.getReceivedQty() : BigDecimal.ZERO;
                    BigDecimal price = line.getUnitPrice() != null ? line.getUnitPrice() : BigDecimal.ZERO;
                    return qty.multiply(price);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal diff = invoice.getInvoiceAmount().subtract(sum);

        if (diff.compareTo(BigDecimal.ZERO) != 0) {
            throw new RuntimeException("Invoice is not balanced. Variance: " + diff);
        }
    }
}
