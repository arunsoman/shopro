package mls.sho.dms.entity.management;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Global restaurant settings for management reporting.
 */
@Entity
@Table(name = "management_profile")
public class ManagementProfile extends BaseEntity {

    @Column(name = "restaurant_name", nullable = false)
    private String restaurantName;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(name = "taxes_benefits_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal taxesBenefitsRate = new BigDecimal("0.22");

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public LocalDate getWeekStartDate() { return weekStartDate; }
    public void setWeekStartDate(LocalDate weekStartDate) { this.weekStartDate = weekStartDate; }

    public BigDecimal getTaxesBenefitsRate() { return taxesBenefitsRate; }
    public void setTaxesBenefitsRate(BigDecimal taxesBenefitsRate) { this.taxesBenefitsRate = taxesBenefitsRate; }
}
