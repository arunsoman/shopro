package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.PriceProposalResponse;
import mls.sho.dms.application.dto.inventory.ReviewProposalRequest;

import java.util.List;
import java.util.UUID;

public interface ProcurementService {
    List<PriceProposalResponse> getPendingProposals();
    void reviewProposal(UUID proposalId, UUID staffId, ReviewProposalRequest request);
    List<PriceProposalResponse> getProposalHistory();
    UUID createDraftPoFromProposal(UUID proposalId, UUID staffId);
}
