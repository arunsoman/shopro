package mls.sho.dms.entity.menu;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * A named group of modifier choices for a menu item (e.g., "Meat Temperature", "Crust Type").
 * Can be marked required (Server must pick at least minSelections options before adding to ticket)
 * or optional (zero or more choices allowed).
 */
@Entity
@Table(name = "modifier_group")
public class ModifierGroup extends BaseEntity {

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    /** When true, the Server must select between minSelections and maxSelections options. */
    @Column(name = "required", nullable = false)
    private boolean required;

    @Column(name = "min_selections", nullable = false)
    private int minSelections = 0;

    @Column(name = "max_selections", nullable = false)
    private int maxSelections = 1;

    @OneToMany(mappedBy = "modifierGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private java.util.List<ModifierOption> options = new java.util.ArrayList<>();

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }

    public int getMinSelections() { return minSelections; }
    public void setMinSelections(int minSelections) { this.minSelections = minSelections; }

    public int getMaxSelections() { return maxSelections; }
    public void setMaxSelections(int maxSelections) { this.maxSelections = maxSelections; }

    public java.util.List<ModifierOption> getOptions() { return options; }
    
    public void addOption(ModifierOption option) {
        options.add(option);
        option.setModifierGroup(this);
    }

    public void removeOption(ModifierOption option) {
        options.remove(option);
        option.setModifierGroup(null);
    }
}
