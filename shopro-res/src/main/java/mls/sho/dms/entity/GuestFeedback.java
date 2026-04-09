package mls.sho.dms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Guest feedback for NPS and service analysis.
 */
@Entity
@Table(name = "guest_feedback")
public class GuestFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "nps_score", nullable = false)
    private Integer npsScore; // 0-10

    @Column(name = "food_rating")
    private Integer foodRating; // 1-5

    @Column(name = "service_rating")
    private Integer serviceRating; // 1-5

    @Column(name = "ambience_rating")
    private Integer ambienceRating; // 1-5

    @Column(name = "complaint_category")
    private String complaintCategory; // FOOD_TEMP, SERVICE_SPEED, etc.

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "guest_name")
    private String guestName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Manual Accessors
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Integer getNpsScore() { return npsScore; }
    public void setNpsScore(Integer npsScore) { this.npsScore = npsScore; }
    public Integer getFoodRating() { return foodRating; }
    public void setFoodRating(Integer foodRating) { this.foodRating = foodRating; }
    public Integer getServiceRating() { return serviceRating; }
    public void setServiceRating(Integer serviceRating) { this.serviceRating = serviceRating; }
    public Integer getAmbienceRating() { return ambienceRating; }
    public void setAmbienceRating(Integer ambienceRating) { this.ambienceRating = ambienceRating; }
    public String getComplaintCategory() { return complaintCategory; }
    public void setComplaintCategory(String complaintCategory) { this.complaintCategory = complaintCategory; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
