package mls.sho.dms.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Entry in the digital operations manual.
 */
@Entity
@Table(name = "operations_manual_entry")
@Data
public class OperationsManualEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category; // e.g. "Opening", "Closing", "Safety"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contentMarkdown;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
