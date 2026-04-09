package mls.sho.dms.entity.tableside;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.menu.ModifierOption;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;

/**
 * A single item in a guest's tableside cart, with modifiers stored as JSONB.
 *
 * JSONB is used for modifiers because:
 *   1. Cart items are transient and discarded after order submission.
 *   2. Avoids a separate cart_item_modifier join table whose only purpose is pre-submission state.
 *   3. GIN index on modifiers enables search if needed.
 *
 * After submission, the modifiers are decomposed back into OrderItemModifier rows on the main ticket.
 */
@Entity
@Table(
    name = "guest_cart_item",
    indexes = {
        @Index(name = "idx_cart_item_session_device", columnList = "session_id, device_fingerprint"),
        @Index(name = "idx_cart_item_menu_item",      columnList = "menu_item_id")
    }
)
public class GuestCartItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private TablesideSession session;

    /** Identifies which guest device added this item. Not a FK — opaque client fingerprint. */
    @Column(name = "device_fingerprint", nullable = false, length = 128)
    private String deviceFingerprint;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(name = "quantity", nullable = false)
    private int quantity = 1;

    /**
     * JSONB snapshot of selected modifier options (list of ModifierOption IDs and labels).
     * Stored as flexible JSON to avoid a separate join table for a transient cart state.
     * GIN-indexed for searches.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "modifiers", columnDefinition = "jsonb")
    private List<java.util.Map<String, Object>> modifiers;

    /** Custom free-text note from the guest. Max 100 chars enforced at application layer. */
    @Column(name = "custom_note", length = 100)
    private String customNote;

    public TablesideSession getSession() { return session; }
    public void setSession(TablesideSession session) { this.session = session; }
    public String getDeviceFingerprint() { return deviceFingerprint; }
    public void setDeviceFingerprint(String deviceFingerprint) { this.deviceFingerprint = deviceFingerprint; }
    public MenuItem getMenuItem() { return menuItem; }
    public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public List<java.util.Map<String, Object>> getModifiers() { return modifiers; }
    public void setModifiers(List<java.util.Map<String, Object>> modifiers) { this.modifiers = modifiers; }
    public String getCustomNote() { return customNote; }
    public void setCustomNote(String customNote) { this.customNote = customNote; }
}
