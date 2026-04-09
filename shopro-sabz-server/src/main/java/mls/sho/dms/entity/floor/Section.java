package mls.sho.dms.entity.floor;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * Represents a named section/zone in the restaurant (e.g., "Main Dining", "Patio", "Bar").
 * Tables are assigned to sections for routing and server assignment purposes.
 */
@Entity
@Table(
    name = "section",
    indexes = {
        @Index(name = "uq_section_name", columnList = "name", unique = true)
    }
)
public class Section extends BaseEntity {

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
