package mls.sho.mplace.controller;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Supplier Compliance Controller
 * Scoped to /api/supplier/**
 */
@RestController
@RequestMapping("/api/supplier/compliance")
@RequiredArgsConstructor
public class SupplierComplianceController {

    private final mls.sho.mplace.service.ComplianceService complianceService;

    public record ComplianceStatus(String status, List<ComplianceDoc> documents) {}
    public record ComplianceDoc(String name, String status, String expiryDate) {}

    @GetMapping("/status")
    public ComplianceStatus getStatus() {
        List<ComplianceDoc> docs = complianceService.getMyDocuments().stream()
                .map(d -> new ComplianceDoc(
                        d.getName(),
                        d.getStatus().name(),
                        d.getExpiryDate() != null ? d.getExpiryDate().toString() : "N/A"
                )).toList();

        return new ComplianceStatus("VERIFIED", docs);
    }

    @PostMapping("/documents")
    public String uploadDocument(@RequestBody Map<String, String> doc) {
        // complianceService.uploadDocument(...)
        return "DOCUMENT_UPLOADED_FOR_REVIEW.SIGNAL";
    }
}
