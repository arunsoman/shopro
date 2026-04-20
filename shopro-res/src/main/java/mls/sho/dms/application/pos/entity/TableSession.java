package mls.sho.dms.application.pos.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.users.Guest;
import java.time.LocalDateTime;

/**
 * A session represents guests seated at a table.
 */
@Entity
@Table(name = "table_session")
@Getter @Setter
public class TableSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private DiningTable table;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "guest_count", nullable = false)
    private Integer guestCount;

    @Column(name = "opened_at", nullable = false)
    private LocalDateTime openedAt = LocalDateTime.now();

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "server_name")
    private String serverName;

    @Column(name = "server_role")
    private String serverRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL)
    private Order order;
}
