package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.config.MarketplaceUser;
import mls.sho.mplace.service.BidService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Enhanced Supplier Bid Controller
 * Scoped to /api/supplier/**
 */
@RestController
@RequestMapping("/api/supplier/bids")
@RequiredArgsConstructor
public class SupplierBidController {

    private final BidService bidService;

    public record BidInvitationDTO(String id, String title, String category, String deadline, String status, double targetVolume) {}
    public record BidHistoryDTO(String id, String title, double quotedAmount, String status, String date) {}

    @GetMapping("/invitations")
    public List<BidInvitationDTO> getInvitations(@AuthenticationPrincipal MarketplaceUser user) {
        return bidService.getInvitations().stream()
                .map(bi -> new BidInvitationDTO(
                        bi.getId().toString(),
                        bi.getTitle(),
                        bi.getCategory() != null ? bi.getCategory().getName() : "UNSPECIFIED",
                        bi.getDeadline().toString(),
                        bi.getStatus().name(),
                        5000.0 // Mock target volume
                )).toList();
    }

    @GetMapping("/all")
    public List<BidInvitationDTO> getAllBids(@AuthenticationPrincipal MarketplaceUser user) {
        return getInvitations(user);
    }

    @GetMapping("/history")
    public List<BidHistoryDTO> getHistory(@AuthenticationPrincipal MarketplaceUser user) {
        return bidService.getQuotesForSupplier(user.getSupplierId()).stream()
                .map(q -> new BidHistoryDTO(
                        q.getId().toString(),
                        q.getBidInvitation().getTitle(),
                        q.getTotalAmount().doubleValue(),
                        q.getStatus().name(),
                        "Recently"
                )).toList();
    }

    @PostMapping("/{id}/quote")
    public String submitQuote(@PathVariable String id, @RequestBody Object quote) {
        return "QUOTE_SUBMITTED_SUCCESSFULLY.X";
    }
}
