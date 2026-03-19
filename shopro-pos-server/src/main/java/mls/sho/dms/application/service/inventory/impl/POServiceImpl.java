package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.dto.inventory.CreatePurchaseOrderRequest;
import mls.sho.dms.application.dto.inventory.PurchaseOrderResponse;
import mls.sho.dms.application.dto.inventory.POStatusHistoryResponse;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.POService;
import mls.sho.dms.application.service.inventory.POStateMachineService;
import mls.sho.dms.application.service.inventory.POGeneratorService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.entity.staff.Role;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.POStatusHistoryRepository;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import mls.sho.dms.repository.inventory.SupplierRepository;
import mls.sho.dms.repository.inventory.SupplierUserRepository;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class POServiceImpl implements POService {

    private final PurchaseOrderRepository poRepository;
    private final RFQRepository rfqRepository;
    private final StaffRepository staffRepository;
    private final SupplierRepository supplierRepository;
    private final RawIngredientRepository ingredientRepository;
    private final AlertService alertService;
    private final POStateMachineService stateMachineService;
    private final POGeneratorService poGeneratorService;
    private final POStatusHistoryRepository historyRepository;
    private final SupplierUserRepository supplierUserRepository;
    
    private static final UUID SYSTEM_ACTOR_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> findAll() {
        return poRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PurchaseOrderResponse mapToResponse(PurchaseOrder po) {
        return PurchaseOrderResponse.builder()
                .id(po.getId())
                .supplierId(po.getSupplier() != null ? po.getSupplier().getId() : null)
                .supplierName(po.getSupplier() != null ? po.getSupplier().getCompanyName() : "Pending Award")
                .status(po.getStatus())
                .totalValue(po.getTotalValue())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .items(po.getLines().stream()
                        .map(line -> PurchaseOrderResponse.PurchaseOrderLineResponse.builder()
                                .id(line.getId())
                                .ingredientId(line.getIngredient().getId())
                                .ingredientName(line.getIngredient().getName())
                                .orderedQty(line.getOrderedQty())
                                .unitCost(line.getUnitCost())
                                .unitOfMeasure(line.getIngredient().getUnitOfMeasure())
                                .build())
                        .collect(Collectors.toList()))
                .acknowledgedAt(po.getAcknowledgedAt())
                .shippedAt(po.getShippedAt())
                .counterOfferPrice(po.getCounterOfferPrice())
                .counterOfferQty(po.getCounterOfferQty())
                .counterOfferNotes(po.getCounterOfferNotes())
                .trackingNumber(po.getTrackingNumber())
                .deliveryNoteRef(po.getDeliveryNoteRef())
                .createdAt(po.getCreatedAt())
                .build();
    }

    // US-14.1 Approval Matrix Thresholds
    private static final BigDecimal TIER1_AUTO_LIMIT = new BigDecimal("500.00");
    private static final BigDecimal TIER2_MANAGER_LIMIT = new BigDecimal("3000.00");
    private static final BigDecimal TIER3_GM_LIMIT = new BigDecimal("10000.00");

    @Override
    @Transactional
    public PurchaseOrder submitForApproval(UUID poId) {
        PurchaseOrder po = getPoOrThrow(poId);
        if (po.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT purchase orders can be submitted.");
        }

        BigDecimal total = po.getTotalValue();
        
        UUID authorId = po.getGeneratedBy() != null ? po.getGeneratedBy().getId() : SYSTEM_ACTOR_ID;

        // Auto Approval Tier (< $500)
        if (total.compareTo(TIER1_AUTO_LIMIT) < 0) {
            log.info("PO #{} auto-approved (Value: ${})", po.getId(), total);
            stateMachineService.transition(poId, PurchaseOrderStatus.APPROVED, authorId, "System Auto-Approved (<$500)");
            return getPoOrThrow(poId);
        }

        // Needs Manual Approval
        stateMachineService.transition(poId, PurchaseOrderStatus.PENDING_APPROVAL, authorId, "Submitted for review");

        return poRepository.save(po);
    }

    @Override
    @Transactional
    public PurchaseOrder approveOrder(UUID poId, UUID approverId) {
        PurchaseOrder po = getPoOrThrow(poId);
        StaffMember approver = staffRepository.findById(approverId)
            .orElseThrow(() -> new IllegalArgumentException("Approver not found"));

        validateApprovalPermissions(po.getTotalValue(), approver.getRole());

        po.setApprovedBy(approver);
        po.setApprovedAt(Instant.now());
        poRepository.save(po);

        stateMachineService.transition(poId, PurchaseOrderStatus.APPROVED, approverId, "Manager Approved");
        
        return getPoOrThrow(poId);
    }

    @Override
    @Transactional
    public PurchaseOrder rejectOrder(UUID poId, UUID approverId, String reason) {
        PurchaseOrder po = getPoOrThrow(poId);
        StaffMember approver = staffRepository.findById(approverId)
            .orElseThrow(() -> new IllegalArgumentException("Approver not found"));

        validateApprovalPermissions(po.getTotalValue(), approver.getRole());

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is mandatory.");
        }

        stateMachineService.transition(poId, PurchaseOrderStatus.REJECTED, approverId, reason);
        
        return getPoOrThrow(poId);
    }

    @Override
    @Transactional
    public PurchaseOrder sendOrder(UUID poId, UUID staffId) {
        PurchaseOrder po = getPoOrThrow(poId);
        StaffMember staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        if (po.getStatus() != PurchaseOrderStatus.APPROVED) {
            throw new BusinessRuleException("Only APPROVED purchase orders can be sent to the supplier.");
        }

        stateMachineService.transition(poId, PurchaseOrderStatus.SENT, staffId, "Sent to Supplier");
        
        // Notify the supplier
        if (po.getSupplier() != null && po.getSupplier().getContactEmail() != null) {
            String subject = "New Purchase Order: #" + po.getId().toString().substring(0, 8);
            String message = String.format("You have received a new Purchase Order from our restaurant. Please review and acknowledge it in the Supplier Portal.\nTotal Value: $%.2f\nExpected Delivery: %s",
                po.getTotalValue(), po.getExpectedDeliveryDate() != null ? po.getExpectedDeliveryDate() : "ASAP");
            
            alertService.sendNotification(po.getSupplier().getContactEmail(), subject, message);
        }

        return getPoOrThrow(poId);
    }

    private void validateApprovalPermissions(BigDecimal value, Role role) {
        if (value.compareTo(TIER1_AUTO_LIMIT) < 0) return; // Anyone can approve < $500 if they manually do it
        
        String roleName = role != null ? role.getName() : "NONE";
        
        if (value.compareTo(TIER2_MANAGER_LIMIT) < 0) {
            if (!roleName.equals("MANAGER") && !roleName.equals("OWNER")) {
                throw new SecurityException("This PO requires Manager level approval.");
            }
        } else if (value.compareTo(TIER3_GM_LIMIT) < 0) {
             if (!roleName.equals("MANAGER") && !roleName.equals("OWNER")) { 
                throw new SecurityException("This PO requires General Manager level approval.");
            }
        } else {
             if (!roleName.equals("OWNER")) {
                throw new SecurityException("This PO requires Owner level approval.");
            }
        }
    }


    @Override
    @Transactional
    public PurchaseOrder createOrder(CreatePurchaseOrderRequest request, UUID generatedById) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        StaffMember creator = staffRepository.findById(generatedById)
            .orElseThrow(() -> new IllegalArgumentException("Creator staff member not found"));

        // Check for existing active orders for any of the ingredients
        List<UUID> ingredientIds = request.getItems().stream()
            .map(CreatePurchaseOrderRequest.PurchaseOrderLineRequest::getIngredientId)
            .collect(Collectors.toList());

        for (UUID ingredientId : ingredientIds) {
            List<PurchaseOrder> activePos = poRepository.findActiveOrdersByIngredientId(
                ingredientId, 
                EnumSet.of(PurchaseOrderStatus.CLOSED, PurchaseOrderStatus.CANCELLED, PurchaseOrderStatus.REJECTED)
            );
            if (!activePos.isEmpty()) {
                throw new BusinessRuleException("An active Purchase Order already exists for ingredient ID: " + ingredientId);
            }

            List<RFQ> activeRfqs = rfqRepository.findActiveRfqsByIngredientId(ingredientId, RfqStatus.OPEN);
            if (!activeRfqs.isEmpty()) {
                throw new BusinessRuleException("An active RFQ already exists for ingredient ID: " + ingredientId);
            }
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(supplier);
        po.setGeneratedBy(creator);
        po.setStatus(PurchaseOrderStatus.DRAFT);
        po.setExpectedDeliveryDate(request.getExpectedDeliveryDate());

        BigDecimal total = BigDecimal.ZERO;
        for (CreatePurchaseOrderRequest.PurchaseOrderLineRequest item : request.getItems()) {
            RawIngredient ingredient = ingredientRepository.findById(item.getIngredientId())
                .orElseThrow(() -> new IllegalArgumentException("Ingredient not found: " + item.getIngredientId()));

            PurchaseOrderLine line = new PurchaseOrderLine();
            line.setPurchaseOrder(po);
            line.setIngredient(ingredient);
            line.setOrderedQty(item.getOrderedQty());
            line.setUnitCost(item.getUnitCost());
            po.getLines().add(line);

            total = total.add(item.getOrderedQty().multiply(item.getUnitCost()));
        }

        po.setTotalValue(total);
        PurchaseOrder savedPo = poRepository.save(po);
        
        log.info("Manual PO created: #{} for supplier {}", savedPo.getId(), supplier.getCompanyName());
        
        // Auto-submit for approval based on rules in submitForApproval
        return submitForApproval(savedPo.getId());
    }
    @Override
    @Transactional
    public void cancelOrder(UUID poId) {
        PurchaseOrder po = poRepository.findById(poId)
            .orElseThrow(() -> new mls.sho.dms.application.exception.ResourceNotFoundException("Purchase Order not found"));

        EnumSet<PurchaseOrderStatus> revokableStatuses = EnumSet.of(
            PurchaseOrderStatus.DRAFT,
            PurchaseOrderStatus.PENDING_APPROVAL,
            PurchaseOrderStatus.APPROVED,
            PurchaseOrderStatus.SENT,
            PurchaseOrderStatus.ACKNOWLEDGED
        );

        if (!revokableStatuses.contains(po.getStatus())) {
            throw new BusinessRuleException("Purchase Order cannot be cancelled in its current state: " + po.getStatus());
        }

        po.setStatus(PurchaseOrderStatus.CANCELLED);
        poRepository.save(po);
        log.info("Purchase Order {} has been cancelled", poId);
    }

    @Override
    @Transactional
    public PurchaseOrder acknowledgeOrder(UUID poId) {
        log.warn("Direct acknowledgeOrder is deprecated. Use SupplierPortalService.");
        stateMachineService.transition(poId, PurchaseOrderStatus.ACKNOWLEDGED, UUID.randomUUID(), "Internal Acknowledgment");
        return getPoOrThrow(poId);
    }

    @Override
    @Transactional
    public PurchaseOrder shipOrder(UUID poId, String trackingNumber, String deliveryNoteRef, UUID invoiceFileId) {
        PurchaseOrder po = getPoOrThrow(poId);
        po.setTrackingNumber(trackingNumber);
        po.setDeliveryNoteRef(deliveryNoteRef);
        po.setInvoiceFileId(invoiceFileId);
        po.setShippedAt(Instant.now());
        poRepository.save(po);

        stateMachineService.transition(poId, PurchaseOrderStatus.SHIPPED, UUID.randomUUID(), "Internal Mark as Shipped");
        
        return getPoOrThrow(poId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<POStatusHistoryResponse> getStatusHistory(UUID poId) {
        return historyRepository.findByPurchaseOrder_IdOrderByCreatedAtDesc(poId).stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    private POStatusHistoryResponse mapToHistoryResponse(POStatusHistory history) {
        String actorName = resolveActorName(history.getActorId());
        return POStatusHistoryResponse.builder()
                .id(history.getId())
                .fromStatus(history.getFromStatus())
                .toStatus(history.getToStatus())
                .actorId(history.getActorId())
                .actorName(actorName)
                .reason(history.getReason())
                .createdAt(history.getCreatedAt())
                .build();
    }

    private String resolveActorName(UUID actorId) {
        // Try staff first
        Optional<String> staffName = staffRepository.findById(actorId).map(StaffMember::getFullName);
        if (staffName.isPresent()) return staffName.get();

        // Try supplier user
        Optional<String> supplierUserName = supplierUserRepository.findById(actorId).map(SupplierUser::getFullName);
        if (supplierUserName.isPresent()) return supplierUserName.get();

        return "Unknown Actor (" + actorId + ")";
    }

    private PurchaseOrder getPoOrThrow(UUID id) {
        return poRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("PO not found"));
    }
}
