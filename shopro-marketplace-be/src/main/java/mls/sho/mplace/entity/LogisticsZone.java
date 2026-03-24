package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Entity
@Table(name = "logistics_zone")
@Getter
@Setter
public class LogisticsZone extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hub_id", nullable = false)
    private Hub hub;

    @Column(name = "pincodes", columnDefinition = "JSONB")
    private String pincodes; // List of strings stored as JSONB
}
