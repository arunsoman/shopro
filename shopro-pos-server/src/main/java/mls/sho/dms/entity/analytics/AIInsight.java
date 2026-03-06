package mls.sho.dms.entity.analytics;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

/**
 * An AI-generated insight or promotion suggestion for the Owner/GM dashboard.
 * Metadata JSONB holds arbitrary context data depending on insight type
 * (e.g., time ranges, item IDs, historical patterns analysed).
 *
 * GIN index on metadata enables targeted queries like
 * "find all insights referencing item X" or "find Happy Hour suggestions".
 */
@Entity
@Table(
    name = "ai_insight",
    indexes = {
        @Index(name = "idx_ai_insight_type",  columnList = "insight_type"),
        @Index(name = "idx_ai_insight_valid", columnList = "valid_until"),
        @Index(name = "idx_ai_insight_meta_gin", columnList = "metadata") // GIN in DDL
    }
)
public class AIInsight extends BaseEntity {

    @Column(name = "insight_type", nullable = false, length = 60)
    private String insightType; // e.g., "HAPPY_HOUR_SUGGESTION", "SLOW_ITEM_ALERT", "DEMAND_FORECAST"

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    /** Suggested action text (e.g., "Run a 20% discount on Nachos Tuesday 4-6PM"). */
    @Column(name = "action_suggestion", length = 500)
    private String actionSuggestion;

    /** AI model confidence score 0.00–1.00. Displayed to Owners so they can weigh the suggestion. */
    @Column(name = "confidence_score", nullable = false, precision = 4, scale = 3)
    private BigDecimal confidenceScore;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    /** Insight is suppressed from the dashboard after this timestamp. */
    @Column(name = "valid_until")
    private Instant validUntil;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    public String getInsightType() { return insightType; }
    public void setInsightType(String insightType) { this.insightType = insightType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getActionSuggestion() { return actionSuggestion; }
    public void setActionSuggestion(String actionSuggestion) { this.actionSuggestion = actionSuggestion; }
    public BigDecimal getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(BigDecimal confidenceScore) { this.confidenceScore = confidenceScore; }
    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }
    public Instant getValidUntil() { return validUntil; }
    public void setValidUntil(Instant validUntil) { this.validUntil = validUntil; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
