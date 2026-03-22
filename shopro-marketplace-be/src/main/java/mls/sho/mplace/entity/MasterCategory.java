package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "master_category")
@Getter
@Setter
public class MasterCategory extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;

    @Column(name = "storage_condition")
    private String storageCondition; // e.g., AMBIENT, CHILLED, FROZEN

    @Column(name = "is_perishable")
    private boolean isPerishable;

    @Column(columnDefinition = "jsonb")
    private String attributes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private MasterCategory parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<MasterCategory> subCategories = new ArrayList<>();
}
