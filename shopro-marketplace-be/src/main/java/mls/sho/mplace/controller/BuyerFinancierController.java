package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.service.FinanceService;
import mls.sho.mplace.service.SupportService;
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

    private final mls.sho.mplace.service.FinanceService financeService;
    private final mls.sho.mplace.service.SupportService supportService;

    public record Transaction(String id, String date, String description, double amount, String status) {}
    public record Ticket(String id, String subject, String status, String priority) {}

    @GetMapping("/stats")
    public FinanceService.BuyerFinanceStats getStats() {
        return financeService.getBuyerStats();
    }

    @GetMapping("/transactions")
    public List<Transaction> getTransactions() {
        return financeService.getAllTransactions().stream()
                .map(t -> new Transaction(
                        t.getId().toString(),
                        t.getCreatedAt().toString(),
                        t.getDescription(),
                        t.getAmount().doubleValue(),
                        t.getStatus().name()
                )).toList();
    }

    @GetMapping("/tickets")
    public List<Ticket> getTickets() {
        return supportService.getMyTickets().stream()
                .map(t -> new Ticket(
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
