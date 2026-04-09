package mls.sho.dms.application.kds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * [K] Physical or virtual outlet — a single kitchen location.
 * A restaurant may have one outlet (single site) or many
 * (food hall, ghost kitchen, multi-branch).
 *
 * Each outlet has its own set of stations and KDS devices.
 * Financially it rolls up to the Restaurant for prime cost.
 *
 * Redis scope: kds:{restaurantId}:outlet:{id}:*
 */
@Entity
@Table(name = "outlet",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"restaurant_id", "slug"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Outlet {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;                         // FK → restaurant.id

    @Column(nullable = false)
    private String name;                               // "Main Kitchen", "Bar", "Ghost Unit A"

    @Column(nullable = false, unique = false)
    private String slug;                               // "main", "bar", "ghost-a" — URL slug

    @Column(name = "timezone", nullable = false)
    private String timezone;                           // IANA, e.g. "America/New_York"

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "outlet", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<KdsStation> stations = new ArrayList<>();
}
