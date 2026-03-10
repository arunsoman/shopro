package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.dto.inventory.CreatePurchaseOrderRequest;
import mls.sho.dms.application.dto.inventory.PurchaseOrderResponse;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.POService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.entity.staff.Role;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import mls.sho.dms.repository.inventory.SupplierRepository;
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
                .supplierName(po.getSupplier().getCompanyName())
                .status(po.getStatus())
                .totalValue(po.getTotalValue())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .items(po.getLines().stream()
                        .map(line -> PurchaseOrderResponse.PurchaseOrderLineResponse.builder()
                                .ingredientName(line.getIngredient().getName())
                                .orderedQty(line.getOrderedQty())
                                .unitOfMeasure(line.getIngredient().getUnitOfMeasure())
                                .build())
                        .collect(Collectors.toList()))
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
        
        // Auto Approval Tier (< $500)
        if (total.compareTo(TIER1_AUTO_LIMIT) < 0) {
            log.info("PO #{} auto-approved (Value: ${})", po.getId(), total);
            po.setStatus(PurchaseOrderStatus.APPROVED);
            po.setApprovedAt(Instant.now());
            // System auto-approves, no specific approver mapped
            poRepository.save(po);
            dispatchPurchaseOrder(po);
            return po;
        }

        // Needs Manual Approval
        po.setStatus(PurchaseOrderStatus.PENDING_APPROVAL); // Note: Need to add this to the enum if missing, or use current options. 
        // Wait, 'PENDING_APPROVAL' wasn't in PurchaseOrderStatus. Let's add it if needed, or leave as DRAFT until Approved. 
        // Actually, let's keep it as DRAFT and just alert the manager, or we should update Enum. Let's assume we update the enum later. Let's just hold it in DRAFT.
        // Actually, the US says "draft is cancelled on reject" and "routed for approval". Let's use PENDING_APPROVAL.
        // If Enum lacks PENDING_APPROVAL, I will need to edit PurchaseOrderStatus to include it.
        // For now let's set it to some intermediate state or just DRAFT. Let's say we update the entity soon.
        
        String requiredRole = "Inventory Manager";
        if (total.compareTo(TIER2_MANAGER_LIMIT) >= 0 && total.compareTo(TIER3_GM_LIMIT) < 0) {
            requiredRole = "General Manager";
        } else if (total.compareTo(TIER3_GM_LIMIT) >= 0) {
            requiredRole = "Owner";
        }

        log.info("PO #{} requires {} approval (Value: ${})", po.getId(), requiredRole, total);
        
        alertService.sendNotification(
            "ApprovalsTeam", 
            "PO Approval Required: #" + po.getId(), 
            "PO #" + po.getId() + " for $" + total + " requires " + requiredRole + " approval."
        );

        return poRepository.save(po);
    }

    @Override
    @Transactional
    public PurchaseOrder approveOrder(UUID poId, UUID approverId) {
        PurchaseOrder po = getPoOrThrow(poId);
        StaffMember approver = staffRepository.findById(approverId)
            .orElseThrow(() -> new IllegalArgumentException("Approver not found"));

        validateApprovalPermissions(po.getTotalValue(), approver.getRole());

        po.setStatus(PurchaseOrderStatus.APPROVED);
        po.setApprovedBy(approver);
        po.setApprovedAt(Instant.now());
        
        PurchaseOrder savedPo = poRepository.save(po);
        
        log.info("PO #{} approved by {} ({})", po.getId(), approver.getFullName(), approver.getRole());
        dispatchPurchaseOrder(savedPo);
        
        return savedPo;
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

        po.setStatus(PurchaseOrderStatus.REJECTED);
        po.setApprovedBy(approver); // Storing the rejector in the approvedBy field (as a tracker), or to an AuditLog.
        
        PurchaseOrder savedPo = poRepository.save(po);
        
        log.info("PO #{} rejected by {}. Reason: {}", po.getId(), approver.getFullName(), reason);
        
        alertService.sendNotification(
            po.getGeneratedBy().getFullName(), 
            "PO Rejected: #" + po.getId(), 
            "PO #" + po.getId() + " was rejected by " + approver.getFullName() + ". Reason: " + reason
        );
        
        return savedPo;
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

    private void dispatchPurchaseOrder(PurchaseOrder po) {
        // US-14.2 Auto Dispatch
        po.setStatus(PurchaseOrderStatus.SENT);
        po.setSentAt(Instant.now());
        poRepository.save(po);
        
        String vendorEmail = po.getSupplier().getContactEmail();
        if (vendorEmail != null) {
            String ackLink = "http://localhost:3000/vendor/po/" + po.getId() + "/acknowledge";
            alertService.dispatchEmail(
                vendorEmail, 
                "New Purchase Order: #" + po.getId(), 
                "Please find attached Purchase Order #" + po.getId() + ". Please acknowledge receipt using this link: " + ackLink
            );
        }
        log.info("PO #{} dispatched to {}", po.getId(), po.getSupplier().getCompanyName());
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

    private PurchaseOrder getPoOrThrow(UUID id) {
        return poRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("PO not found"));
    }
}
