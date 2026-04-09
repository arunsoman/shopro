package mls.sho.dms.web.controller.crm;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.CreatePromoCodeRequest;
import mls.sho.dms.application.dto.crm.PromoCodeResponse;
import mls.sho.dms.application.dto.crm.ValidatePromoResponse;
import mls.sho.dms.application.service.crm.PromoCodeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/promos")
@RequiredArgsConstructor
public class PromoCodeController {

    private final PromoCodeService promoService;

    @PostMapping
    public ResponseEntity<PromoCodeResponse> createPromoCode(@Valid @RequestBody CreatePromoCodeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promoService.createPromoCode(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromoCodeResponse> getPromoCode(@PathVariable UUID id) {
        return ResponseEntity.ok(promoService.getPromoCode(id));
    }

    @GetMapping
    public ResponseEntity<List<PromoCodeResponse>> getAllPromoCodes() {
        return ResponseEntity.ok(promoService.getAllPromoCodes());
    }

    @GetMapping("/validate")
    public ResponseEntity<ValidatePromoResponse> validatePromo(
            @RequestParam String code,
            @RequestParam UUID customerId) {
        return ResponseEntity.ok(promoService.validateCodeForCustomer(code, customerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromoCode(@PathVariable UUID id) {
        promoService.deletePromoCode(id);
        return ResponseEntity.noContent().build();
    }
}
