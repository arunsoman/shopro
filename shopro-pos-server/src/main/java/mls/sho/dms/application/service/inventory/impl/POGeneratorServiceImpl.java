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
}
