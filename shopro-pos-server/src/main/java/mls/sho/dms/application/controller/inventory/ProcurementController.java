package mls.sho.dms.application.controller.inventory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.PriceProposalResponse;
import mls.sho.dms.application.dto.inventory.ReviewProposalRequest;
import mls.sho.dms.application.service.inventory.ProcurementService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/proposals")
@RequiredArgsConstructor
public class ProcurementController {

    private final ProcurementService procurementService;

    @GetMapping("/pending")
    public List<PriceProposalResponse> getPendingProposals() {
        return procurementService.getPendingProposals();
    }

    @PostMapping("/{id}/review")
    @ResponseStatus(HttpStatus.OK)
    public void reviewProposal(
            @PathVariable UUID id,
            @RequestBody @Valid ReviewProposalRequest request) {
        
        procurementService.reviewProposal(id, request.getStaffId(), request);
    }

    @GetMapping("/history")
    public List<PriceProposalResponse> getProposalHistory() {
        return procurementService.getProposalHistory();
    }

    @PostMapping("/{id}/create-po")
    @ResponseStatus(HttpStatus.CREATED)
    public UUID createDraftPo(
            @PathVariable UUID id,
            @RequestParam UUID staffId) {
        return procurementService.createDraftPoFromProposal(id, staffId);
    }
}
