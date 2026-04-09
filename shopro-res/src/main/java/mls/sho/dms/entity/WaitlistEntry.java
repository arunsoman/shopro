package mls.sho.dms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Waitlist entries for FOH management.
 */
@Entity(name = "ResWaitlistEntry")
@Table(name = "waitlist_entry")
public class WaitlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "guest_name", nullable = false)
    private String guestName;

    @Column(name = "party_size", nullable = false)
    private Integer partySize;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "quoted_wait_mins")
    private Integer quotedWaitMins;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Column(name = "seated_at")
    private LocalDateTime seatedAt;

    @Column(name = "abandoned_at")
    private LocalDateTime abandonedAt;

    @Enumerated(EnumType.STRING)
    private WaitlistStatus status = WaitlistStatus.WAITING;

    public enum WaitlistStatus { WAITING, SEATED, ABANDONED, CANCELLED }

    // Manual Accessors
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public Integer getPartySize() { return partySize; }
    public void setPartySize(Integer partySize) { this.partySize = partySize; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Integer getQuotedWaitMins() { return quotedWaitMins; }
    public void setQuotedWaitMins(Integer quotedWaitMins) { this.quotedWaitMins = quotedWaitMins; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    public LocalDateTime getSeatedAt() { return seatedAt; }
    public void setSeatedAt(LocalDateTime seatedAt) { this.seatedAt = seatedAt; }
    public LocalDateTime getAbandonedAt() { return abandonedAt; }
    public void setAbandonedAt(LocalDateTime abandonedAt) { this.abandonedAt = abandonedAt; }
    public WaitlistStatus getStatus() { return status; }
    public void setStatus(WaitlistStatus status) { this.status = status; }
}
