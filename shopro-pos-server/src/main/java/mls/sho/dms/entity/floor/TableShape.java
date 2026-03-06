package mls.sho.dms.entity.floor;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.staff.StaffMember;

/**
 * Represents a physical table shape on the restaurant's floor plan.
 * Stores layout coordinates (x, y, width, height) for the drag-and-drop canvas.
 *
 * Indexes:
 *   - UNIQUE on (section_id, name): table names must be unique within a section.
 *   - idx_table_status: very frequent query — host scanning room availability.
 */
@Entity
@Table(
    name = "table_shape",
    indexes = {
        @Index(name = "uq_table_name_in_section", columnList = "section_id, name", unique = true),
        @Index(name = "idx_table_status",          columnList = "status")
    }
)
public class TableShape extends BaseEntity {

    @Column(name = "name", nullable = false, length = 20)
    private String name; // e.g., "T-12", "Bar-4"

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TableStatus status = TableStatus.AVAILABLE;

    /** X position on the floor plan canvas in logical units. */
    @Column(name = "pos_x", nullable = false)
    private int posX;

    /** Y position on the floor plan canvas in logical units. */
    @Column(name = "pos_y", nullable = false)
    private int posY;

    @Column(name = "width", nullable = false)
    private int width;

    @Column(name = "height", nullable = false)
    private int height;

    /** Shape type hint for the frontend renderer: RECTANGLE, CIRCLE, etc. */
    @Column(name = "shape_type", nullable = false, length = 20)
    private String shapeType = "RECTANGLE";

    /** NFC Tag ID for quick table selection (US-10.3). */
    @Column(name = "nfc_tag_id", unique = true, length = 64)
    private String nfcTagId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private StaffMember assignedStaff;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public Section getSection() { return section; }
    public void setSection(Section section) { this.section = section; }
    public TableStatus getStatus() { return status; }
    public void setStatus(TableStatus status) { this.status = status; }
    public int getPosX() { return posX; }
    public void setPosX(int posX) { this.posX = posX; }
    public int getPosY() { return posY; }
    public void setPosY(int posY) { this.posY = posY; }
    public int getWidth() { return width; }
    public void setWidth(int width) { this.width = width; }
    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }
    public String getShapeType() { return shapeType; }
    public void setShapeType(String shapeType) { this.shapeType = shapeType; }
    public String getNfcTagId() { return nfcTagId; }
    public void setNfcTagId(String nfcTagId) { this.nfcTagId = nfcTagId; }

    public StaffMember getAssignedStaff() { return assignedStaff; }
    public void setAssignedStaff(StaffMember assignedStaff) { this.assignedStaff = assignedStaff; }
}
