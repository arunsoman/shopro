package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Entity representing a food item in the master catalog.
 * Matches table 'food' in V15__Add_Food.sql
 */
@Entity
@Table(name = "food")
@Getter
@Setter
public class Food {

    @Id
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(name = "name_scientific")
    private String nameScientific;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "food_group", length = 100)
    private String foodGroup;

    @Column(name = "food_subgroup", length = 100)
    private String foodSubgroup;
}
