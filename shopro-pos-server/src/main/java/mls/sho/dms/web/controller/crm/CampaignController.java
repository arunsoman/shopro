package mls.sho.dms.web.controller.crm;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.AutomatedCampaignResponse;
import mls.sho.dms.application.dto.crm.CreateCampaignRequest;
import mls.sho.dms.application.service.crm.CampaignService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    public ResponseEntity<AutomatedCampaignResponse> createCampaign(@Valid @RequestBody CreateCampaignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campaignService.createAutomatedCampaign(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutomatedCampaignResponse> getCampaign(@PathVariable UUID id) {
        return ResponseEntity.ok(campaignService.getCampaign(id));
    }

    @GetMapping
    public ResponseEntity<List<AutomatedCampaignResponse>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable UUID id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }
}
