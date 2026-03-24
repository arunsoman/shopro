package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.*;
import mls.sho.mplace.entity.*;
import mls.sho.mplace.service.BidService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operator/bids")
@RequiredArgsConstructor
public class OperatorBidController {

    private final BidService bidService;
    private final mls.sho.mplace.service.PerformanceAnalyticsService performanceAnalyticsService;

    @GetMapping
    public List<BidInvitationDto> getAllBids() {
        return bidService.getAllInvitations().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public BidInvitationDto getBidById(@PathVariable UUID id) {
        BidInvitation invitation = bidService.getInvitationById(id);
        return invitation != null ? mapToDto(invitation) : null;
    }

    @PostMapping
    public BidInvitationDto createBid(@RequestBody CreateBidRequest request) {
        return mapToDto(bidService.createBidInvitation(request));
    }

    @GetMapping("/{id}/quotes")
    public List<QuoteDto> getQuotes(@PathVariable UUID id) {
        return bidService.getQuotesByInvitationId(id).stream()
                .map(this::mapQuoteToDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/award/{quoteId}")
    public void awardBid(@PathVariable UUID id, @PathVariable UUID quoteId) {
        bidService.awardBid(id, quoteId);
    }

    private BidInvitationDto mapToDto(BidInvitation i) {
        return new BidInvitationDto(
                i.getId(),
                i.getTitle(),
                i.getDescription(),
                i.getCategory() != null ? i.getCategory().getName() : "General",
                i.getDeadline(),
                i.getStatus().name(),
                i.getUrgency(),
                i.getOperationMode().name(),
                i.getRepeatFrequency().name(),
                i.getNextRunDate(),
                i.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList())
        );
    }

    private BidItemDto mapItemToDto(BidItem item) {
        return new BidItemDto(
                item.getId(),
                item.getProductName(),
                item.getQuantity(),
                item.getUnit()
        );
    }

    private QuoteDto mapQuoteToDto(Quote q) {
        return new QuoteDto(
                q.getId(),
                q.getSupplier().getName(),
                q.getSupplier().getTrustScore(),
                q.getTotalAmount(),
                q.getStatus().name(),
                q.getLeadTime(),
                performanceAnalyticsService.getReliabilityScore(q.getSupplier().getId()),
                q.getCreatedAt()
        );
    }
}
