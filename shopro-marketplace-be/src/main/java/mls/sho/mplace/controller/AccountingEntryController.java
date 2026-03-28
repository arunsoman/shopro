package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.service.AccountingEntryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting")
@RequiredArgsConstructor
public class AccountingEntryController {

    private final AccountingEntryService entryService;

    @PostMapping("/petty-cash/fetch")
    public ResponseEntity<Void> fetchPettyCash(
            @RequestParam UUID venueId,
            @RequestParam BigDecimal amount,
            Principal principal) {
        entryService.fetchPettyCash(venueId, amount, principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/expense/pay")
    public ResponseEntity<Void> recordExpense(
            @RequestParam UUID venueId,
            @RequestParam BigDecimal amount,
            @RequestParam String category,
            @RequestParam String description,
            Principal principal) {
        entryService.recordExpense(venueId, amount, category, description, principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/staff/advance")
    public ResponseEntity<Void> payStaffAdvance(
            @RequestParam UUID venueId,
            @RequestParam UUID staffId,
            @RequestParam BigDecimal amount,
            Principal principal) {
        entryService.payStaffAdvance(venueId, staffId, amount, principal.getName());
        return ResponseEntity.ok().build();
    }
}
