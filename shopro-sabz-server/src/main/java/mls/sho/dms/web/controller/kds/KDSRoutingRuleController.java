package mls.sho.dms.web.controller.kds;

import jakarta.validation.Valid;
import mls.sho.dms.application.dto.kds.KDSRoutingRuleRequest;
import mls.sho.dms.application.dto.kds.KDSRoutingRuleResponse;
import mls.sho.dms.service.kds.KDSService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/kds/routing-rules")
public class KDSRoutingRuleController {

    private final KDSService kdsService;

    public KDSRoutingRuleController(KDSService kdsService) {
        this.kdsService = kdsService;
    }

    @GetMapping
    public List<KDSRoutingRuleResponse> getAllRoutingRules() {
        return kdsService.getAllRoutingRules();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KDSRoutingRuleResponse createRoutingRule(@Valid @RequestBody KDSRoutingRuleRequest request) {
        return kdsService.createRoutingRule(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoutingRule(@PathVariable UUID id) {
        kdsService.deleteRoutingRule(id);
    }
}
