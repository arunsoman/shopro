package mls.sho.dms.application.purchasing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.dto.PurchaseOrderCreateDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseOrderDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseOrderLineDTO;
import mls.sho.dms.application.purchasing.dto.GoodsReceiptDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseInvoiceDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseMatchBundleDTO;
import mls.sho.dms.application.purchasing.repository.PurchaseOrderRepository;
import mls.sho.dms.application.purchasing.repository.SupplierRepository;
import mls.sho.dms.application.purchasing.repository.GoodsReceiptRepository;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.entity.PurchaseOrder;
import mls.sho.dms.entity.GoodsReceipt;
import mls.sho.dms.entity.PurchaseOrderLine;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.common.enums.PurchaseOrderStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Service for managing Purchase Order lifecycle.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final SupplierRepository supplierRepository;
    private final IngredientRepository ingredientRepository;
    private final GoodsReceiptRepository grnRepository;
    private final PurchaseInvoiceService invoiceService;

    public List<PurchaseOrderDTO> listOrders(Long restaurantId, PurchaseOrderStatus status) {
        List<PurchaseOrder> orders = (status == null) 
            ? poRepository.findAllByRestaurantId(restaurantId)
            : poRepository.findAllByRestaurantIdAndStatus(restaurantId, status);
        
        return orders.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public PurchaseOrderDTO getOrder(Long restaurantId, Long id) {
        PurchaseOrder po = poRepository.findByRestaurantIdAndId(restaurantId, id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        return mapToDTO(po);
    }

    public PurchaseOrderDTO createOrder(Long restaurantId, PurchaseOrderCreateDTO dto) {
        PurchaseOrder po = new PurchaseOrder();
        
        // Mock Restaurant lookup (should be from context in real app)
        Restaurant restaurant = new Restaurant();
        restaurant.setId(restaurantId);
        po.setRestaurant(restaurant);

        po.setSupplier(supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found")));
        
        po.setIssueDate(dto.getIssueDate() != null ? ZonedDateTime.parse(dto.getIssueDate()).toLocalDateTime() : LocalDateTime.now());
        po.setNotes(dto.getNotes());
        po.setStatus(PurchaseOrderStatus.SENT);

        for (PurchaseOrderCreateDTO.LineItem lineDto : dto.getLines()) {
            PurchaseOrderLine line = new PurchaseOrderLine();
            line.setPurchaseOrder(po);
            line.setIngredient(ingredientRepository.findById(lineDto.getIngredientId())
                    .orElseThrow(() -> new RuntimeException("Ingredient not found")));
            line.setOrderedQty(lineDto.getOrderedQty());
            line.setUnitPrice(lineDto.getUnitPrice());
            po.getLines().add(line);
        }

        po.calculateTotal();
        PurchaseOrder saved = poRepository.save(po);
        return mapToDTO(saved);
    }

    public PurchaseOrderDTO updateStatus(Long restaurantId, Long id, PurchaseOrderStatus status) {
        PurchaseOrder po = poRepository.findByRestaurantIdAndId(restaurantId, id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        po.setStatus(status);
        po.setUpdatedAt(LocalDateTime.now());
        return mapToDTO(poRepository.save(po));
    }

    public PurchaseMatchBundleDTO getMatchBundle(Long restaurantId, Long poId) {
        PurchaseOrder po = poRepository.findByRestaurantIdAndId(restaurantId, poId)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        
        List<GoodsReceipt> grns = grnRepository.findAllByPurchaseOrderId(poId);
        List<GoodsReceiptDTO> grnDtos = grns.stream()
                .map(this::mapToGrnDTO)
                .collect(Collectors.toList());
        
        List<PurchaseInvoiceDTO> invoiceDtos = grns.stream()
                .map(grn -> invoiceService.findByGoodsReceiptId(grn.getId()))
                .filter(java.util.Optional::isPresent)
                .map(opt -> opt.get())
                .map(invoiceService::toDTO)
                .collect(Collectors.toList());
        
        PurchaseMatchBundleDTO bundle = new PurchaseMatchBundleDTO();
        bundle.setPurchaseOrder(mapToDTO(po));
        bundle.setGoodsReceipts(grnDtos);
        bundle.setInvoices(invoiceDtos);
        
        // Calculate Summary
        PurchaseMatchBundleDTO.MatchSummary summary = new PurchaseMatchBundleDTO.MatchSummary();
        summary.setTotalOrdered(po.getTotalAmount());
        
        BigDecimal totalReceived = grns.stream()
                .map(GoodsReceipt::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalReceived(totalReceived);
        
        BigDecimal totalBilled = invoiceDtos.stream()
                .map(PurchaseInvoiceDTO::getInvoiceAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalBilled(totalBilled);
        
        summary.setTotalVariance(totalBilled.subtract(po.getTotalAmount()));
        
        if (totalBilled.compareTo(po.getTotalAmount()) == 0 && totalReceived.compareTo(po.getTotalAmount()) == 0) {
            summary.setMatchStatus("PERFECT");
        } else if (totalBilled.compareTo(totalReceived) > 0) {
            summary.setMatchStatus("LEAK");
        } else {
            summary.setMatchStatus("VARIANCE");
        }
        
        bundle.setSummary(summary);
        return bundle;
    }

    private GoodsReceiptDTO mapToGrnDTO(GoodsReceipt grn) {
        GoodsReceiptDTO dto = new GoodsReceiptDTO();
        dto.setId(grn.getId());
        dto.setSupplierId(grn.getSupplier().getId());
        dto.setSupplierName(grn.getSupplier().getName());
        dto.setPurchaseOrderId(grn.getPurchaseOrder() != null ? grn.getPurchaseOrder().getId() : null);
        dto.setPoNumber(grn.getPurchaseOrder() != null ? grn.getPurchaseOrder().getId().toString() : null);
        dto.setReceivedDate(grn.getReceivedDate());
        dto.setTotalAmount(grn.getTotalAmount());
        dto.setStatus(grn.getStatus());
        dto.setNotes(grn.getNotes());
        
        if (grn.getLines() != null) {
            dto.setLines(grn.getLines().stream().map(line -> {
                GoodsReceiptDTO.GoodsReceiptLineDTO ldto = new GoodsReceiptDTO.GoodsReceiptLineDTO();
                ldto.setId(line.getId());
                ldto.setIngredientId(line.getIngredient().getId());
                ldto.setIngredientDescription(line.getIngredient().getDescription());
                ldto.setReceivedQty(line.getReceivedQty());
                ldto.setUnitPrice(line.getUnitPrice());
                return ldto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }

    public void deleteOrder(Long restaurantId, Long id) {
        PurchaseOrder po = poRepository.findByRestaurantIdAndId(restaurantId, id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        if (po.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new RuntimeException("Only draft orders can be deleted");
        }
        poRepository.delete(po);
    }

    private PurchaseOrderDTO mapToDTO(PurchaseOrder po) {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(po.getId());
        dto.setSupplierId(po.getSupplier().getId());
        dto.setSupplierName(po.getSupplier().getName());
        dto.setIssueDate(po.getIssueDate());
        dto.setTotalAmount(po.getTotalAmount());
        dto.setStatus(po.getStatus());
        dto.setNotes(po.getNotes());
        
        dto.setLines(po.getLines().stream().map(line -> {
            PurchaseOrderLineDTO ldto = new PurchaseOrderLineDTO();
            ldto.setId(line.getId());
            ldto.setIngredientId(line.getIngredient().getId());
            ldto.setIngredientCode(line.getIngredient().getItemCode());
            ldto.setIngredientDescription(line.getIngredient().getDescription());
            ldto.setOrderedUnit(line.getIngredient().getPurchaseUnit() != null ? line.getIngredient().getPurchaseUnit().name() : null);
            ldto.setOrderedQty(line.getOrderedQty());
            ldto.setUnitPrice(line.getUnitPrice());
            ldto.setLineTotal(line.getOrderedQty() != null && line.getUnitPrice() != null
                    ? line.getOrderedQty().multiply(line.getUnitPrice()) : java.math.BigDecimal.ZERO);
            ldto.setReceivedQty(line.getReceivedQty());
            return ldto;
        }).collect(Collectors.toList()));
        
        return dto;
    }
}
