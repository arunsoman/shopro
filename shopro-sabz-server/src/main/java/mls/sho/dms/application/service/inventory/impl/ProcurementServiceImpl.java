package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.inventory.PriceProposalResponse;
import mls.sho.dms.application.dto.inventory.ReviewProposalRequest;
import mls.sho.dms.application.service.inventory.ProcurementService;
import mls.sho.dms.application.service.inventory.POGeneratorService;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.entity.inventory.SupplierIngredientPricing;
import mls.sho.dms.repository.staff.StaffRepository;
import mls.sho.dms.repository.inventory.SupplierIngredientPricingRepository;
import mls.sho.dms.repository.inventory.VendorPriceProposalRepository;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.application.service.inventory.POStateMachineService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.application.service.inventory.AlertService;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcurementServiceImpl implements ProcurementService {

    private final VendorPriceProposalRepository proposalRepository;
    private final StaffRepository staffRepository;
    private final SupplierIngredientPricingRepository pricingRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final AlertService alertService;
    private final POGeneratorService poGeneratorService;
    private final POStateMachineService poStateMachineService;

    @Override
    @Transactional(readOnly = true)
    public List<PriceProposalResponse> getPendingProposals() {
        return proposalRepository.findByStatusOrderByCreatedAtDesc(VendorPriceProposalStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void reviewProposal(UUID proposalId, UUID staffId, ReviewProposalRequest request) {
        VendorPriceProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        if (proposal.getStatus() != VendorPriceProposalStatus.PENDING) {
            throw new RuntimeException("Proposal has already been reviewed");
        }

        StaffMember staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        VendorPriceProposalStatus status = VendorPriceProposalStatus.valueOf(request.getStatus().toUpperCase());
        proposal.setStatus(status);
        proposal.setReviewedBy(staff);
        proposal.setReviewedAt(Instant.now());
        
        // Append reason to notes if modifying
        if (request.getReason() != null && !request.getReason().trim().isEmpty()) {
            proposal.setNotes((proposal.getNotes() != null ? proposal.getNotes() + "\n\n" : "") 
                                + "Reviewer Note: " + request.getReason());
        }

        proposalRepository.save(proposal);

        // If accepted, update the catalog pricing and generate PO
        if (status == VendorPriceProposalStatus.ACCEPTED) {
            updateSupplierCatalogPricing(proposal);
            PurchaseOrder po = poGeneratorService.createFromProposal(proposalId, staffId);
            
            // Auto-transition: DRAFT -> APPROVED -> SENT
            // (Note: Skip PENDING_APPROVAL as the review itself IS the approval for proposals)
            try {
                poStateMachineService.transition(po.getId(), PurchaseOrderStatus.APPROVED, staffId, "Auto-approved via Price Proposal Acceptance");
                poStateMachineService.transition(po.getId(), PurchaseOrderStatus.SENT, staffId, "Auto-sent via Price Proposal Acceptance");
                log.info("Procurement: Automatically transitioned PO {} to SENT", po.getId());
            } catch (Exception e) {
                log.error("Procurement: Failed to auto-transition PO status for order {}", po.getId(), e);
            }
        }
        
        log.info("Procurement: Price proposal {} {} by {}", proposalId, status, staff.getFullName());
        
        // Notify the supplier user who submitted the proposal
        if (proposal.getSubmittedBy() != null && proposal.getSubmittedBy().getEmail() != null) {
            String ingredientName = proposal.getIngredient() != null ? proposal.getIngredient().getName() : "Requested Ingredient";
            String subject = "Update on Price Proposal: " + ingredientName;
            
            String message = String.format("Your price proposal for %s ($%.2f) has been %s by %s.%s",
                ingredientName,
                proposal.getProposedPrice() != null ? proposal.getProposedPrice().doubleValue() : 0.0,
                status.toString().toLowerCase(),
                staff.getFullName(),
                request.getReason() != null ? "\n\nNote: " + request.getReason() : ""
            );
            
            alertService.sendNotification(proposal.getSubmittedBy().getEmail(), subject, message);
        }
    }

    private void updateSupplierCatalogPricing(VendorPriceProposal proposal) {
        SupplierIngredientPricing pricing = pricingRepository
                .findBySupplierId(proposal.getSupplier().getId()).stream()
                .filter(p -> p.getIngredient().getId().equals(proposal.getIngredient().getId()))
                .findFirst()
                .orElse(new SupplierIngredientPricing());

        if (pricing.getId() == null) {
            pricing.setSupplier(proposal.getSupplier());
            pricing.setIngredient(proposal.getIngredient());
        }

        pricing.setUnitPrice(proposal.getProposedPrice());
        pricing.setLastUpdatedAt(Instant.now());
        pricingRepository.save(pricing);
        
        log.info("Procurement: Updated catalog pricing for supplier {} and ingredient {} to {}", 
                proposal.getSupplier().getCompanyName(), proposal.getIngredient().getName(), proposal.getProposedPrice());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PriceProposalResponse> getProposalHistory() {
        return proposalRepository.findByStatusNotOrderByReviewedAtDesc(VendorPriceProposalStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UUID createDraftPoFromProposal(UUID proposalId, UUID staffId) {
        PurchaseOrder po = poGeneratorService.createFromProposal(proposalId, staffId);
        return po.getId();
    }

    private PriceProposalResponse mapToResponse(VendorPriceProposal proposal) {
        // Find current price from catalog if exists, otherwise from ingredient default
        Double currentPrice = pricingRepository
                .findBySupplierId(proposal.getSupplier().getId()).stream()
                .filter(p -> p.getIngredient().getId().equals(proposal.getIngredient().getId()))
                .findFirst()
                .map(p -> p.getUnitPrice().doubleValue())
                .orElse(proposal.getIngredient().getCostPerUnit() != null ? proposal.getIngredient().getCostPerUnit().doubleValue() : 0.0);

        return PriceProposalResponse.builder()
                .id(proposal.getId())
                .supplierId(proposal.getSupplier().getId())
                .supplierName(proposal.getSupplier().getCompanyName())
                .ingredientId(proposal.getIngredient().getId())
                .ingredientName(proposal.getIngredient().getName())
                .unitOfMeasure(proposal.getIngredient().getUnitOfMeasure())
                .proposedPrice(proposal.getProposedPrice().doubleValue())
                .currentPrice(currentPrice)
                .notes(proposal.getNotes())
                .status(proposal.getStatus())
                .createdAt(proposal.getCreatedAt())
                .generatedPoId(proposal.getGeneratedPo() != null ? proposal.getGeneratedPo().getId() : null)
                .generatedPoStatus(proposal.getGeneratedPo() != null ? proposal.getGeneratedPo().getStatus().name() : null)
                .build();
    }
}
