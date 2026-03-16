package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.POGeneratorService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.inventory.*;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class POGeneratorServiceImpl implements POGeneratorService {

    private final PurchaseOrderRepository poRepository;
    private final VendorBidRepository bidRepository;
    private final VendorPriceProposalRepository proposalRepository;
    private final StaffRepository staffRepository;

    @Override
    @Transactional
    public PurchaseOrder createFromBid(UUID bidId, UUID staffId) {
        VendorBid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new IllegalArgumentException("Bid not found: " + bidId));

        StaffMember staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + staffId));

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(bid.getSupplier());
        po.setGeneratedBy(staff);
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
        po.setExpectedDeliveryDate(LocalDate.now().plusDays(ingredient.getSupplier().getLeadTimeDays()));
        
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
