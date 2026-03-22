package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.repository.BidInvitationRepository;
import mls.sho.mplace.repository.QuoteRepository;
import mls.sho.mplace.service.BidService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Buyer (Restaurant) Bid Controller
 * Scoped to /api/buyer/**
 */
@RestController
@RequestMapping("/api/buyer/bids")
@RequiredArgsConstructor
public class BuyerBidController {

    private final BidService bidService;

    public record BidInvitationSummary(String id, String title, int responses, String deadline) {}
    public record BidResponse(String id, String supplier, double total, String delivery, double rating, String itemsMatched, boolean isWinner, String dna) {}

    @GetMapping("/invitations")
    public List<BidInvitationSummary> getInvitations() {
        return bidService.getInvitations().stream()
                .map(bi -> new BidInvitationSummary(
                        bi.getId().toString(),
                        bi.getTitle(),
                        bidService.getQuotesForInvitation(bi.getId()).size(),
                        bi.getDeadline().toString()
                )).toList();
    }

    @GetMapping("/{invitationId}/responses")
    public List<BidResponse> getResponses(@PathVariable String invitationId) {
        return bidService.getQuotesForInvitation(UUID.fromString(invitationId)).stream()
                .map(q -> new BidResponse(
                     q.getId().toString(),
                     q.getSupplier().getName(),
                     q.getTotalAmount().doubleValue(),
                     "TBD",
                     q.getSupplier().getRating(),
                     "All matched",
                     q.getStatus() == mls.sho.mplace.entity.Quote.QuoteStatus.ACCEPTED,
                     "PLATFORM_VERIFIED"
                )).toList();
    }
}
