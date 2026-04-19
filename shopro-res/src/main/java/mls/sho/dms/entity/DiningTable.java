package mls.sho.dms.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Physical dining table on the floor plan.
 */
@Entity
@Table(name = "dining_table")
@Data
public class DiningTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "table_number")
    private String tableNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TableStatus status = TableStatus.AVAILABLE;

    @Column(name = "pos_x")
    private Integer posX;

    @Column(name = "pos_y")
    private Integer posY;

    public enum TableStatus { AVAILABLE, OCCUPIED, DIRTY, RESERVED }
}
