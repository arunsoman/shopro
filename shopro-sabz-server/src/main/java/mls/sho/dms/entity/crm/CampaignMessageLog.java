package mls.sho.dms.entity.crm;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.time.Instant;

/**
 * Log of individual messages sent to customers as part of a marketing campaign.
 */
@Entity
@Table(
    name = "campaign_message_log",
    indexes = {
        @Index(name = "idx_campaign_msg_campaign", columnList = "marketing_campaign_id"),
        @Index(name = "idx_campaign_msg_customer", columnList = "customer_profile_id")
    }
)
public class CampaignMessageLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "marketing_campaign_id", nullable = false)
    private MarketingCampaign marketingCampaign;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_profile_id", nullable = false)
    private CustomerProfile customerProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CampaignMessageStatus status = CampaignMessageStatus.PENDING;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "opened_at")
    private Instant openedAt;

    @Column(name = "converted_at")
    private Instant convertedAt;

    public MarketingCampaign getMarketingCampaign() { return marketingCampaign; }
    public void setMarketingCampaign(MarketingCampaign marketingCampaign) { this.marketingCampaign = marketingCampaign; }
    public CustomerProfile getCustomerProfile() { return customerProfile; }
    public void setCustomerProfile(CustomerProfile customerProfile) { this.customerProfile = customerProfile; }
    public CampaignMessageStatus getStatus() { return status; }
    public void setStatus(CampaignMessageStatus status) { this.status = status; }
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
    public Instant getOpenedAt() { return openedAt; }
    public void setOpenedAt(Instant openedAt) { this.openedAt = openedAt; }
    public Instant getConvertedAt() { return convertedAt; }
    public void setConvertedAt(Instant convertedAt) { this.convertedAt = convertedAt; }
}
