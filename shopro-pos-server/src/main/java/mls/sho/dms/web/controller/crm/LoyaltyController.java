package mls.sho.dms.web.controller.crm;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.*;
import mls.sho.dms.application.service.crm.LoyaltyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    // --- Config ---
    @GetMapping("/config")
    public LoyaltyConfigResponse getConfig() {
        return loyaltyService.getConfig();
    }

    @PutMapping("/config")
    public LoyaltyConfigResponse updateConfig(@Valid @RequestBody UpdateLoyaltyConfigRequest request) {
        return loyaltyService.updateConfig(request);
    }

    // --- Tiers ---
    @GetMapping("/tiers")
    public List<LoyaltyTierResponse> getTiers() {
        return loyaltyService.getTiers();
    }

    @PostMapping("/tiers")
    @ResponseStatus(HttpStatus.CREATED)
    public LoyaltyTierResponse createTier(@Valid @RequestBody CreateLoyaltyTierRequest request) {
        return loyaltyService.createTier(request);
    }

    @PutMapping("/tiers/{id}")
    public LoyaltyTierResponse updateTier(@PathVariable UUID id, @Valid @RequestBody UpdateLoyaltyTierRequest request) {
        return loyaltyService.updateTier(id, request);
    }

    @DeleteMapping("/tiers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTier(@PathVariable UUID id) {
        loyaltyService.deleteTier(id);
    }

    // --- Points & Transactions ---
    @GetMapping("/customers/{customerId}/balance")
    public LoyaltyBalanceResponse getBalance(@PathVariable UUID customerId) {
        return loyaltyService.getBalance(customerId);
    }

    @PostMapping("/customers/{customerId}/redeem")
    public RedeemPointsResponse redeemPoints(@PathVariable UUID customerId, @Valid @RequestBody RedeemPointsRequest request) {
        return loyaltyService.redeemPoints(customerId, request);
    }

    @GetMapping("/customers/{customerId}/transactions")
    public List<LoyaltyTransactionResponse> getTransactionHistory(@PathVariable UUID customerId) {
        return loyaltyService.getTransactionHistory(customerId);
    }

    // --- Bonus Events ---
    @GetMapping("/events/active")
    public List<BonusEventResponse> getActiveBonusEvents() {
        return loyaltyService.getActiveBonusEvents();
    }

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    public BonusEventResponse createBonusEvent(@Valid @RequestBody CreateBonusEventRequest request) {
        return loyaltyService.createBonusEvent(request);
    }

    @DeleteMapping("/events/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBonusEvent(@PathVariable UUID id) {
        loyaltyService.deleteBonusEvent(id);
    }
}
