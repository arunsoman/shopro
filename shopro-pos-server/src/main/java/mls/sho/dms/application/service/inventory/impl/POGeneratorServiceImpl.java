package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.POGeneratorService;
import mls.sho.dms.entity.inventory.ingredient.RawIngredient;
import mls.sho.dms.entity.inventory.procurement.*;
import mls.sho.dms.entity.inventory.vendor.VendorBid;
import mls.sho.dms.entity.inventory.vendor.VendorBidStatus;
import mls.sho.dms.entity.inventory.vendor.VendorPriceProposal;
import mls.sho.dms.entity.inventory.vendor.VendorPriceProposalStatus;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.inventory.*;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class POGeneratorServiceImpl implements POGeneratorService {

    private final PurchaseOrderRepository poRepository;
    private final VendorBidRepository bidRepository;
    private final VendorPriceProposalRepository proposalRepository;
    private final StaffRepository staffRepository;
    private final RFQRepository rfqRepository;

    private static final UUID SYSTEM_ACTOR_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Override
    @Transactional
    public PurchaseOrder createFromRfq(UUID rfqId, UUID staffId) {
        // Enforce 1:1 since DB constraint is limited by partitioning
        if (poRepository.findByRfqId(rfqId).isPresent()) {
            return poRepository.findByRfqId(rfqId).get();
        }

        RFQ rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new IllegalArgumentException("RFQ not found: " + rfqId));

        StaffMember staff = staffId != null ? staffRepository.findById(staffId).orElse(null) : null;

        PurchaseOrder po = new PurchaseOrder();
        po.setRfq(rfq);
        po.setGeneratedBy(staff);
        po.setStatus(PurchaseOrderStatus.DRAFT);
        po.setExpectedDeliveryDate(rfq.getDesiredDeliveryDate());

        PurchaseOrderLine line = new PurchaseOrderLine();
        line.setPurchaseOrder(po);
        line.setIngredient(rfq.getIngredient());
        line.setOrderedQty(rfq.getRequiredQty());
        line.setUnitCost(rfq.getIngredient().getCostPerUnit()); // Initial estimate
        po.setLines(new ArrayList<>(java.util.List.of(line)));

        po.setTotalValue(line.getOrderedQty().multiply(line.getUnitCost()));

        return poRepository.save(po);
    }

    @Override
    @Transactional
    public PurchaseOrder awardPo(UUID rfqId, UUID bidId, UUID staffId) {
        PurchaseOrder po = poRepository.findByRfqId(rfqId)
                .orElseThrow(() -> new IllegalArgumentException("No PO found for RFQ: " + rfqId));

        VendorBid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new IllegalArgumentException("Bid not found: " + bidId));

        StaffMember staff = staffId != null ? staffRepository.findById(staffId).orElse(null) : null;

        po.setSupplier(bid.getSupplier());
        po.setSourceBidId(bidId);
        po.setExpectedDeliveryDate(bid.getDeliveryDate());
        
        // Update lines with bid price/qty
        if (!po.getLines().isEmpty()) {
            PurchaseOrderLine line = po.getLines().get(0);
            line.setUnitCost(bid.getUnitPrice());
            line.setOrderedQty(bid.getQuantityAvailable().min(po.getRfq().getRequiredQty()));
            po.setTotalValue(line.getOrderedQty().multiply(line.getUnitCost()));
        }

        if (po.getRfq().getStatus() != RfqStatus.AWARDED) {
            po.getRfq().setStatus(RfqStatus.AWARDED);
        }

        return poRepository.save(po);
    }

    @Override
    @Transactional
    public PurchaseOrder createFromBid(UUID bidId, UUID staffId) {
        VendorBid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new IllegalArgumentException("Bid not found: " + bidId));

        StaffMember staff = staffId != null ? staffRepository.findById(staffId).orElse(null) : null;

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(bid.getSupplier());
        po.setGeneratedBy(staff); // null for system-generated POs (e.g. auto-awards)
        po.setStatus(PurchaseOrderStatus.DRAFT);
        po.setSourceBidId(bidId);
        po.setExpectedDeliveryDate(bid.getDeliveryDate());

        RFQ rfq = bid.getRfq();
        PurchaseOrderLine line = new PurchaseOrderLine();
        line.setPurchaseOrder(po);
        line.setIngredient(rfq.getIngredient());
        line.setOrderedQty(rfq.getRequiredQty());
        line.setUnitCost(bid.getUnitPrice());
        po.getLines().add(line);

        po.setTotalValue(line.getOrderedQty().multiply(line.getUnitCost()));

        bid.setStatus(VendorBidStatus.WON);
        bidRepository.save(bid);

        if (rfq.getStatus() != RfqStatus.AWARDED) {
            rfq.setStatus(RfqStatus.AWARDED);
        }

        return poRepository.save(po);
    }

    @Override
    @Transactional
    public PurchaseOrder createFromProposal(UUID proposalId, UUID staffId) {
        VendorPriceProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found: " + proposalId));

        StaffMember staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + staffId));

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(proposal.getSupplier());
        po.setGeneratedBy(staff);
        po.setStatus(PurchaseOrderStatus.DRAFT);
        po.setSourceProposalId(proposalId);

        PurchaseOrderLine line = new PurchaseOrderLine();
        line.setPurchaseOrder(po);
        line.setIngredient(proposal.getIngredient());
        line.setOrderedQty(proposal.getProposedQuantity() != null ? proposal.getProposedQuantity() : BigDecimal.ONE);
        line.setUnitCost(proposal.getProposedPrice());
        po.getLines().add(line);

        po.setTotalValue(line.getOrderedQty().multiply(line.getUnitCost()));

        proposal.setStatus(VendorPriceProposalStatus.ACCEPTED);
        proposal.setGeneratedPo(po);
        proposalRepository.save(proposal);
        return poRepository.save(po);
    }

    @Override
    @Transactional
    public PurchaseOrder generateAutoPO(RawIngredient ingredient) {
        if (ingredient.getSupplier() == null) {
            log.warn("Cannot generate auto-PO for {}: No primary supplier assigned.", ingredient.getName());
            return null;
        }

        BigDecimal qtyNeeded = ingredient.getParLevel().subtract(ingredient.getCurrentStock());
        if (qtyNeeded.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(ingredient.getSupplier());
        po.setStatus(PurchaseOrderStatus.DRAFT); // Start as DRAFT, can be auto-sent by a separate policy
        
        // Use ingredient-specific timeframe (Y days) if set (>0), else fall back to supplier lead time
        int arrivalDays = ingredient.getExpectedArrivalDays() > 0 
            ? ingredient.getExpectedArrivalDays() 
            : ingredient.getSupplier().getLeadTimeDays();
        po.setExpectedDeliveryDate(LocalDate.now().plusDays(arrivalDays));
        
        // Set system actor as generator for automated POs
        staffRepository.findById(SYSTEM_ACTOR_ID).ifPresent(po::setGeneratedBy);
        
        PurchaseOrderLine line = new PurchaseOrderLine();
        line.setPurchaseOrder(po);
        line.setIngredient(ingredient);
        line.setOrderedQty(qtyNeeded);
        line.setUnitCost(ingredient.getCostPerUnit());
        po.getLines().add(line);

        po.setTotalValue(qtyNeeded.multiply(ingredient.getCostPerUnit()));

        log.info("Auto-PO generated for {}: SKU-{} Supplier-{}", ingredient.getName(), ingredient.getId(), ingredient.getSupplier().getCompanyName());
        return poRepository.save(po);
    }
}
