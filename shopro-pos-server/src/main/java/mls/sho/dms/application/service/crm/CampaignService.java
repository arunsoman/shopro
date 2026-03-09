package mls.sho.dms.application.service.crm;

import mls.sho.dms.application.dto.crm.AutomatedCampaignResponse;
import mls.sho.dms.application.dto.crm.CreateCampaignRequest;

import java.util.List;
import java.util.UUID;

public interface CampaignService {
    AutomatedCampaignResponse createAutomatedCampaign(CreateCampaignRequest request);
    AutomatedCampaignResponse getCampaign(UUID id);
    List<AutomatedCampaignResponse> getAllCampaigns();
    void deleteCampaign(UUID id);
    void triggerCampaignEvents(); // Scheduled task
}
