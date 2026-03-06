package mls.sho.dms.entity.crm;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import mls.sho.dms.entity.core.BaseEntity;

import java.time.Instant;

/**
 * Tracks SMS/Email marketing campaigns sent to targeted customer segments.
 */
@Entity
@Table(name = "marketing_campaign")
public class MarketingCampaign extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "message_template", nullable = false, columnDefinition = "text")
    private String messageTemplate;

    @Column(name = "target_filter_description", length = 200)
    private String targetFilterDescription;

    @Column(name = "promo_code", length = 50)
    private String promoCode;

    @Column(name = "scheduled_for")
    private Instant scheduledFor;

    @Column(name = "is_executed", nullable = false)
    private boolean isExecuted = false;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMessageTemplate() { return messageTemplate; }
    public void setMessageTemplate(String messageTemplate) { this.messageTemplate = messageTemplate; }
    public String getTargetFilterDescription() { return targetFilterDescription; }
    public void setTargetFilterDescription(String targetFilterDescription) { this.targetFilterDescription = targetFilterDescription; }
    public String getPromoCode() { return promoCode; }
    public void setPromoCode(String promoCode) { this.promoCode = promoCode; }
    public Instant getScheduledFor() { return scheduledFor; }
    public void setScheduledFor(Instant scheduledFor) { this.scheduledFor = scheduledFor; }
    public boolean isExecuted() { return isExecuted; }
    public void setExecuted(boolean executed) { isExecuted = executed; }
}
