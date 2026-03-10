package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.AutomatedCampaign;
import mls.sho.dms.entity.crm.TriggerEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AutomatedCampaignRepository extends JpaRepository<AutomatedCampaign, UUID> {
    List<AutomatedCampaign> findByIsActiveTrueAndTriggerEvent(TriggerEvent triggerEvent);
}
