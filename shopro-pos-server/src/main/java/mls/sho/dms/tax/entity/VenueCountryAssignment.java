package mls.sho.dms.tax.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.time.Instant;
import java.util.UUID;

/**
 * Assigns a venue to a specific country's tax jurisdiction.
 */
@Entity
@Table(name = "venue_country_assignments")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VenueCountryAssignment extends BaseEntity {

    @Column(name = "venue_id", nullable = false, unique = true)
    private UUID venueId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "assigned_by", nullable = false)
    private UUID assignedBy;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt = Instant.now();

    public UUID getVenueId() { return venueId; }
    public void setVenueId(UUID venueId) { this.venueId = venueId; }
    public Country getCountry() { return country; }
    public void setCountry(Country country) { this.country = country; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public UUID getAssignedBy() { return assignedBy; }
    public void setAssignedBy(UUID assignedBy) { this.assignedBy = assignedBy; }
    public Instant getAssignedAt() { return assignedAt; }
    public void setAssignedAt(Instant assignedAt) { this.assignedAt = assignedAt; }
}
