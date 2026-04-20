package mls.sho.dms.application.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Detailed registry for all non-sales inventory loss (Misfires, Spoilage, etc).
 * Links a negative movement in the ledger to a specific kitchen reason.
 */
@Entity
@Table(name = "inventory_waste_registry")
@Data
public class InventoryWasteRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ledger_id", nullable = false)
    private InventoryIngredientLedger ledger;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "menu_id")
    private Long menuId;

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(name = "reason_code", nullable = false)
    private String reasonCode;

    @Column(name = "disposal_method")
    private String disposalMethod;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by")
    private String createdBy;
}
