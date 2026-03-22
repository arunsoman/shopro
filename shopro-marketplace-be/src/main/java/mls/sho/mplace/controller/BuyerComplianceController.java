package mls.sho.mplace.controller;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Buyer (Restaurant) Compliance Controller
 * Scoped to /api/buyer/**
 */
@RestController
@RequestMapping("/api/buyer/compliance")
@RequiredArgsConstructor
public class BuyerComplianceController {

    private final mls.sho.mplace.service.ComplianceService complianceService;

    public record Document(String id, String type, String status, String expiry) {}
    public record VerificationStatus(String overall, List<Document> documents) {}

    @GetMapping("/status")
    public VerificationStatus getStatus() {
        List<Document> docs = complianceService.getMyDocuments().stream()
                .map(d -> new Document(
                        d.getId().toString(),
                        d.getType(),
                        d.getStatus().name(),
                        d.getExpiryDate() != null ? d.getExpiryDate().toString() : "N/A"
                )).toList();

        return new VerificationStatus("VERIFIED", docs);
    }

    @PostMapping("/documents")
    public Map<String, String> uploadDocument(@RequestBody Map<String, String> payload) {
        // complianceService.uploadDocument(...)
        return Map.of("id", "DOC-" + System.currentTimeMillis(), "status", "PENDING_REVIEW");
    }
}
