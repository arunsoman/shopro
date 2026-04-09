package mls.sho.dms.entity.inventory.ingredient;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "demand_forecast",
    indexes = {
        @Index(name = "idx_forecast_date", columnList = "forecast_date")
    }
)
public class DemandForecast extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private RawIngredient ingredient;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "projected_quantity", nullable = false, precision = 12, scale = 4)
    private BigDecimal projectedQuantity;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Column(name = "model_version", length = 20)
    private String modelVersion;

    public RawIngredient getIngredient() { return ingredient; }
    public void setIngredient(RawIngredient ingredient) { this.ingredient = ingredient; }
    public LocalDate getForecastDate() { return forecastDate; }
    public void setForecastDate(LocalDate forecastDate) { this.forecastDate = forecastDate; }
    public BigDecimal getProjectedQuantity() { return projectedQuantity; }
    public void setProjectedQuantity(BigDecimal projectedQuantity) { this.projectedQuantity = projectedQuantity; }
    public BigDecimal getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(BigDecimal confidenceScore) { this.confidenceScore = confidenceScore; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
}
