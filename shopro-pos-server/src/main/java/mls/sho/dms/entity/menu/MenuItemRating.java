package mls.sho.dms.entity.menu;

import jakarta.persistence.*;
import lombok.*;
import mls.sho.dms.entity.core.BaseEntity;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Stores guest feedback for specific menu items.
 */
@Entity
@Table(
    name = "menu_item_rating",
    indexes = {
        @Index(name = "idx_item_rating_item", columnList = "menu_item_id"),
        @Index(name = "idx_item_rating_order", columnList = "order_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemRating extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(name = "order_id", length = 50)
    private String orderId;

    @Column(nullable = false)
    private int rating; // 1-5

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
