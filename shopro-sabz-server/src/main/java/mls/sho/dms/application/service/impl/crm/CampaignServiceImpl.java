package mls.sho.dms.application.service.impl.crm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.crm.AutomatedCampaignResponse;
import mls.sho.dms.application.dto.crm.CreateCampaignRequest;
import mls.sho.dms.application.service.crm.CampaignService;
import mls.sho.dms.entity.crm.AutomatedCampaign;
import mls.sho.dms.entity.crm.TriggerEvent;
import mls.sho.dms.repository.crm.AutomatedCampaignRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignServiceImpl implements CampaignService {

    private final AutomatedCampaignRepository campaignRepository;

    @Override
    @Transactional
    public AutomatedCampaignResponse createAutomatedCampaign(CreateCampaignRequest request) {
        AutomatedCampaign campaign = AutomatedCampaign.builder()
                .name(request.name())
                .triggerEvent(request.triggerEvent())
                .delayHours(request.delayHours())
                .templateId(request.templateId())
                .isActive(request.isActive() != null ? request.isActive() : true)
                .build();

        AutomatedCampaign saved = campaignRepository.save(campaign);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AutomatedCampaignResponse getCampaign(UUID id) {
        return campaignRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AutomatedCampaignResponse> getAllCampaigns() {
        return campaignRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCampaign(UUID id) {
        campaignRepository.deleteById(id);
    }

    @Override
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void triggerCampaignEvents() {
        log.info("Triggering automated campaign events...");
        // In a real implementation, this would query customers matching triggers
        // (e.g., birthdays today) and send messages via a MessageService.
        // For Phase 2, we provide the structural capacity.
    }

    private AutomatedCampaignResponse mapToResponse(AutomatedCampaign campaign) {
        return new AutomatedCampaignResponse(
                campaign.getId(),
                campaign.getName(),
                campaign.getTriggerEvent(),
                campaign.getDelayHours(),
                campaign.getTemplateId(),
                campaign.isActive(),
                campaign.getCreatedAt(),
                campaign.getUpdatedAt()
        );
    }
}
