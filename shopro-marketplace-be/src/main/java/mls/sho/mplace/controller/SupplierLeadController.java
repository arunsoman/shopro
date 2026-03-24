package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.config.MarketplaceUser;
import mls.sho.mplace.service.SupplierLeadService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Supplier Lead Controller
 * Scoped to /api/supplier/**
 */
@RestController
@RequestMapping("/api/supplier/leads")
@RequiredArgsConstructor
public class SupplierLeadController {

    private final SupplierLeadService leadService;

    public record MarketLead(String id, String requirement, String category, String volume, String proximity, String urgency) {}

    @GetMapping
    public List<MarketLead> getLeads(@AuthenticationPrincipal MarketplaceUser user) {
        return leadService.getLeadsForSupplier(user.getSupplierId()).stream()
                .map(l -> new MarketLead(
                        l.getId().toString(),
                        l.getTitle(),
                        l.getCategory() != null ? l.getCategory().getName() : "UNSPECIFIED",
                        "High", // Mock volume
                        "5km", // Mock proximity
                        l.getUrgency()
                )).collect(Collectors.toList());
    }
}
