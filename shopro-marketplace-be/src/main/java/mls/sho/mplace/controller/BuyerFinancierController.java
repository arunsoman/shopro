package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.config.MarketplaceUser;
import mls.sho.mplace.service.FinanceService;
import mls.sho.mplace.service.SupportService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Buyer (Restaurant) Payments & Support Controller
 * Scoped to /api/buyer/**
 */
@RestController
@RequestMapping("/api/buyer/finance")
@RequiredArgsConstructor
public class BuyerFinancierController {

    private final FinanceService financeService;
    private final SupportService supportService;

    public record TransactionDTO(String id, String date, String description, double amount, String status) {}
    public record TicketDTO(String id, String subject, String status, String priority) {}

    @GetMapping("/stats")
    public FinanceService.BuyerFinanceStats getStats(@AuthenticationPrincipal MarketplaceUser user) {
        return financeService.getBuyerStats(user.getRestaurantId());
    }

    @GetMapping("/transactions")
    public List<TransactionDTO> getTransactions(@AuthenticationPrincipal MarketplaceUser user) {
        return financeService.getAllTransactionsByRestaurant(user.getRestaurantId()).stream()
                .map(t -> new TransactionDTO(
                        t.getId().toString(),
                        t.getCreatedAt().toString(),
                        t.getDescription(),
                        t.getAmount().doubleValue(),
                        t.getStatus().name()
                )).toList();
    }

    @GetMapping("/tickets")
    public List<TicketDTO> getTickets() {
        return supportService.getMyTickets().stream()
                .map(t -> new TicketDTO(
                        t.getId().toString(),
                        t.getSubject(),
                        t.getStatus().name(),
                        t.getPriority().name()
                )).toList();
    }

    @PostMapping("/tickets")
    public mls.sho.mplace.entity.SupportTicket createTicket(@RequestBody mls.sho.mplace.entity.SupportTicket ticket) {
        return supportService.createTicket(ticket);
    }
}
